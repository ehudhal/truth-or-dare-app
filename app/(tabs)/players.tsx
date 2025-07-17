import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { useState } from 'react';
import { useGameData } from '@/hooks/useGameData';
import { Player } from '@/types/game';
import { Plus, Trash2, User } from 'lucide-react-native';

export default function PlayersScreen() {
  const { players, addPlayer, removePlayer, loading } = useGameData();
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = () => {
    // Dismiss keyboard first
    Keyboard.dismiss();
    
    if (newPlayerName.trim() === '') {
      Alert.alert('Invalid Name', 'Please enter a valid player name.');
      return;
    }

    if (players.some(p => p.name.toLowerCase() === newPlayerName.toLowerCase())) {
      Alert.alert('Duplicate Name', 'A player with this name already exists.');
      return;
    }

    addPlayer(newPlayerName.trim());
    setNewPlayerName('');
  };

  const handleRemovePlayer = (player: Player) => {
    Alert.alert(
      'Remove Player',
      `Are you sure you want to remove ${player.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removePlayer(player.id) },
      ]
    );
  };

  const handleSubmitEditing = () => {
    handleAddPlayer();
  };

  const handleInputFocus = () => {
    // Optional: Add any focus handling if needed
  };

  const handleInputBlur = () => {
    // Optional: Add any blur handling if needed
  };

  const renderPlayer = ({ item: player }: { item: Player }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerInfo}>
        <View style={styles.playerAvatar}>
          <User size={24} color="#8B5CF6" />
        </View>
        <View style={styles.playerDetails}>
          <Text style={styles.playerName}>{player.name}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemovePlayer(player)}
      >
        <Trash2 size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Players</Text>
        
        <View style={styles.addPlayerContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter player name"
            value={newPlayerName}
            onChangeText={setNewPlayerName}
            onSubmitEditing={handleSubmitEditing}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            returnKeyType="done"
            blurOnSubmit={true}
            enablesReturnKeyAutomatically={true}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.playersHeader}>
          <Text style={styles.playersCount}>
            {players.length} {players.length === 1 ? 'Player' : 'Players'}
          </Text>
        </View>

        {players.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No Players Yet</Text>
            <Text style={styles.emptyStateText}>
              Add players to start your truth or dare game!
            </Text>
          </View>
        ) : (
          <View style={styles.playersListContainer}>
            {players.map((player) => (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <View style={styles.playerAvatar}>
                    <User size={24} color="#8B5CF6" />
                  </View>
                  <View style={styles.playerDetails}>
                    <Text style={styles.playerName}>{player.name}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemovePlayer(player)}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        {/* Add some bottom padding to ensure content is accessible above keyboard */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 30,
  },
  addPlayerContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  playersHeader: {
    marginBottom: 20,
  },
  playersCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  playersListContainer: {
    flex: 1,
  },
  playerCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  playerStats: {
    fontSize: 14,
    color: '#6B7280',
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
  bottomSpacer: {
    height: 100, // Extra space to ensure content is accessible above keyboard
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
});