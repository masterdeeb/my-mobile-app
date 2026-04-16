import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Dimensions, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const BUTTON_WIDTH = (width - 60) / 4;

export type ButtonType = 'number' | 'operator' | 'action' | 'scientific';

interface CalculatorButtonProps {
  label: string | React.ReactNode;
  onPress: (label: string) => void;
  type?: ButtonType;
  doubleWidth?: boolean;
  themeColor?: string;
  small?: boolean;
}

export const CalculatorButton = ({ 
  label, 
  onPress, 
  type = 'number', 
  doubleWidth = false,
  themeColor = '#FF9500',
  small = false
}: CalculatorButtonProps) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.92, { duration: 100 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    if (typeof label === 'string') {
      onPress(label);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      width: small ? (width - 80) / 5 : (doubleWidth ? BUTTON_WIDTH * 2 + 10 : BUTTON_WIDTH),
      height: small ? 50 : BUTTON_WIDTH,
      borderRadius: small ? 12 : (doubleWidth ? 40 : BUTTON_WIDTH / 2),
    };

    switch (type) {
      case 'operator':
        return { ...base, backgroundColor: themeColor };
      case 'action':
        return { ...base, backgroundColor: '#444' };
      case 'scientific':
        return { ...base, backgroundColor: '#2C2C2E' };
      default:
        return { ...base, backgroundColor: '#1C1C1E' };
    }
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontSize: small ? 16 : 28,
      fontWeight: '600',
    };

    switch (type) {
      case 'operator':
        return { ...base, color: '#FFFFFF' };
      case 'action':
        return { ...base, color: '#D4D4D2' };
      case 'scientific':
        return { ...base, color: themeColor };
      default:
        return { ...base, color: '#FFFFFF' };
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={handlePress}
        style={[styles.button, getButtonStyle()]}
      >
        <Text style={getTextStyle()}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
