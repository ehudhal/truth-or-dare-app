import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useGameData } from '@/hooks/useGameData';
import { GameLevel, ContentPackage } from '@/types/game';
import { Settings as SettingsIcon, Palette, Users, RotateCcw, Package, Lock, Eye, EyeOff, Shield, Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function SettingsScreen() {
  const { packages, settings, saveSettings, updatePackagePassword, resetAppData, loading } = useGameData();
  const [levels, setLevels] = useState<GameLevel[]>(settings.levels);
  const [selectedLevel, setSelectedLevel] = useState(settings.selectedLevel);
  const [autoAdvancePlayer, setAutoAdvancePlayer] = useState(settings.autoAdvancePlayer);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [editingPackagePassword, setEditingPackagePassword] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Force refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Update local state with latest data
      setLevels(settings.levels);
      setSelectedLevel(settings.selectedLevel);
      setAutoAdvancePlayer(settings.autoAdvancePlayer);
    }, [settings])
  );

  // Update local state when settings change
  useEffect(() => {
    setLevels(settings.levels);
    setSelectedLevel(settings.selectedLevel);
    setAutoAdvancePlayer(settings.autoAdvancePlayer);
  }, [settings]);

  const handleSave = () => {
    const newSettings = {
      ...settings,
      levels,
      selectedLevel,
      autoAdvancePlayer,
    };
    saveSettings(newSettings);
    Alert.alert('Success', 'Settings saved successfully!');
  };

  const handleLevelNameChange = (levelId: number, newName: string) => {
    setLevels(prev => prev.map(level => 
      level.id === levelId ? { ...level, name: newName } : level
    ));
  };

  const handleLevelColorChange = (levelId: number, newColor: string) => {
    setLevels(prev => prev.map(level => 
      level.id === levelId ? { ...level, color: newColor } : level
    ));
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultLevels: GameLevel[] = [
              { id: 1, name: 'Easy', color: '#10B981' },
              { id: 2, name: 'Medium', color: '#F59E0B' },
              { id: 3, name: 'Hard', color: '#EF4444' },
            ];
            setLevels(defaultLevels);
            setSelectedLevel(1);
            setAutoAdvancePlayer(true);
          }
        }
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will permanently delete all your custom content, players, and settings. The app will be restored to its original state with default content. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset App',
          style: 'destructive',
          onPress: () => {
            resetAppData();
            // Reset local state to match defaults
            const defaultLevels: GameLevel[] = [
              { id: 1, name: 'Easy', color: '#10B981' },
              { id: 2, name: 'Medium', color: '#F59E0B' },
              { id: 3, name: 'Hard', color: '#EF4444' },
            ];
            setLevels(defaultLevels);
            setSelectedLevel(1);
            setAutoAdvancePlayer(true);
            setEditingLevel(null);
            setEditingPackagePassword(null);
            Alert.alert('Success', 'App has been reset to default state!');
          }
        }
      ]
    );
  };

  const handlePasswordEdit = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg || pkg.isDefault) return;

    setEditingPackagePassword(packageId);
    setPasswordInput('');
    setConfirmPasswordInput('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSavePassword = () => {
    if (!editingPackagePassword) return;

    if (passwordInput.trim() === '') {
      Alert.alert('Invalid Password', 'Please enter a valid password.');
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }

    updatePackagePassword(editingPackagePassword, passwordInput.trim());
    setEditingPackagePassword(null);
    setPasswordInput('');
    setConfirmPasswordInput('');
    Alert.alert('Success', 'Password protection has been enabled for this package.');
  };

  const handleRemovePassword = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg || pkg.isDefault) return;

    Alert.alert(
      'Remove Password Protection',
      `Are you sure you want to remove password protection from "${pkg.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            updatePackagePassword(packageId, null);
            Alert.alert('Success', 'Password protection has been removed.');
          }
        },
      ]
    );
  };

  const colorOptions = [
    '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6',
    '#F97316', '#14B8A6', '#84CC16', '#A855F7', '#F43F5E', '#06B6D4'
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
          <RotateCcw size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SettingsIcon size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Game Settings</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default Level</Text>
            <View style={styles.levelSelector}>
              {levels.map(level => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelButton,
                    {
                      backgroundColor: selectedLevel === level.id ? level.color : '#F3F4F6',
                    }
                  ]}
                  onPress={() => setSelectedLevel(level.id)}
                >
                  <Text style={[
                    styles.levelButtonText,
                    { color: selectedLevel === level.id ? '#FFFFFF' : '#6B7280' }
                  ]}>
                    {level.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-advance to next player</Text>
            <Switch
              value={autoAdvancePlayer}
              onValueChange={setAutoAdvancePlayer}
              trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
              thumbColor={autoAdvancePlayer ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>


        {/* Password Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Password Protection</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Set passwords to protect sensitive content packages. Users will need to unlock these packages to access their content.
          </Text>

          {packages.map(pkg => (
            <View key={pkg.id} style={styles.packagePasswordItem}>
              <View style={styles.packagePasswordInfo}>
                <Text style={styles.packagePasswordIcon}>{pkg.icon}</Text>
                <View style={styles.packagePasswordDetails}>
                  <Text style={styles.packagePasswordName}>{pkg.name}</Text>
                  <Text style={styles.packagePasswordStatus}>
                    {pkg.isDefault 
                      ? 'Built-in Package' 
                      : pkg.isPasswordProtected 
                        ? `Password Protected ${pkg.isUnlocked ? '(Unlocked)' : '(Locked)'}` 
                        : 'No Password'
                    }
                  </Text>
                  {pkg.isDefault && (
                    <Text style={styles.defaultPackageNote}>Built-in packages cannot be password protected</Text>
                  )}
                </View>
              </View>
              
              {!pkg.isDefault && editingPackagePassword === pkg.id ? (
                <View style={styles.passwordEditForm}>
                  <View style={styles.passwordInputContainer}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <View style={styles.passwordInputWrapper}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter password"
                        value={passwordInput}
                        onChangeText={setPasswordInput}
                        secureTextEntry={!showPassword}
                        returnKeyType="next"
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={16} color="#6B7280" />
                        ) : (
                          <Eye size={16} color="#6B7280" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.passwordInputContainer}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={styles.passwordInputWrapper}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Confirm password"
                        value={confirmPasswordInput}
                        onChangeText={setConfirmPasswordInput}
                        secureTextEntry={!showConfirmPassword}
                        returnKeyType="done"
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} color="#6B7280" />
                        ) : (
                          <Eye size={16} color="#6B7280" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.passwordEditButtons}>
                    <TouchableOpacity 
                      style={styles.passwordCancelButton} 
                      onPress={() => {
                        setEditingPackagePassword(null);
                        setPasswordInput('');
                        setConfirmPasswordInput('');
                      }}
                    >
                      <Text style={styles.passwordCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.passwordSaveButton} 
                      onPress={handleSavePassword}
                    >
                      <Text style={styles.passwordSaveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.packagePasswordActions}>
                  {pkg.isDefault ? (
                    <Text style={styles.defaultPackageLabel}>Built-in Package</Text>
                  ) : pkg.isPasswordProtected ? (
                    <View style={styles.passwordActions}>
                      <TouchableOpacity
                        style={styles.removePasswordButton}
                        onPress={() => handleRemovePassword(pkg.id)}
                      >
                        <Text style={styles.removePasswordButtonText}>Remove Password</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.setPasswordButton}
                      onPress={() => handlePasswordEdit(pkg.id)}
                    >
                      <Lock size={16} color="#FFFFFF" />
                      <Text style={styles.setPasswordButtonText}>Set Password</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Level Configuration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Palette size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Level Configuration</Text>
          </View>

          {levels.map(level => (
            <View key={level.id} style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <View style={styles.levelInfo}>
                  <View style={[styles.levelColorIndicator, { backgroundColor: level.color }]} />
                  <Text style={styles.levelName}>Level {level.id}</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditingLevel(editingLevel === level.id ? null : level.id)}
                >
                  <Text style={styles.editButtonText}>
                    {editingLevel === level.id ? 'Done' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              {editingLevel === level.id && (
                <View style={styles.levelEditForm}>
                  <TextInput
                    style={styles.levelNameInput}
                    value={level.name}
                    onChangeText={(text) => handleLevelNameChange(level.id, text)}
                    placeholder="Level name"
                  />
                  
                  <Text style={styles.colorSelectorTitle}>Color:</Text>
                  <View style={styles.colorSelector}>
                    {colorOptions.map(color => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          level.color === color && styles.colorOptionSelected
                        ]}
                        onPress={() => handleLevelColorChange(level.id, color)}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Reset App */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Reset App</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Reset the app to its original state. This will delete all custom content, players, and settings, and restore the default content packages.
          </Text>

          <TouchableOpacity style={styles.resetAppButton} onPress={handleResetApp}>
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.resetAppButtonText}>Reset App Data</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  resetButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  levelSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  levelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  packagePasswordItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  packagePasswordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  packagePasswordIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  packagePasswordDetails: {
    flex: 1,
  },
  packagePasswordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  packagePasswordStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  defaultPackageNote: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 2,
  },
  packagePasswordActions: {
    alignItems: 'flex-end',
  },
  passwordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  setPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  setPasswordButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  removePasswordButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removePasswordButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  passwordEditForm: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  passwordInputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 14,
  },
  eyeButton: {
    padding: 10,
  },
  passwordEditButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  passwordCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  passwordCancelButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  passwordSaveButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  passwordSaveButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  levelCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  levelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  editButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  levelEditForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  levelNameInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  colorSelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
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
  resetAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  resetAppButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  noUserPackagesMessage: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  noUserPackagesText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});