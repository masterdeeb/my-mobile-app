import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../components/Theme';
import TaskCard from '../components/TaskCard';
import Header from '../components/Header';
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

const INITIAL_CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance'];
const PRIORITIES: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

export default function FocusTaskApp() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: lang === 'en' ? 'Design Task App' : 'تصميم تطبيق المهام',
      description: lang === 'en' ? 'Create a modern UI' : 'إنشاء واجهة مستخدم حديثة',
      category: 'Work',
      completed: false,
      dueDate: new Date(),
      priority: 'high'
    },
    {
      id: '2',
      title: lang === 'en' ? 'Buy Groceries' : 'شراء البقالة',
      description: lang === 'en' ? 'Eggs, Milk, Coffee' : 'بيض، حليب، قهوة',
      category: 'Shopping',
      completed: true,
      dueDate: new Date(),
      priority: 'medium'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // New Task State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<string>(categories[0]);
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Manage Category State
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [categoryInput, setCategoryInput] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter === 'All' || task.category === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchQuery, selectedFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, progress };
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDesc,
      category: newCategory,
      completed: false,
      dueDate: new Date(),
      priority: newPriority,
    };
    setTasks([newTask, ...tasks]);
    setNewTitle('');
    setNewDesc('');
    setIsModalVisible(false);
  };

  const handleAddCategory = () => {
    if (!categoryInput.trim()) return;
    if (categories.includes(categoryInput.trim())) return;
    
    if (editingCategoryIndex !== null) {
      const oldName = categories[editingCategoryIndex];
      const newName = categoryInput.trim();
      const updatedCategories = [...categories];
      updatedCategories[editingCategoryIndex] = newName;
      setCategories(updatedCategories);
      
      setTasks(prev => prev.map(task => 
        task.category === oldName ? { ...task, category: newName } : task
      ));
      
      setEditingCategoryIndex(null);
    } else {
      setCategories([...categories, categoryInput.trim()]);
    }
    setCategoryInput('');
  };

  const deleteCategory = (index: number) => {
    const categoryToDelete = categories[index];
    Alert.alert(
      t.deleteConfirm,
      t.deleteCategoryWarning,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.save, 
          style: 'destructive',
          onPress: () => {
            const updatedCategories = categories.filter((_, i) => i !== index);
            setCategories(updatedCategories);
            setTasks(prev => prev.map(task => 
              task.category === categoryToDelete ? { ...task, category: t.general } : task
            ));
            if (selectedFilter === categoryToDelete) setSelectedFilter('All');
            if (newCategory === categoryToDelete) setNewCategory(updatedCategories[0] || t.general);
          }
        }
      ]
    );
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  };

  const dynamicStyles = StyleSheet.create({
    row: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    textAlign: {
      textAlign: isRTL ? 'right' : 'left',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Enhanced Header */}
      <Header 
        lang={lang} 
        onLanguageToggle={toggleLanguage} 
        stats={stats} 
      />

      {/* Search & Categories */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, dynamicStyles.row]}>
          <Ionicons name="search" size={20} color={Colors.textMuted} />
          <TextInput 
            style={[styles.searchInput, dynamicStyles.textAlign, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={[styles.filterScroll, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        >
          <TouchableOpacity 
            style={[styles.filterChip, selectedFilter === 'All' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('All')}
          >
            <Text style={[styles.filterChipText, selectedFilter === 'All' && styles.filterChipTextActive]}>
              {t.all}
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterChip, selectedFilter === cat && styles.filterChipActive]}
              onPress={() => setSelectedFilter(cat)}
            >
              <Text style={[styles.filterChipText, selectedFilter === cat && styles.filterChipTextActive]}>
                {INITIAL_CATEGORIES.includes(cat) ? (t.categories[cat as keyof typeof t.categories] || cat) : cat}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.manageChip}
            onPress={() => setIsCategoryModalVisible(true)}
          >
            <Ionicons name="settings-outline" size={16} color={Colors.primary} />
            <Text style={styles.manageChipText}>{t.categories.Manage}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard 
            task={item} 
            onToggle={toggleTask} 
            onDelete={deleteTask} 
            lang={lang}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={Colors.surfaceLight} />
            <Text style={styles.emptyText}>{t.noTasks}</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, isRTL ? { left: 30 } : { right: 30 }]} 
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Manage Categories Modal */}
      <Modal
        visible={isCategoryModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, dynamicStyles.row]}>
              <Text style={styles.modalTitle}>{t.manageCategories}</Text>
              <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.categoryInputContainer, dynamicStyles.row]}>
              <TextInput 
                style={[styles.input, { flex: 1 }, dynamicStyles.textAlign]}
                placeholder={t.categoryName}
                placeholderTextColor={Colors.textMuted}
                value={categoryInput}
                onChangeText={setCategoryInput}
              />
              <TouchableOpacity 
                style={styles.addCategoryBtn} 
                onPress={handleAddCategory}
              >
                <Ionicons 
                  name={editingCategoryIndex !== null ? "checkmark" : "add"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
              {categories.map((cat, index) => (
                <View key={cat} style={[styles.categoryItem, dynamicStyles.row]}>
                  <Text style={styles.categoryItemText}>
                    {INITIAL_CATEGORIES.includes(cat) ? (t.categories[cat as keyof typeof t.categories] || cat) : cat}
                  </Text>
                  <View style={dynamicStyles.row}>
                    <TouchableOpacity 
                      style={styles.categoryActionBtn}
                      onPress={() => {
                        setEditingCategoryIndex(index);
                        setCategoryInput(cat);
                      }}
                    >
                      <Ionicons name="pencil" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.categoryActionBtn}
                      onPress={() => deleteCategory(index)}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, dynamicStyles.row]}>
              <Text style={styles.modalTitle}>{t.newTask}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, dynamicStyles.textAlign]}>{t.title}</Text>
              <TextInput 
                style={[styles.input, dynamicStyles.textAlign]}
                placeholder={t.titlePlaceholder}
                placeholderTextColor={Colors.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={[styles.inputLabel, dynamicStyles.textAlign]}>{t.description}</Text>
              <TextInput 
                style={[styles.input, styles.textArea, dynamicStyles.textAlign]}
                placeholder={t.descriptionPlaceholder}
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                value={newDesc}
                onChangeText={setNewDesc}
              />

              <Text style={[styles.inputLabel, dynamicStyles.textAlign]}>{t.category}</Text>
              <View style={[styles.categoryPicker, dynamicStyles.row]}>
                {categories.map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.catOption, newCategory === cat && styles.catOptionActive]}
                    onPress={() => setNewCategory(cat)}
                  >
                    <Text style={[styles.catOptionText, newCategory === cat && styles.catOptionTextActive]}>
                      {INITIAL_CATEGORIES.includes(cat) ? (t.categories[cat as keyof typeof t.categories] || cat) : cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, dynamicStyles.textAlign]}>{t.priority}</Text>
              <View style={[styles.priorityPicker, dynamicStyles.row]}>
                {PRIORITIES.map(p => (
                  <TouchableOpacity 
                    key={p} 
                    style={[
                      styles.prioOption, 
                      newPriority === p && { backgroundColor: p === 'high' ? Colors.danger : p === 'medium' ? Colors.warning : Colors.success }
                    ]}
                    onPress={() => setNewPriority(p)}
                  >
                    <Text style={[styles.prioOptionText, newPriority === p && { color: 'white' }]}>
                      {t.priorities[p].toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.createBtn} onPress={addTask}>
                <Text style={styles.createBtnText}>{t.createTask}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  filterWrapper: {
    marginBottom: Spacing.md,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  manageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    gap: 6,
  },
  manageChipText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: Colors.textMuted,
    marginTop: Spacing.md,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  inputLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: 16,
  },
  categoryInputContainer: {
    gap: 8,
    marginBottom: Spacing.md,
  },
  addCategoryBtn: {
    backgroundColor: Colors.primary,
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  categoryItemText: {
    color: Colors.text,
    fontSize: 16,
  },
  categoryActionBtn: {
    padding: 8,
    marginLeft: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    flexWrap: 'wrap',
    gap: 8,
  },
  catOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  catOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catOptionText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  catOptionTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  priorityPicker: {
    gap: 12,
  },
  prioOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  prioOptionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textMuted,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  createBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

