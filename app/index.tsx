import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import Cell from '../components/Cell';
import ScoreBoard from '../components/ScoreBoard';

type Player = 'X' | 'O' | null;

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [isBotMode, setIsBotMode] = useState<boolean>(true); // الافتراضي اللعب ضد البوت

  const { width } = useWindowDimensions();
  const boardSize = Math.min(width * 0.9, 400);

  const resultOpacity = useSharedValue(0);
  const resultTranslateY = useSharedValue(20);

  useEffect(() => {
    if (winner) {
      resultOpacity.value = withTiming(1, { duration: 300 });
      resultTranslateY.value = withSpring(0, { damping: 12 });
    } else {
      resultOpacity.value = withTiming(0, { duration: 200 });
      resultTranslateY.value = withTiming(20, { duration: 200 });
    }
  }, [winner]);

  const resultAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: resultOpacity.value,
      transform: [{ translateY: resultTranslateY.value }]
    };
  });

  const checkWinner = (squares: Player[]) => {
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { player: squares[a], line: [a, b, c] };
      }
    }
    if (!squares.includes(null)) {
      return { player: 'Draw', line: [] };
    }
    return null;
  };

  const executeMove = useCallback((index: number, player: Player) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.player as Player | 'Draw');
      setWinningLine(result.line);
      
      if (result.player === 'X' || result.player === 'O') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScores(prev => ({ ...prev, [result.player as 'X' | 'O']: prev[result.player as 'X' | 'O'] + 1 }));
      } else if (result.player === 'Draw') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } else {
      setXIsNext(player === 'O'); // If O played, xIsNext = true. If X played, xIsNext = false.
    }
  }, [board]);

  const getBotMove = (squares: Player[]) => {
    // 1. محاولة الفوز
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      if (squares[a] === 'O' && squares[b] === 'O' && squares[c] === null) return c;
      if (squares[a] === 'O' && squares[c] === 'O' && squares[b] === null) return b;
      if (squares[b] === 'O' && squares[c] === 'O' && squares[a] === null) return a;
    }
    // 2. سد الطريق على الخصم
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      if (squares[a] === 'X' && squares[b] === 'X' && squares[c] === null) return c;
      if (squares[a] === 'X' && squares[c] === 'X' && squares[b] === null) return b;
      if (squares[b] === 'X' && squares[c] === 'X' && squares[a] === null) return a;
    }
    // 3. أخذ المركز إذا كان متاحاً
    if (squares[4] === null) return 4;
    
    // 4. أخذ الزوايا
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(c => squares[c] === null);
    if (availableCorners.length > 0) return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    
    // 5. أخذ الأطراف
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter(e => squares[e] === null);
    if (availableEdges.length > 0) return availableEdges[Math.floor(Math.random() * availableEdges.length)];

    return -1;
  };

  // تأثير البوت
  useEffect(() => {
    if (isBotMode && !xIsNext && !winner) {
      const timer = setTimeout(() => {
        const botIndex = getBotMove(board);
        if (botIndex !== -1) {
          executeMove(botIndex, 'O');
        }
      }, 600); // تأخير بسيط ليبدو اللعب طبيعياً
      return () => clearTimeout(timer);
    }
  }, [xIsNext, isBotMode, winner, board, executeMove]);

  const handleUserPress = useCallback((index: number) => {
    if (board[index] || winner) return;
    if (isBotMode && !xIsNext) return; // منع الضغط في دور البوت

    const currentPlayer = xIsNext ? 'X' : 'O';
    executeMove(index, currentPlayer);
  }, [board, winner, isBotMode, xIsNext, executeMove]);

  const resetGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setXIsNext(true);
  };

  const resetScores = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setScores({ X: 0, O: 0 });
    resetGame();
  };

  const changeMode = (toBotMode: boolean) => {
    if (toBotMode !== isBotMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsBotMode(toBotMode);
      resetScores();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>TIC TAC TOE</Text>
      </View>

      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, !isBotMode && styles.activeMode]}
          onPress={() => changeMode(false)}
        >
          <Text style={[styles.modeText, !isBotMode && styles.activeModeText]}>مع صديق</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, isBotMode && styles.activeMode]}
          onPress={() => changeMode(true)}
        >
          <Text style={[styles.modeText, isBotMode && styles.activeModeText]}>ضد البوت</Text>
        </TouchableOpacity>
      </View>

      <ScoreBoard scores={scores} xIsNext={xIsNext && !winner} isBotMode={isBotMode} />

      <View style={[styles.boardContainer, { width: boardSize, height: boardSize }]}>
        {board.map((cell, index) => (
          <Cell
            key={index}
            value={cell}
            onPress={() => handleUserPress(index)}
            isWinningCell={winningLine.includes(index)}
            disabled={!!winner}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Animated.View style={StyleSheet.flatten([styles.resultContainer, resultAnimatedStyle])}>
          <Text style={styles.resultText}>
            {winner === 'Draw' ? "النتيجة تعادل!" : `اللاعب ${winner} فاز!`}
          </Text>
        </Animated.View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={resetGame}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>إعادة اللعب</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={resetScores}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>تصفير النتيجة</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 6,
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modeButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  activeMode: {
    backgroundColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modeText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: 'bold',
  },
  activeModeText: {
    color: '#0F172A',
  },
  boardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: '#0F172A',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    height: 140,
  },
  resultContainer: {
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  resultText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#334155',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94A3B8',
  }
});
