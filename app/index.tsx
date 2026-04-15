import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  Easing
} from 'react-native-reanimated';
import Cell from '../components/Cell';
import {
  Player,
  GameMode,
  Difficulty,
  checkGameState,
  getAIMove,
} from '../utils/gameLogic';

const { width } = Dimensions.get('window');

// Calculate strict dimensions so squares render perfectly
const BOARD_SIZE = Math.min(width * 0.9, 400);
const GAP = 12;
const CELL_SIZE = (BOARD_SIZE - (GAP * 2)) / 3;

const INITIAL_BOARD: Player[] = Array(9).fill(null);

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameMode, setGameMode] = useState<GameMode>('PvAI');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isDraw, setIsDraw] = useState<boolean>(false);
  
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });
  const [isAITurn, setIsAITurn] = useState<boolean>(false);

  // Entrance Animation Values
  const boardOpacity = useSharedValue(0);
  const boardTranslateY = useSharedValue(50);

  useEffect(() => {
    boardOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    boardTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  const animatedBoardStyle = useAnimatedStyle(() => {
    return {
      opacity: boardOpacity.value,
      transform: [{ translateY: boardTranslateY.value }],
    };
  });

  // Handle a move (Human or AI)
  const handleMove = useCallback(
    (index: number) => {
      if (board[index] || winner || isDraw) return;

      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      setBoard(newBoard);

      const result = checkGameState(newBoard);
      
      if (result.winner) {
        setWinner(result.winner);
        setWinningLine(result.winningLine);
        setScores((prev) => ({ ...prev, [result.winner!]: prev[result.winner!] + 1 }));
      } else if (result.isDraw) {
        setIsDraw(true);
        setScores((prev) => ({ ...prev, Draws: prev.Draws + 1 }));
      } else {
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      }
    },
    [board, currentPlayer, winner, isDraw]
  );

  // AI Turn Effect
  useEffect(() => {
    if (gameMode === 'PvAI' && currentPlayer === 'O' && !winner && !isDraw) {
      setIsAITurn(true);
      
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, difficulty, 'O');
        if (aiMove !== -1) {
          handleMove(aiMove);
        }
        setIsAITurn(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, board, winner, isDraw, difficulty, handleMove]);

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
    setIsAITurn(false);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, Draws: 0 });
    resetGame();
  };

  const renderSegmentedControl = (
    options: string[],
    selectedValue: string,
    onSelect: (val: any) => void
  ) => (
    <View style={styles.segmentContainer}>
      {options.map((option) => {
        const isSelected = selectedValue === option;
        return (
          <Pressable
            key={option}
            style={[styles.segmentButton, isSelected && styles.segmentButtonActive]}
            onPress={() => {
              onSelect(option);
              resetGame();
            }}
          >
            <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>TIC TAC TOE</Text>
        
        {/* Settings Controls */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsLabel}>MODE</Text>
          {renderSegmentedControl(['PvAI', 'PvP'], gameMode, setGameMode)}
          
          {gameMode === 'PvAI' && (
            <>
              <Text style={styles.settingsLabel}>AI DIFFICULTY</Text>
              {renderSegmentedControl(['Easy', 'Medium', 'Hard', 'Impossible'], difficulty, setDifficulty)}
            </>
          )}
        </View>
      </View>

      {/* Game Status */}
      <View style={styles.statusContainer}>
        {winner ? (
          <Text style={styles.statusText}>
            <Text style={winner === 'X' ? styles.textX : styles.textO}>{winner}</Text> WINS!
          </Text>
        ) : isDraw ? (
          <Text style={styles.statusText}>IT'S A DRAW!</Text>
        ) : (
          <Text style={styles.statusText}>
            <Text style={currentPlayer === 'X' ? styles.textX : styles.textO}>{currentPlayer}</Text>'S TURN
          </Text>
        )}
      </View>

      {/* The Explicit Board Container with calculated squares */}
      <Animated.View style={StyleSheet.flatten([styles.boardContainer, animatedBoardStyle])}>
        <View style={StyleSheet.flatten([
          styles.board,
          { width: BOARD_SIZE, height: BOARD_SIZE }
        ])}>
          {board.map((cell, index) => (
            <Cell
              key={index}
              index={index}
              value={cell}
              onPress={handleMove}
              disabled={isAITurn || !!winner || isDraw}
              isWinningCell={winningLine?.includes(index) ?? false}
              size={CELL_SIZE}
            />
          ))}
        </View>
      </Animated.View>

      {/* Scoreboard */}
      <View style={styles.scoreBoard}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>PLAYER X</Text>
          <Text style={[styles.scoreValue, styles.textX]}>{scores.X}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>DRAWS</Text>
          <Text style={[styles.scoreValue, { color: '#94A3B8' }]}>{scores.Draws}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>{gameMode === 'PvAI' ? 'AI O' : 'PLAYER O'}</Text>
          <Text style={[styles.scoreValue, styles.textO]}>{scores.O}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.actionButton} onPress={resetGame}>
          <Ionicons name="refresh" size={24} color="#F8FAFC" />
          <Text style={styles.actionButtonText}>Play Again</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.secondaryButton]} onPress={resetScores}>
          <Ionicons name="trash-outline" size={24} color="#94A3B8" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 6,
    marginBottom: 20,
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  settingsGroup: {
    width: '100%',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 2,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    width: '90%',
    maxWidth: 400,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#F8FAFC',
  },
  statusContainer: {
    marginVertical: 10,
    height: 40,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 2,
  },
  textX: {
    color: '#38BDF8',
    textShadowColor: 'rgba(56, 189, 248, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  textO: {
    color: '#FB7185',
    textShadowColor: 'rgba(251, 113, 133, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  controls: {
    flexDirection: 'row',
    width: '90%',
    maxWidth: 400,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    flex: 0.2,
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.2,
  },
  actionButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
