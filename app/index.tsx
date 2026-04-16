import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Modal,
  Platform
} from 'react-native';
import { CalculatorButton, ButtonType } from '../components/CalculatorButton';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { format } from 'date-fns';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

type Theme = {
  name: string;
  primary: string;
  bg: string;
  text: string;
};

const THEMES: Theme[] = [
  { name: 'Elite Gold', primary: '#FFD700', bg: '#000000', text: '#FFFFFF' },
  { name: 'Deep Sea', primary: '#00D2FF', bg: '#001F3F', text: '#FFFFFF' },
  { name: 'Royal Purple', primary: '#BF94E4', bg: '#1A0B2E', text: '#FFFFFF' },
  { name: 'Emerald', primary: '#2ECC71', bg: '#0B2015', text: '#FFFFFF' },
];

export default function EliteCalculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<{expr: string, res: string, date: Date}[]>([]);
  const [isScientific, setIsScientific] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [showHistory, setShowHistory] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const speak = (text: string) => {
    if (!isMuted) {
      Speech.speak(text, { language: 'ar-SA', pitch: 1.0, rate: 1.0 });
    }
  };

  const handlePress = useCallback((value: string) => {
    if (value === 'AC') {
      setDisplay('0');
      setExpression('');
      return;
    }

    if (value === '⌫' || value === 'C') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
      return;
    }

    if (value === '=') {
      calculateResult();
      return;
    }

    const operators = ['+', '-', '×', '÷', '^'];
    if (operators.includes(value)) {
      setExpression(`${display} ${value} `);
      setDisplay('0');
      return;
    }

    // Scientific operations
    if (['sin', 'cos', 'tan', '√', 'log', 'ln', 'π', 'e'].includes(value)) {
      handleScientific(value);
      return;
    }

    if (display === '0') {
      setDisplay(value);
    } else {
      setDisplay(display + value);
    }
  }, [display, expression, isMuted]);

  const handleScientific = (op: string) => {
    const num = parseFloat(display);
    let res = 0;
    let expr = `${op}(${display})`;

    switch(op) {
      case 'sin': res = Math.sin(num * Math.PI / 180); break;
      case 'cos': res = Math.cos(num * Math.PI / 180); break;
      case 'tan': res = Math.tan(num * Math.PI / 180); break;
      case '√': res = Math.sqrt(num); break;
      case 'log': res = Math.log10(num); break;
      case 'ln': res = Math.log(num); break;
      case 'π': res = Math.PI; expr = 'π'; break;
      case 'e': res = Math.E; expr = 'e'; break;
    }

    const formattedRes = res.toFixed(6).replace(/\.?0+$/, '');
    setDisplay(formattedRes);
    setHistory(prev => [{ expr, res: formattedRes, date: new Date() }, ...prev]);
    speak(formattedRes);
  };

  const calculateResult = () => {
    try {
      let evalExpr = (expression + display)
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');
      
      const result = eval(evalExpr);
      const formattedResult = Number.isInteger(result) 
        ? result.toString() 
        : result.toFixed(6).replace(/\.?0+$/, '');

      setHistory(prev => [{ expr: expression + display, res: formattedResult, date: new Date() }, ...prev]);
      setDisplay(formattedResult);
      setExpression('');
      speak(formattedResult);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setDisplay('خطأ');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const toggleTheme = () => {
    const currentIndex = THEMES.findIndex(t => t.name === currentTheme.name);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setCurrentTheme(THEMES[nextIndex]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowHistory(true)}>
          <Ionicons name="time-outline" size={28} color={currentTheme.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>حاسبة MRD</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.iconBtn}>
            <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={24} color={currentTheme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
            <Ionicons name="color-palette-outline" size={24} color={currentTheme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={styles.expressionText}>{expression}</Text>
        <Text style={[styles.displayText, { color: currentTheme.text }]} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity 
          onPress={() => setIsScientific(!isScientific)}
          style={[styles.modeBtn, isScientific && { backgroundColor: currentTheme.primary + '33' }]}
        >
          <Text style={[styles.modeText, { color: isScientific ? currentTheme.primary : '#888' }]}>
            {isScientific ? 'الوضع العلمي' : 'الوضع العادي'}
          </Text>
          <MaterialCommunityIcons 
            name={isScientific ? "flask" : "calculator"} 
            size={20} 
            color={isScientific ? currentTheme.primary : '#888'} 
          />
        </TouchableOpacity>
      </View>

      {/* Button Grid */}
      <View style={styles.buttonGrid}>
        {isScientific && (
          <View style={styles.scientificRow}>
            <CalculatorButton label="sin" small type="scientific" themeColor={currentTheme.primary} onPress={handlePress} />
            <CalculatorButton label="cos" small type="scientific" themeColor={currentTheme.primary} onPress={handlePress} />
            <CalculatorButton label="tan" small type="scientific" themeColor={currentTheme.primary} onPress={handlePress} />
            <CalculatorButton label="√" small type="scientific" themeColor={currentTheme.primary} onPress={handlePress} />
            <CalculatorButton label="π" small type="scientific" themeColor={currentTheme.primary} onPress={handlePress} />
          </View>
        )}

        <View style={styles.row}>
          <CalculatorButton label="AC" type="action" onPress={handlePress} />
          <CalculatorButton label="⌫" type="action" onPress={handlePress} />
          <CalculatorButton label="%" type="action" onPress={handlePress} />
          <CalculatorButton label="÷" type="operator" themeColor={currentTheme.primary} onPress={handlePress} />
        </View>
        <View style={styles.row}>
          <CalculatorButton label="7" onPress={handlePress} />
          <CalculatorButton label="8" onPress={handlePress} />
          <CalculatorButton label="9" onPress={handlePress} />
          <CalculatorButton label="×" type="operator" themeColor={currentTheme.primary} onPress={handlePress} />
        </View>
        <View style={styles.row}>
          <CalculatorButton label="4" onPress={handlePress} />
          <CalculatorButton label="5" onPress={handlePress} />
          <CalculatorButton label="6" onPress={handlePress} />
          <CalculatorButton label="-" type="operator" themeColor={currentTheme.primary} onPress={handlePress} />
        </View>
        <View style={styles.row}>
          <CalculatorButton label="1" onPress={handlePress} />
          <CalculatorButton label="2" onPress={handlePress} />
          <CalculatorButton label="3" onPress={handlePress} />
          <CalculatorButton label="+" type="operator" themeColor={currentTheme.primary} onPress={handlePress} />
        </View>
        <View style={styles.row}>
          <CalculatorButton label="0" doubleWidth onPress={handlePress} />
          <CalculatorButton label="." onPress={handlePress} />
          <CalculatorButton label="=" type="operator" themeColor={currentTheme.primary} onPress={handlePress} />
        </View>
      </View>

      {/* History Modal */}
      <Modal visible={showHistory} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#1C1C1E' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>سجل العمليات</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Ionicons name="close-circle" size={32} color={currentTheme.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.historyList}>
              {history.length === 0 ? (
                <Text style={styles.noHistory}>لا يوجد عمليات سابقة</Text>
              ) : (
                history.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.historyItem}
                    onPress={() => {
                      setDisplay(item.res);
                      setShowHistory(false);
                    }}
                  >
                    <View>
                      <Text style={styles.histExpr}>{item.expr}</Text>
                      <Text style={[styles.histRes, { color: currentTheme.primary }]}>= {item.res}</Text>
                    </View>
                    <Text style={styles.histDate}>{format(item.date, 'HH:mm')}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity 
              style={[styles.clearBtn, { backgroundColor: currentTheme.primary }]}
              onPress={() => setHistory([])}
            >
              <Text style={styles.clearBtnText}>مسح السجل</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconBtn: {
    marginLeft: 15,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  expressionText: {
    color: '#888',
    fontSize: 24,
    marginBottom: 10,
  },
  displayText: {
    fontSize: 84,
    fontWeight: '200',
  },
  modeToggle: {
    paddingHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonGrid: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 12,
  },
  scientificRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 10,
    borderRadius: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: height * 0.7,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  historyList: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  histExpr: {
    color: '#888',
    fontSize: 16,
    textAlign: 'right',
  },
  histRes: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 5,
  },
  histDate: {
    color: '#555',
    fontSize: 12,
  },
  noHistory: {
    color: '#555',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  clearBtn: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  clearBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
