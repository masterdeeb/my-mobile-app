import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withTiming,
  withSequence
} from 'react-native-reanimated';

interface CellProps {
  value: 'X' | 'O' | null;
  onPress: () => void;
  isWinningCell: boolean;
  disabled: boolean;
}

// أشكال مرسومة برمجياً لتعمل 100% بدون إنترنت
const CustomX = () => (
  <View style={styles.shapeContainer}>
    <View style={[styles.xLine, { transform: [{ rotate: '45deg' }] }]} />
    <View style={[styles.xLine, { transform: [{ rotate: '-45deg' }] }]} />
  </View>
);

const CustomO = () => (
  <View style={styles.shapeContainer}>
    <View style={styles.oCircle} />
  </View>
);

export default function Cell({ value, onPress, isWinningCell, disabled }: CellProps) {
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
      pulse.value = 1;
    }
  }, [value]);

  useEffect(() => {
    if (isWinningCell) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        true
      );
    } else {
      pulse.value = 1;
    }
  }, [isWinningCell]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * pulse.value }
      ],
      opacity: opacity.value,
    };
  });

  return (
    <TouchableOpacity 
      style={[styles.cell, isWinningCell && styles.winningCell]} 
      onPress={onPress}
      disabled={disabled || value !== null}
      activeOpacity={0.7}
    >
      <Animated.View style={StyleSheet.flatten([styles.iconContainer, animatedStyle])}>
        {value === 'X' && <CustomX />}
        {value === 'O' && <CustomO />}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1.5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  winningCell: {
    backgroundColor: '#334155',
    borderColor: '#475569',
    borderWidth: 2,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shapeContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xLine: {
    position: 'absolute',
    width: 65,
    height: 8,
    backgroundColor: '#38BDF8',
    borderRadius: 4,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  oCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 8,
    borderColor: '#F472B6',
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  }
});
