import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useGameData } from '@/hooks/useGameData';
import { GameContent, Player } from '@/types/game';
import { RotateCcw } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function GameScreen() {
  const { players, settings, getContentByLevel, updatePlayerStats, loading, dataLoaded, refreshData } = useGameData();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentContent, setCurrentContent] = useState<GameContent | null>(null);
  const [gameHistory, setGameHistory] = useState<{
    player: Player;
    content: GameContent;
    timestamp: number;
  }[]>([]);

  // Reset current player index when players change
  useEffect(() => {
    console.log('Game screen - Players changed:', players.length, 'players');
    if (players.length === 0) {
      setCurrentPlayerIndex(0);
      setCurrentContent(null);
    } else if (currentPlayerIndex >= players.length) {
      setCurrentPlayerIndex(0);
    }
  }, [players.length, currentPlayerIndex]);

  // Force refresh when tab becomes active
  useFocusEffect(
    React.useCallback(() => {
      console.log('Game screen focused - players length:', players.length);
      // Force data refresh when tab becomes active
      refreshData();
      
      // Force a state update to ensure proper rendering
      if (players.length > 0 && currentPlayerIndex >= players.length) {
        setCurrentPlayerIndex(0);
      }
    }, [refreshData, currentPlayerIndex, players.length])
  );

  // Animation values
  const cardScale = useSharedValue(1);
  const cardRotation = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (currentContent) {
      cardScale.value = withSequence(
        withSpring(1.1),
        withSpring(1)
      );
      cardRotation.value = withSequence(
        withTiming(5, { duration: 200 }),
        withTiming(0, { duration: 200 })
      );
    }
  }, [currentContent, cardScale, cardRotation]);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: cardScale.value },
        { rotate: `${cardRotation.value}deg` }
      ],
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const getRandomContent = (type: 'truth' | 'dare') => {
    const availableContent = getContentByLevel(type, settings.selectedLevel);
    if (availableContent.length === 0) {
      Alert.alert('No Content', `No ${type} questions available for this level. Please add some content first.`);
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableContent.length);
    return availableContent[randomIndex];
  };

  const handleSelection = (type: 'truth' | 'dare') => {
    if (!dataLoaded) {
      Alert.alert('Loading', 'Game data is still loading. Please wait a moment.');
      return;
    }

    if (players.length === 0) {
      Alert.alert('No Players', 'Please add players first to start the game.');
      return;
    }

    const content = getRandomContent(type);
    if (!content) return;

    const currentPlayer = players[currentPlayerIndex];
    
    setCurrentContent(content);
    updatePlayerStats(currentPlayer.id, type);
    
    setGameHistory(prev => [...prev, {
      player: currentPlayer,
      content,
      timestamp: Date.now(),
    }]);

    if (settings.autoAdvancePlayer) {
      setCurrentPlayerIndex(prev => (prev + 1) % players.length);
    }
  };

  const handleButtonPress = (type: 'truth' | 'dare') => {
    buttonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    handleSelection(type);
  };

  const resetGame = () => {
    setCurrentContent(null);
    setCurrentPlayerIndex(0);
    setGameHistory([]);
  };

  const getCurrentLevel = () => {
    return settings.levels.find(level => level.id === settings.selectedLevel);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!dataLoaded) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Initializing game...</Text>
      </View>
    );
  }

  const currentLevel = getCurrentLevel();
  const currentPlayer = players[currentPlayerIndex];

  console.log('Game screen render - Players:', players.length, 'Current player:', currentPlayer?.name, 'Loading:', loading, 'Data loaded:', dataLoaded);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Truth or Dare</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <RotateCcw size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Level Indicator */}
      <View style={[styles.levelBadge, { backgroundColor: currentLevel?.color || '#8B5CF6' }]}>
        <Text style={styles.levelText}>{currentLevel?.name || 'Level 1'}</Text>
      </View>

      {/* Current Player */}
      {players.length > 0 && !currentContent && (
        <View style={styles.playerCard}>
          <Text style={styles.playerName}>{currentPlayer?.name || 'No player selected'}</Text>
          <Text style={styles.playerSubtext}>Your turn!</Text>
        </View>
      )}

      {/* No Players Message */}
      {players.length === 0 && (
        <View style={styles.noPlayersCard}>
          <Text style={styles.noPlayersTitle}>No Players Added</Text>
          <Text style={styles.noPlayersText}>
            Go to the Players tab to add players before starting the game.
          </Text>
        </View>
      )}

      {/* Game Content */}
      {currentContent && players.length > 0 ? (
        <Animated.View style={[styles.contentCard, animatedCardStyle]}>
          <View style={[styles.contentHeader, { backgroundColor: currentContent.type === 'truth' ? '#3B82F6' : '#EC4899' }]}>
            <Text style={styles.contentType}>{currentContent.type.toUpperCase()}</Text>
          </View>
          <Text style={styles.contentText}>{currentContent.text}</Text>
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={() => setCurrentContent(null)}
          >
            <Text style={styles.nextButtonText}>Next Player</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : players.length > 0 ? (
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>Choose wisely...</Text>
          
          <View style={styles.buttonsContainer}>
            <Animated.View style={[animatedButtonStyle, { marginRight: 10 }]}>
              <TouchableOpacity
                style={[styles.selectionButton, styles.truthButton]}
                onPress={() => handleButtonPress('truth')}
              >
                <Text style={styles.selectionButtonText}>TRUTH</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View style={[animatedButtonStyle, { marginLeft: 10 }]}>
              <TouchableOpacity
                style={[styles.selectionButton, styles.dareButton]}
                onPress={() => handleButtonPress('dare')}
              >
                <Text style={styles.selectionButtonText}>DARE</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      ) : null}

      {/* Game Stats - only show if there are players */}
      {players.length > 0 && (
        <View style={styles.gameStats}>
          <Text style={styles.gameStatsTitle}>Game Stats</Text>
          <Text style={styles.gameStatsText}>
            Players: {players.length} | Round: {gameHistory.length + 1}
          </Text>
        </View>
      )}
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
  resetButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  levelBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  levelText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  playerCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  playerSubtext: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 15,
  },
  playerStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  contentHeader: {
    padding: 15,
    alignItems: 'center',
  },
  contentType: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentText: {
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    padding: 25,
    lineHeight: 24,
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionTitle: {
    fontSize: 20,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  selectionButton: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  truthButton: {
    backgroundColor: '#3B82F6',
  },
  dareButton: {
    backgroundColor: '#EC4899',
  },
  selectionButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameStats: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  gameStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 5,
  },
  gameStatsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPlayersCard: {
    backgroundColor: '#FFFBEB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FEF3C7',
  },
  noPlayersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 10,
  },
  noPlayersText: {
    fontSize: 16,
    color: '#B45309',
    textAlign: 'center',
    lineHeight: 22,
  },
});