import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from './Theme';
import { translations, Language } from '../constants/Translations';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  lang: Language;
}

const INITIAL_CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance'];

export default function TaskCard({ task, onToggle, onDelete, lang }: TaskCardProps) {
  const isRTL = lang === 'ar';
  const t = translations[lang];

  const priorityColor = {
    low: Colors.success,
    medium: Colors.warning,
    high: Colors.danger,
  }[task.priority];

  // Display name for category
  const displayCategory = INITIAL_CATEGORIES.includes(task.category) 
    ? (t.categories[task.category as keyof typeof t.categories] || task.category)
    : task.category;

  // Using native Intl for localization
  const formattedDate = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
  }).format(task.dueDate);

  return (
    <View style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <TouchableOpacity 
        style={[styles.checkbox, { [isRTL ? 'marginLeft' : 'marginRight']: Spacing.md }]} 
        onPress={() => onToggle(task.id)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={task.completed ? "checkbox" : "square-outline"} 
          size={24} 
          color={task.completed ? Colors.primary : Colors.textMuted} 
        />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={[
          styles.title, 
          task.completed && styles.titleCompleted, 
          { textAlign: isRTL ? 'right' : 'left' }
        ]}>
          {task.title}
        </Text>
        <Text style={[styles.description, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
          {task.description}
        </Text>
        <View style={[styles.footer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {t.priorities[task.priority].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {formattedDate}
          </Text>
          <Text style={styles.categoryText}>
            {isRTL ? ` • ${displayCategory}` : ` • ${displayCategory}`}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
  },
  content: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  description: {
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginHorizontal: Spacing.sm,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  categoryText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  deleteBtn: {
    padding: Spacing.sm,
  }
});
