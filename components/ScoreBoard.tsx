import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreBoardProps {
  scores: { X: number; O: number };
  xIsNext: boolean;
  isBotMode: boolean;
}

export default function ScoreBoard({ scores, xIsNext, isBotMode }: ScoreBoardProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.playerCard, xIsNext && styles.activePlayerCard]}>
        <Text style={[styles.playerName, styles.playerX]}>اللاعب X</Text>
        <Text style={styles.score}>{scores.X}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={[styles.playerCard, !xIsNext && styles.activePlayerCard]}>
        <Text style={[styles.playerName, styles.playerO]}>
          {isBotMode ? 'البوت O' : 'اللاعب O'}
        </Text>
        <Text style={styles.score}>{scores.O}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 12,
    marginBottom: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  playerCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  activePlayerCard: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  playerX: {
    color: '#38BDF8',
    textShadowColor: 'rgba(56, 189, 248, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  playerO: {
    color: '#F472B6',
    textShadowColor: 'rgba(244, 114, 182, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  score: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  divider: {
    width: 2,
    height: '50%',
    backgroundColor: '#334155',
    marginHorizontal: 10,
    borderRadius: 2,
  }
});
