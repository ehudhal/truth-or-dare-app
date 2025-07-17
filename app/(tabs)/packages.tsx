import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useGameData } from '@/hooks/useGameData';
import { ContentPackage } from '@/types/game';
import { Plus, Trash2, Package, Settings as SettingsIcon, Check, Lock, Clock as Unlock, Eye, EyeOff, CreditCard as Edit3 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

const EMOJI_OPTIONS = ['🎯', '🚗', '🏕️', '🎉', '👨‍👩‍👧‍👦', '🏖️', '🎮', '🍕', '🎭', '🌟', '🔥', '💎', '🎪', '🎨', '🎵', '⚡', '🌈', '🎲'];
const COLOR_OPTIONS = ['#8B5CF6', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#A855F7', '#F97316', '#14B8A6', '#F43F5E'];

export default function PackagesScreen() {
  const { packages, content, settings, addPackage, removePackage, updatePackage, unlockPackage, lockPackage, saveSettings, loading } = useGameData();
  
  // Ensure packages is always an array to prevent crashes
  const safePackages = packages || [];
  const safeContent = content || [];
  const safeSettings = settings || { selectedPackages: [] };
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedPackageForUnlock, setSelectedPackageForUnlock] = useState<ContentPackage | null>(null);
  const [selectedPackageForEdit, setSelectedPackageForEdit] = useState<ContentPackage | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackageDescription, setNewPackageDescription] = useState('');
  const [newPackageIcon, setNewPackageIcon] = useState('🎯');
  const [newPackageColor, setNewPackageColor] = useState('#8B5CF6');
  const [editPackageName, setEditPackageName] = useState('');
  const [editPackageDescription, setEditPackageDescription] = useState('');
  const [editPackageIcon, setEditPackageIcon] = useState('🎯');
  const [editPackageColor, setEditPackageColor] = useState('#8B5CF6');

  // Force refresh when screen comes into focus to ensure latest data
  useFocusEffect(
    useCallback(() => {
      // This will trigger a re-render with the latest packages data
    }, [packages])
  );

  const handleAddPackage = () => {
    if (newPackageName.trim() === '') {
      Alert.alert('Invalid Name', 'Please enter a valid package name.');
      return;
    }

    if (safePackages.some(p => p.name.toLowerCase() === newPackageName.toLowerCase())) {
      Alert.alert('Duplicate Name', 'A package with this name already exists.');
      return;
    }

    addPackage(newPackageName.trim(), newPackageDescription.trim(), newPackageIcon, newPackageColor);
    setNewPackageName('');
    setNewPackageDescription('');
    setNewPackageIcon('🎯');
    setNewPackageColor('#8B5CF6');
    setShowAddModal(false);
    
    // Show success message
    Alert.alert('Success', 'Package created successfully! It has been automatically selected and is ready to use.');
  };

  const handleEditPackage = () => {
    if (!selectedPackageForEdit) return;

    if (editPackageName.trim() === '') {
      Alert.alert('Invalid Name', 'Please enter a valid package name.');
      return;
    }

    if (safePackages.some(p => p.id !== selectedPackageForEdit.id && p.name.toLowerCase() === editPackageName.toLowerCase())) {
      Alert.alert('Duplicate Name', 'A package with this name already exists.');
      return;
    }

    updatePackage(selectedPackageForEdit.id, {
      name: editPackageName.trim(),
      description: editPackageDescription.trim(),
      icon: editPackageIcon,
      color: editPackageColor,
    });

    setShowEditModal(false);
    setSelectedPackageForEdit(null);
  };

  const openEditModal = (pkg: ContentPackage) => {
    if (pkg.isDefault) {
      Alert.alert('Cannot Edit', 'Built-in packages cannot be edited.');
      return;
    }

    setSelectedPackageForEdit(pkg);
    setEditPackageName(pkg.name);
    setEditPackageDescription(pkg.description);
    setEditPackageIcon(pkg.icon);
    setEditPackageColor(pkg.color);
    setShowEditModal(true);
  };

  const handleRemovePackage = (pkg: ContentPackage) => {
    if (pkg.isDefault) {
      Alert.alert('Cannot Remove', 'Built-in packages cannot be removed.');
      return;
    }

    const contentCount = safeContent.filter(c => c.packageId === pkg.id).length;
    
    const warningMessage = `Are you sure you want to remove "${pkg.name}"? This will also remove ${contentCount} content items.`;
    
    Alert.alert(
      'Remove Package',
      warningMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removePackage(pkg.id) },
      ]
    );
  };

  const togglePackageSelection = (packageId: string) => {
    // Check if package is locked
    const pkg = packages.find(p => p.id === packageId);
    if (pkg?.isPasswordProtected && !pkg?.isUnlocked) {
      Alert.alert('Package Locked', 'This package is password protected. Please unlock it first to use its content.');
      return;
    }

    const currentSelectedPackages = safeSettings.selectedPackages || [];
    const newSelectedPackages = currentSelectedPackages.includes(packageId)
      ? currentSelectedPackages.filter(id => id !== packageId)
      : [...currentSelectedPackages, packageId];
    
    // Ensure at least one package is always selected
    if (newSelectedPackages.length === 0) {
      // Find the first unlocked package to select
      const firstUnlockedPackage = safePackages.find(p => !p.isPasswordProtected || p.isUnlocked);
      if (firstUnlockedPackage) {
        newSelectedPackages.push(firstUnlockedPackage.id);
      } else {
        // Fallback to default if no unlocked packages
        newSelectedPackages.push('default');
      }
    }

    saveSettings({
      ...safeSettings,
      selectedPackages: newSelectedPackages,
    });
  };

  const getTimeUntilExpiry = (unlockedAt?: number) => {
    if (!unlockedAt) return '';
    
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const timeLeft = oneDayMs - (now - unlockedAt);
    
    if (timeLeft <= 0) return 'expired';
    
    const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m`;
    } else {
      return `${minutesLeft}m`;
    }
  };

  const handleLockUnlock = (pkg: ContentPackage) => {
    if (!pkg.isPasswordProtected) {
      Alert.alert('No Password Protection', 'This package is not password protected. Go to Settings to set up password protection.');
      return;
    }

    if (pkg.isUnlocked) {
      // Lock the package
      Alert.alert(
        'Lock Package',
        `Are you sure you want to lock "${pkg.name}"? You'll need to enter the password again to unlock it.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Lock',
            onPress: () => {
              lockPackage(pkg.id);
              Alert.alert('Success', 'Package has been locked.');
            }
          },
        ]
      );
    } else {
      // Show unlock modal
      setSelectedPackageForUnlock(pkg);
      setPasswordInput('');
      setShowPassword(false);
      setShowUnlockModal(true);
    }
  };

  const handleUnlockPackage = () => {
    if (!selectedPackageForUnlock) return;

    setPasswordInput('');
    setShowPassword(false);

    if (passwordInput.trim() === '') {
      Alert.alert('Invalid Password', 'Please enter a valid password.');
      return;
    }

    const success = unlockPackage(selectedPackageForUnlock.id, passwordInput.trim());
    
    if (success) {
      setShowUnlockModal(false);
      setSelectedPackageForUnlock(null);
      Alert.alert('Success', 'Package has been unlocked and will automatically lock again tomorrow.');
    } else {
      Alert.alert('Incorrect Password', 'The password you entered is incorrect. Please try again.');
      return;
    }
  };

  const getContentCount = (packageId: string) => {
    return safeContent.filter(c => c.packageId === packageId).length;
  };

  const renderPackage = ({ item: pkg }: { item: ContentPackage }) => {
    const isSelected = (safeSettings.selectedPackages || []).includes(pkg.id);
    const isLocked = pkg.isPasswordProtected && !pkg.isUnlocked;
    const contentCount = getContentCount(pkg.id);

    return (
      <View style={[
        styles.packageCard, 
        { 
          borderColor: isSelected ? pkg.color : '#E5E7EB',
          opacity: isLocked ? 0.7 : 1
        }
      ]}>
        <TouchableOpacity
          style={styles.packageContent}
          onPress={() => togglePackageSelection(pkg.id)}
        >
          <View style={styles.packageHeader}>
            <View style={styles.packageInfo}>
              <Text style={styles.packageIcon}>{pkg.icon}</Text>
              <View style={styles.packageDetails}>
                <Text style={styles.packageName}>{pkg.name}</Text>
                <Text style={styles.packageDescription}>{pkg.description}</Text>
                <Text style={styles.packageStats}>
                  {contentCount} {contentCount === 1 ? 'item' : 'items'}
                </Text>
              </View>
            </View>
            <View style={styles.packageActions}>
              {isSelected && !isLocked && (
                <View style={[styles.selectedBadge, { backgroundColor: pkg.color }]}>
                  <Check size={16} color="#FFFFFF" />
                </View>
              )}
              {isLocked && (
                <View style={styles.lockedBadge}>
                  <Lock size={16} color="#EF4444" />
                </View>
              )}
              {pkg.isPasswordProtected && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLockUnlock(pkg)}
                >
                  {pkg.isUnlocked ? (
                    <Unlock size={16} color="#10B981" />
                  ) : (
                    <Lock size={16} color="#EF4444" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.editPackageButton}
            onPress={() => openEditModal(pkg)}
            disabled={pkg.isDefault}
          >
            <Edit3 size={16} color={pkg.isDefault ? "#D1D5DB" : "#6B7280"} />
          </TouchableOpacity>
        </TouchableOpacity>
        
        {pkg.isPasswordProtected && (
          <View style={styles.passwordIndicator}>
            {pkg.isUnlocked ? (
              <>
                <Unlock size={12} color="#10B981" />
                <Text style={[styles.passwordProtectedText, { color: '#10B981' }]}>
                  Unlocked ({getTimeUntilExpiry(pkg.unlockedAt)} left)
                </Text>
              </>
            ) : (
              <>
                <Lock size={12} color="#EF4444" />
                <Text style={[styles.passwordProtectedText, { color: '#EF4444' }]}>Locked</Text>
              </>
            )}
          </View>
        )}
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemovePackage(pkg)}
          disabled={pkg.isDefault}
        >
          <Trash2 size={18} color={pkg.isDefault ? "#D1D5DB" : "#EF4444"} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Content Packages</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <SettingsIcon size={20} color="#8B5CF6" />
        <Text style={styles.infoText}>
          Select packages to include their content in your game. Tap the lock icon to unlock password-protected packages.
        </Text>
      </View>

      <Text style={styles.packagesCount}>
        {safePackages.length} {safePackages.length === 1 ? 'Package' : 'Packages'} • {(safeSettings.selectedPackages || []).length} Selected
      </Text>

      {safePackages.length === 0 ? (
        <View style={styles.emptyState}>
          <Package size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No Packages Yet</Text>
          <Text style={styles.emptyStateText}>
            Create content packages to organize your truths and dares!
          </Text>
        </View>
      ) : (
        <FlatList
          data={safePackages}
          renderItem={renderPackage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.packagesList}
        />
      )}

      {/* Add Package Modal */}
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
                    <Text style={styles.modalTitle}>Create New Package</Text>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Package Name</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="e.g., Beach Day"
                        value={newPackageName}
                        onChangeText={setNewPackageName}
                        returnKeyType="next"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Description</Text>
                      <TextInput
                        style={[styles.modalInput, styles.descriptionInput]}
                        placeholder="Describe when to use this package..."
                        value={newPackageDescription}
                        onChangeText={setNewPackageDescription}
                        multiline
                        numberOfLines={2}
                        textAlignVertical="top"
                        returnKeyType="done"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Icon</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScrollView}>
                        <View style={styles.emojiSelector}>
                          {EMOJI_OPTIONS.map(emoji => (
                            <TouchableOpacity
                              key={emoji}
                              style={[
                                styles.emojiOption,
                                { backgroundColor: newPackageIcon === emoji ? '#F3F4F6' : 'transparent' }
                              ]}
                              onPress={() => setNewPackageIcon(emoji)}
                            >
                              <Text style={styles.emojiText}>{emoji}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Color</Text>
                      <View style={styles.colorSelector}>
                        {COLOR_OPTIONS.map(color => (
                          <TouchableOpacity
                            key={color}
                            style={[
                              styles.colorOption,
                              { backgroundColor: color },
                              newPackageColor === color && styles.colorOptionSelected
                            ]}
                            onPress={() => setNewPackageColor(color)}
                          />
                        ))}
                      </View>
                    </View>

                    <View style={styles.modalButtons}>
                      <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.saveButton, { backgroundColor: newPackageColor }]} onPress={handleAddPackage}>
                        <Text style={styles.saveButtonText}>Create Package</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit Package Modal */}
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
                    <Text style={styles.modalTitle}>Edit Package</Text>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Package Name</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="e.g., Beach Day"
                        value={editPackageName}
                        onChangeText={setEditPackageName}
                        returnKeyType="next"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Description</Text>
                      <TextInput
                        style={[styles.modalInput, styles.descriptionInput]}
                        placeholder="Describe when to use this package..."
                        value={editPackageDescription}
                        onChangeText={setEditPackageDescription}
                        multiline
                        numberOfLines={2}
                        textAlignVertical="top"
                        returnKeyType="done"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Icon</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScrollView}>
                        <View style={styles.emojiSelector}>
                          {EMOJI_OPTIONS.map(emoji => (
                            <TouchableOpacity
                              key={emoji}
                              style={[
                                styles.emojiOption,
                                { backgroundColor: editPackageIcon === emoji ? '#F3F4F6' : 'transparent' }
                              ]}
                              onPress={() => setEditPackageIcon(emoji)}
                            >
                              <Text style={styles.emojiText}>{emoji}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Color</Text>
                      <View style={styles.colorSelector}>
                        {COLOR_OPTIONS.map(color => (
                          <TouchableOpacity
                            key={color}
                            style={[
                              styles.colorOption,
                              { backgroundColor: color },
                              editPackageColor === color && styles.colorOptionSelected
                            ]}
                            onPress={() => setEditPackageColor(color)}
                          />
                        ))}
                      </View>
                    </View>

                    <View style={styles.modalButtons}>
                      <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.saveButton, { backgroundColor: editPackageColor }]} onPress={handleEditPackage}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Unlock Package Modal */}
      <Modal
        visible={showUnlockModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUnlockModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    Unlock Package
                  </Text>
                  
                  <View style={styles.unlockInfo}>
                    <Lock size={24} color="#EF4444" />
                    <Text style={styles.unlockText}>
                      Enter the password to unlock "{selectedPackageForUnlock?.name}". The package will automatically lock again tomorrow.
                    </Text>
                  </View>
                  
                  <View style={styles.passwordInputContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.passwordInputWrapper}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter password"
                        value={passwordInput}
                        onChangeText={setPasswordInput}
                        secureTextEntry={!showPassword}
                        returnKeyType="done"
                        onSubmitEditing={handleUnlockPackage}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="#6B7280" />
                        ) : (
                          <Eye size={20} color="#6B7280" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setShowUnlockModal(false)}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#10B981' }]} onPress={handleUnlockPackage}>
                      <Text style={styles.saveButtonText}>Unlock</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EDE9FE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6B46C1',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  packagesCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  packagesList: {
    paddingBottom: 20,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageContent: {
    padding: 16,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  packageIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  packageDetails: {
    flex: 1,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  packageStats: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  packageActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  editPackageButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  descriptionInput: {
    minHeight: 60,
    maxHeight: 80,
  },
  emojiScrollView: {
    flexGrow: 0,
  },
  emojiSelector: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emojiText: {
    fontSize: 20,
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#1F2937',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
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
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  unlockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  unlockText: {
    fontSize: 14,
    color: '#B91C1C',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  passwordInputContainer: {
    marginBottom: 16,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  passwordIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  passwordProtectedText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});