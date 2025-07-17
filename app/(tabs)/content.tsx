import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useGameData } from '@/hooks/useGameData';
import { GameContent } from '@/types/game';
import { Plus, Trash2, MessageCircle, Zap, Filter, Package, Edit3 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function ContentScreen() {
  const { content, packages, settings, addContent, removeContent, updateContent, loading } = useGameData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContentText, setNewContentText] = useState('');
  const [newContentType, setNewContentType] = useState<'truth' | 'dare'>('truth');
  const [newContentLevel, setNewContentLevel] = useState(1);
  const [newContentPackage, setNewContentPackage] = useState('default');
  const [filterType, setFilterType] = useState<'all' | 'truth' | 'dare'>('all');
  const [filterLevel, setFilterLevel] = useState(0); // 0 = all levels
  const [filterPackage, setFilterPackage] = useState('all'); // 'all' = all packages
  const [editingContent, setEditingContent] = useState<GameContent | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContentText, setEditContentText] = useState('');
  const [editContentType, setEditContentType] = useState<'truth' | 'dare'>('truth');
  const [editContentLevel, setEditContentLevel] = useState(1);
  const [editContentPackage, setEditContentPackage] = useState('default');

  // Force refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset filters if selected package no longer exists
      if (filterPackage !== 'all' && !packages.find(p => p.id === filterPackage)) {
        setFilterPackage('all');
      }
    }, [packages, filterPackage])
  );

  // Reset filter if selected package no longer exists
  useEffect(() => {
    if (filterPackage !== 'all' && !packages.find(p => p.id === filterPackage)) {
      setFilterPackage('all');
    }
  }, [packages, filterPackage]);

  const handleAddContent = () => {
    if (newContentText.trim() === '') {
      Alert.alert('Invalid Content', 'Please enter valid content text.');
      return;
    }

    addContent(newContentType, newContentText.trim(), newContentLevel, newContentPackage);
    setNewContentText('');
    setShowAddModal(false);
  };

  const handleRemoveContent = (contentItem: GameContent) => {
    Alert.alert(
      'Remove Content',
      `Are you sure you want to remove this ${contentItem.type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => {
          removeContent(contentItem.id);
          console.log('Content removed:', contentItem.id);
        }},
      ]
    );
  };

  const handleEditContent = (contentItem: GameContent) => {
    setEditingContent(contentItem);
    setEditContentText(contentItem.text);
    setEditContentType(contentItem.type);
    setEditContentLevel(contentItem.level);
    setEditContentPackage(contentItem.packageId || 'default');
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editContentText.trim() === '' || !editingContent) {
      Alert.alert('Invalid Content', 'Please enter valid content text.');
      return;
    }

    // Update the content using the updateContent function
    updateContent(editingContent.id, {
      text: editContentText.trim(),
      type: editContentType,
      level: editContentLevel,
      packageId: editContentPackage,
    });
    
    setEditContentText('');
    setEditingContent(null);
    setShowEditModal(false);
  };

  const handleCancelEdit = () => {
    setEditContentText('');
    setEditingContent(null);
    setShowEditModal(false);
  };

  const getFilteredContent = () => {
    return content.filter(item => {
      const typeMatch = filterType === 'all' || item.type === filterType;
      const levelMatch = filterLevel === 0 || item.level === filterLevel;
      const packageMatch = filterPackage === 'all' || item.packageId === filterPackage;
      
      // Check if package is password protected and locked
      const pkg = packages.find(p => p.id === item.packageId);
      if (pkg?.isPasswordProtected && !pkg?.isUnlocked) {
        return false; // Don't show content from locked packages
      }
      
      return typeMatch && levelMatch && packageMatch;
    });
  };

  const getLevelName = (level: number) => {
    const levelObj = settings.levels.find(l => l.id === level);
    return levelObj?.name || `Level ${level}`;
  };

  const getLevelColor = (level: number) => {
    const levelObj = settings.levels.find(l => l.id === level);
    return levelObj?.color || '#8B5CF6';
  };

  const getPackageName = (packageId: string) => {
    const packageObj = packages.find(p => p.id === packageId);
    if (!packageObj) {
      // Handle legacy content that might not have packageId set
      if (!packageId || packageId === 'default') {
        const defaultPackage = packages.find(p => p.id === 'default');
        return defaultPackage ? defaultPackage.name : 'Classic';
      }
      return 'Unknown Package';
    }
    
    let name = packageObj.name;
    if (packageObj.isPasswordProtected) {
      name += packageObj.isUnlocked ? ' (Unlocked)' : ' (Locked)';
    }
    return name;
  };

  const renderContent = ({ item }: { item: GameContent }) => (
    <View style={styles.contentCard}>
      <View style={styles.contentHeader}>
        <View style={styles.contentTypeContainer}>
          <View style={[styles.typeIcon, { backgroundColor: item.type === 'truth' ? '#3B82F6' : '#EC4899' }]}>
            {item.type === 'truth' ? 
              <MessageCircle size={16} color="#FFFFFF" /> : 
              <Zap size={16} color="#FFFFFF" />
            }
          </View>
          <Text style={styles.contentType}>{item.type.toUpperCase()}</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.level) }]}>
          <Text style={styles.levelBadgeText}>{getLevelName(item.level)}</Text>
        </View>
      </View>
      <View style={styles.contentMeta}>
        <View style={styles.packageInfo}>
          <Package size={14} color="#6B7280" />
          <Text style={styles.packageText}>{getPackageName(item.packageId || 'default')}</Text>
        </View>
      </View>
      <Text style={styles.contentText}>{item.text}</Text>
      <View style={styles.contentActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditContent(item)}
        >
          <Edit3 size={18} color="#8B5CF6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveContent(item)}
        >
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const filteredContent = getFilteredContent();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Content</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'truth' && styles.filterButtonActive]}
            onPress={() => setFilterType('truth')}
          >
            <Text style={[styles.filterText, filterType === 'truth' && styles.filterTextActive]}>Truth</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'dare' && styles.filterButtonActive]}
            onPress={() => setFilterType('dare')}
          >
            <Text style={[styles.filterText, filterType === 'dare' && styles.filterTextActive]}>Dare</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, filterLevel === 0 && styles.filterButtonActive]}
            onPress={() => setFilterLevel(0)}
          >
            <Text style={[styles.filterText, filterLevel === 0 && styles.filterTextActive]}>All Levels</Text>
          </TouchableOpacity>
          {settings.levels.map(level => (
            <TouchableOpacity
              key={level.id}
              style={[styles.filterButton, filterLevel === level.id && styles.filterButtonActive]}
              onPress={() => setFilterLevel(level.id)}
            >
              <Text style={[styles.filterText, filterLevel === level.id && styles.filterTextActive]}>
                {level.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, filterPackage === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterPackage('all')}
          >
            <Text style={[styles.filterText, filterPackage === 'all' && styles.filterTextActive]}>All Packages</Text>
          </TouchableOpacity>
          {packages.map(pkg => {
            const isLocked = pkg.isPasswordProtected && !pkg.isUnlocked;
            return (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.filterButton, 
                filterPackage === pkg.id && styles.filterButtonActive,
                isLocked && styles.filterButtonDisabled,
              ]}
              onPress={() => {
                if (!isLocked) {
                  setFilterPackage(pkg.id);
                }
              }}
              disabled={isLocked}
            >
              <Text style={[styles.filterText, filterPackage === pkg.id && styles.filterTextActive]}>
                {pkg.icon} {pkg.name}
                {isLocked && (
                  <Text style={styles.lockIcon}> 🔒</Text>
                )}
              </Text>
            </TouchableOpacity>
          );
          })}
        </View>
      </View>

      <Text style={styles.contentCount}>
        {filteredContent.length} {filteredContent.length === 1 ? 'Item' : 'Items'}
      </Text>

      {filteredContent.length === 0 ? (
        <View style={styles.emptyState}>
          <Filter size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No Content Found</Text>
          <Text style={styles.emptyStateText}>
            Add some truths and dares to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredContent}
          renderItem={renderContent}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentList}
        />
      )}

      {/* Add Content Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <ScrollView 
                  contentContainerStyle={styles.modalScrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add New Content</Text>
                    
                    <View style={styles.typeSelector}>
                      <TouchableOpacity
                        style={[styles.typeButton, newContentType === 'truth' && styles.typeButtonActive]}
                        onPress={() => setNewContentType('truth')}
                      >
                        <MessageCircle size={20} color={newContentType === 'truth' ? '#FFFFFF' : '#3B82F6'} />
                        <Text style={[styles.typeButtonText, newContentType === 'truth' && styles.typeButtonTextActive]}>
                          Truth
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.typeButton, newContentType === 'dare' && styles.typeButtonActive]}
                        onPress={() => setNewContentType('dare')}
                      >
                        <Zap size={20} color={newContentType === 'dare' ? '#FFFFFF' : '#EC4899'} />
                        <Text style={[styles.typeButtonText, newContentType === 'dare' && styles.typeButtonTextActive]}>
                          Dare
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.levelSelector}>
                      <Text style={styles.levelSelectorTitle}>Level:</Text>
                      <View style={styles.levelButtons}>
                        {settings.levels.map(level => (
                          <TouchableOpacity
                            key={level.id}
                            style={[
                              styles.levelButton,
                              { backgroundColor: newContentLevel === level.id ? level.color : '#F3F4F6' }
                            ]}
                            onPress={() => setNewContentLevel(level.id)}
                          >
                            <Text style={[
                              styles.levelButtonText,
                              { color: newContentLevel === level.id ? '#FFFFFF' : '#6B7280' }
                            ]}>
                              {level.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.packageSelector}>
                      <Text style={styles.packageSelectorTitle}>Package:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.packageScrollView}>
                        <View style={styles.packageButtons}>
                          {packages.map(pkg => (
                            <TouchableOpacity
                              key={pkg.id}
                              style={[
                                styles.packageButton,
                                { 
                                  backgroundColor: newContentPackage === pkg.id ? pkg.color : '#F3F4F6',
                                  borderColor: newContentPackage === pkg.id ? pkg.color : '#E5E7EB',
                                }
                              ]}
                              onPress={() => setNewContentPackage(pkg.id)}
                            >
                              <Text style={styles.packageIcon}>{pkg.icon}</Text>
                              <Text style={[
                                styles.packageButtonText,
                                { color: newContentPackage === pkg.id ? '#FFFFFF' : '#6B7280' }
                              ]}>
                                {pkg.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    <TextInput
                      style={styles.modalInput}
                      placeholder={`Enter ${newContentType} text...`}
                      value={newContentText}
                      onChangeText={setNewContentText}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />

                    <View style={styles.modalButtons}>
                      <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.saveButton} onPress={handleAddContent}>
                        <Text style={styles.saveButtonText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit Content Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <ScrollView 
                  contentContainerStyle={styles.modalScrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit Content</Text>
                    
                    <View style={styles.typeSelector}>
                      <TouchableOpacity
                        style={[styles.typeButton, editContentType === 'truth' && styles.typeButtonActive]}
                        onPress={() => setEditContentType('truth')}
                      >
                        <MessageCircle size={20} color={editContentType === 'truth' ? '#FFFFFF' : '#3B82F6'} />
                        <Text style={[styles.typeButtonText, editContentType === 'truth' && styles.typeButtonTextActive]}>
                          Truth
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.typeButton, editContentType === 'dare' && styles.typeButtonActive]}
                        onPress={() => setEditContentType('dare')}
                      >
                        <Zap size={20} color={editContentType === 'dare' ? '#FFFFFF' : '#EC4899'} />
                        <Text style={[styles.typeButtonText, editContentType === 'dare' && styles.typeButtonTextActive]}>
                          Dare
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.levelSelector}>
                      <Text style={styles.levelSelectorTitle}>Level:</Text>
                      <View style={styles.levelButtons}>
                        {settings.levels.map(level => (
                          <TouchableOpacity
                            key={level.id}
                            style={[
                              styles.levelButton,
                              { backgroundColor: editContentLevel === level.id ? level.color : '#F3F4F6' }
                            ]}
                            onPress={() => setEditContentLevel(level.id)}
                          >
                            <Text style={[
                              styles.levelButtonText,
                              { color: editContentLevel === level.id ? '#FFFFFF' : '#6B7280' }
                            ]}>
                              {level.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.packageSelector}>
                      <Text style={styles.packageSelectorTitle}>Package:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.packageScrollView}>
                        <View style={styles.packageButtons}>
                          {packages.map(pkg => (
                            <TouchableOpacity
                              key={pkg.id}
                              style={[
                                styles.packageButton,
                                { 
                                  backgroundColor: editContentPackage === pkg.id ? pkg.color : '#F3F4F6',
                                  borderColor: editContentPackage === pkg.id ? pkg.color : '#E5E7EB',
                                }
                              ]}
                              onPress={() => setEditContentPackage(pkg.id)}
                            >
                              <Text style={styles.packageIcon}>{pkg.icon}</Text>
                              <Text style={[
                                styles.packageButtonText,
                                { color: editContentPackage === pkg.id ? '#FFFFFF' : '#6B7280' }
                              ]}>
                                {pkg.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    <TextInput
                      style={styles.modalInput}
                      placeholder={`Enter ${editContentType} text...`}
                      value={editContentText}
                      onChangeText={setEditContentText}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />

                    <View style={styles.modalButtons}>
                      <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
  },
  lockIcon: {
    fontSize: 12,
    opacity: 0.7,
  },
  contentCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  contentList: {
    paddingBottom: 20,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  contentType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contentMeta: {
    marginBottom: 8,
  },
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  contentText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  contentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  typeButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  levelSelector: {
    marginBottom: 20,
  },
  levelSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  levelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  packageSelector: {
    marginBottom: 20,
  },
  packageSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  packageScrollView: {
    flexGrow: 0,
  },
  packageButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  packageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    minWidth: 80,
  },
  packageIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  packageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
    maxHeight: 120,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});