import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Player } from '../utils/gameLogic';

interface CellProps {
  index: number;
  value: Player;
  onPress: (index: number) => void;
  disabled: boolean;
  isWinningCell: boolean;
  size: number; // Added to strictly control the square's dimensions
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Cell({ index, value, onPress, disabled, isWinningCell, size }: CellProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (value) {
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [value, scale, opacity]);

  useEffect(() => {
    if (isWinningCell) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1, { duration: 300 });
    }
  }, [isWinningCell, pulse]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: isWinningCell 
        ? (value === 'X' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(251, 113, 133, 0.25)') 
        : '#1E293B', // Solid background so the square is always clearly visible
      transform: [{ scale: isWinningCell ? pulse.value : 1 }],
      borderColor: isWinningCell 
        ? (value === 'X' ? '#38BDF8' : '#FB7185') 
        : '#334155',
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const textStyle = value === 'X' ? styles.textX : styles.textO;

  return (
    <AnimatedPressable
      style={StyleSheet.flatten([
        styles.cell,
        {
          width: size,
          height: size,
        },
        animatedContainerStyle
      ])}
      onPress={() => onPress(index)}
      disabled={disabled || value !== null}
    >
      <Animated.Text
        style={StyleSheet.flatten([
          styles.text,
          textStyle,
          animatedTextStyle,
        ])}
      >
        {value}
      </Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontSize: 54,
    fontWeight: '900',
    fontFamily: 'System',
  },
  textX: {
    color: '#38BDF8',
    textShadowColor: 'rgba(56, 189, 248, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  textO: {
    color: '#FB7185',
    textShadowColor: 'rgba(251, 113, 133, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
