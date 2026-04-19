import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from './Theme';
import { translations, Language } from '../constants/Translations';

interface HeaderProps {
  lang: Language;
  onLanguageToggle: () => void;
  stats: {
    total: number;
    completed: number;
    progress: number;
  };
}

export default function Header({ lang, onLanguageToggle, stats }: HeaderProps) {
  const t = translations[lang];
  const isRTL = lang === 'ar';
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 18) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  // Using native Intl for better compatibility in Expo/Snack environments
  const todayStr = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <View style={styles.container}>
      <View style={[styles.topRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.userInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.avatarContainer, { [isRTL ? 'marginLeft' : 'marginRight']: Spacing.sm }]}>
             <Ionicons name="person-circle" size={44} color={Colors.primary} />
          </View>
          <View>
            <Text style={[styles.greeting, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getGreeting()} 👋
            </Text>
            <Text style={[styles.date, { textAlign: isRTL ? 'right' : 'left' }]}>
              {todayStr}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.langToggle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} 
          onPress={onLanguageToggle}
          activeOpacity={0.7}
        >
          <Ionicons name="language" size={18} color={Colors.primary} />
          <Text style={[styles.langText, { [isRTL ? 'marginRight' : 'marginLeft']: 6 }]}>
            {lang === 'en' ? 'العربية' : 'EN'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.statsCard, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.statsInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={styles.statsTitle}>{t.appName}</Text>
          <Text style={styles.statsSubtitle}>
            {isRTL 
                ? t.tasksCompleted.replace('{completed}', stats.completed.toString()).replace('{total}', stats.total.toString())
                : `${stats.completed} ${t.tasksCompleted.replace('{total}', stats.total.toString())}`
            }
          </Text>
        </View>
        
        <View style={styles.progressCircleContainer}>
          <View style={styles.progressBackground}>
             <View style={[styles.progressFill, { width: `${stats.progress}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{Math.round(stats.progress)}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  userInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  date: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: 'bold',
  },
  langToggle: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  langText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statsInfo: {
    flex: 1,
  },
  statsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statsSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  progressCircleContainer: {
    width: 80,
    alignItems: 'flex-end',
  },
  progressBackground: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  progressPercent: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
