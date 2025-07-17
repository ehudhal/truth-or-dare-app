export interface Player {
  id: string;
  name: string;
  stats: {
    truths: number;
    dares: number;
  };
}

export interface GameContent {
  id: string;
  type: 'truth' | 'dare';
  text: string;
  level: number;
  packageId?: string;
}

export interface GameLevel {
  id: number;
  name: string;
  color: string;
}

export interface ContentPackage {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isDefault?: boolean;
  isPasswordProtected?: boolean;
  password?: string;
  isUnlocked?: boolean;
  unlockedAt?: number;
}

export interface GameState {
  currentPlayerIndex: number;
  gameHistory: Array<{
    player: Player;
    content: GameContent;
    timestamp: number;
  }>;
}

export interface GameSettings {
  levels: GameLevel[];
  selectedLevel: number;
  autoAdvancePlayer: boolean;
  selectedPackages: string[];
  unlockedPackages?: { [packageId: string]: number }; // packageId -> timestamp when unlocked
}