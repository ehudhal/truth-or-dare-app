import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player, GameContent, GameLevel, GameSettings, ContentPackage } from '@/types/game';

const STORAGE_KEYS = {
  PLAYERS: 'truth_or_dare_players',
  CONTENT: 'truth_or_dare_content',
  SETTINGS: 'truth_or_dare_settings',
  PACKAGES: 'truth_or_dare_packages',
};

const DEFAULT_LEVELS: GameLevel[] = [
  { id: 1, name: 'Easy', color: '#10B981' },
  { id: 2, name: 'Medium', color: '#F59E0B' },
  { id: 3, name: 'Hard', color: '#EF4444' },
];

const DEFAULT_PACKAGES: ContentPackage[] = [
  {
    id: 'default',
    name: 'Classic',
    description: 'Traditional truth or dare questions for any occasion',
    icon: '🎯',
    color: '#8B5CF6',
    isDefault: true,
  },
  {
    id: 'road-trip',
    name: 'On the Road',
    description: 'Perfect for family car trips and travel adventures',
    icon: '🚗',
    color: '#3B82F6',
    isDefault: true,
  },
  {
    id: 'camping',
    name: 'Camping Time',
    description: 'Outdoor adventures and campfire fun',
    icon: '🏕️',
    color: '#10B981',
    isDefault: true,
  },
];

const DEFAULT_SETTINGS: GameSettings = {
  levels: DEFAULT_LEVELS,
  selectedLevel: 1,
  autoAdvancePlayer: true,
  selectedPackages: ['default'],
};

const DEFAULT_CONTENT: GameContent[] = [
  // Default Package - Easy truths (20)
  { id: '1', type: 'truth', text: 'What is your favorite color and why?', level: 1, packageId: 'default' },
  { id: '2', type: 'truth', text: 'What is your biggest fear?', level: 1, packageId: 'default' },
  { id: '3', type: 'truth', text: 'What is your favorite movie of all time?', level: 1, packageId: 'default' },
  { id: '4', type: 'truth', text: 'If you could have any superpower, what would it be?', level: 1, packageId: 'default' },
  { id: '5', type: 'truth', text: 'What is your dream job?', level: 1, packageId: 'default' },
  { id: '6', type: 'truth', text: 'What is your favorite food?', level: 1, packageId: 'default' },
  { id: '7', type: 'truth', text: 'What is your favorite season and why?', level: 1, packageId: 'default' },
  { id: '8', type: 'truth', text: 'If you could visit any country, where would you go?', level: 1, packageId: 'default' },
  { id: '9', type: 'truth', text: 'What is your favorite animal?', level: 1, packageId: 'default' },
  { id: '10', type: 'truth', text: 'What is your favorite hobby?', level: 1, packageId: 'default' },
  { id: '11', type: 'truth', text: 'What is your favorite book or story?', level: 1, packageId: 'default' },
  { id: '12', type: 'truth', text: 'If you could meet any celebrity, who would it be?', level: 1, packageId: 'default' },
  { id: '13', type: 'truth', text: 'What is your favorite ice cream flavor?', level: 1, packageId: 'default' },
  { id: '14', type: 'truth', text: 'What is your favorite song right now?', level: 1, packageId: 'default' },
  { id: '15', type: 'truth', text: 'If you could be any age for a week, what age would you choose?', level: 1, packageId: 'default' },
  { id: '16', type: 'truth', text: 'What is your favorite memory from this year?', level: 1, packageId: 'default' },
  { id: '17', type: 'truth', text: 'What is something you are really good at?', level: 1, packageId: 'default' },
  { id: '18', type: 'truth', text: 'If you could have any pet, what would it be?', level: 1, packageId: 'default' },
  { id: '19', type: 'truth', text: 'What is your favorite thing to do on weekends?', level: 1, packageId: 'default' },
  { id: '20', type: 'truth', text: 'What is your favorite subject in school or topic to learn about?', level: 1, packageId: 'default' },
  
  // Default Package - Easy dares (20)
  { id: '21', type: 'dare', text: 'Do 10 jumping jacks', level: 1, packageId: 'default' },
  { id: '22', type: 'dare', text: 'Sing your favorite song for 30 seconds', level: 1, packageId: 'default' },
  { id: '23', type: 'dare', text: 'Dance for 30 seconds', level: 1, packageId: 'default' },
  { id: '24', type: 'dare', text: 'Do your best animal impression', level: 1, packageId: 'default' },
  { id: '25', type: 'dare', text: 'Tell a joke that makes everyone laugh', level: 1, packageId: 'default' },
  { id: '26', type: 'dare', text: 'Do 5 push-ups', level: 1, packageId: 'default' },
  { id: '27', type: 'dare', text: 'Speak in an accent for the next 3 rounds', level: 1, packageId: 'default' },
  { id: '28', type: 'dare', text: 'Draw a picture with your eyes closed', level: 1, packageId: 'default' },
  { id: '29', type: 'dare', text: 'Do your best robot dance', level: 1, packageId: 'default' },
  { id: '30', type: 'dare', text: 'Sing "Happy Birthday" in a funny voice', level: 1, packageId: 'default' },
  { id: '31', type: 'dare', text: 'Do your best superhero pose and hold it for 10 seconds', level: 1, packageId: 'default' },
  { id: '32', type: 'dare', text: 'Try to lick your elbow', level: 1, packageId: 'default' },
  { id: '33', type: 'dare', text: 'Do your best impression of someone in the room', level: 1, packageId: 'default' },
  { id: '34', type: 'dare', text: 'Hop on one foot for 15 seconds', level: 1, packageId: 'default' },
  { id: '35', type: 'dare', text: 'Make up a short poem about your favorite food', level: 1, packageId: 'default' },
  { id: '36', type: 'dare', text: 'Do your best moonwalk', level: 1, packageId: 'default' },
  { id: '37', type: 'dare', text: 'Pretend to be a news reporter and give a weather report', level: 1, packageId: 'default' },
  { id: '38', type: 'dare', text: 'Do 10 sit-ups', level: 1, packageId: 'default' },
  { id: '39', type: 'dare', text: 'Act like your favorite movie character for 1 minute', level: 1, packageId: 'default' },
  { id: '40', type: 'dare', text: 'Try to juggle 3 items for 10 seconds', level: 1, packageId: 'default' },
  
  // Default Package - Medium truths (20)
  { id: '41', type: 'truth', text: 'What is your most embarrassing moment?', level: 2, packageId: 'default' },
  { id: '42', type: 'truth', text: 'Who was your first crush?', level: 2, packageId: 'default' },
  { id: '43', type: 'truth', text: 'What is something you have never told your parents?', level: 2, packageId: 'default' },
  { id: '44', type: 'truth', text: 'What is your weirdest habit?', level: 2, packageId: 'default' },
  { id: '45', type: 'truth', text: 'What is the most trouble you have ever been in?', level: 2, packageId: 'default' },
  { id: '46', type: 'truth', text: 'What is your biggest insecurity?', level: 2, packageId: 'default' },
  { id: '47', type: 'truth', text: 'Have you ever cheated on a test or game?', level: 2, packageId: 'default' },
  { id: '48', type: 'truth', text: 'What is the meanest thing you have ever said to someone?', level: 2, packageId: 'default' },
  { id: '49', type: 'truth', text: 'What is your most irrational fear?', level: 2, packageId: 'default' },
  { id: '50', type: 'truth', text: 'Have you ever lied to get out of trouble?', level: 2, packageId: 'default' },
  { id: '51', type: 'truth', text: 'What is something you pretend to like but actually hate?', level: 2, packageId: 'default' },
  { id: '52', type: 'truth', text: 'What is the most childish thing you still do?', level: 2, packageId: 'default' },
  { id: '53', type: 'truth', text: 'What is your worst personality trait?', level: 2, packageId: 'default' },
  { id: '54', type: 'truth', text: 'Have you ever had a crush on a friend\'s boyfriend/girlfriend?', level: 2, packageId: 'default' },
  { id: '55', type: 'truth', text: 'What is the most embarrassing thing in your room?', level: 2, packageId: 'default' },
  { id: '56', type: 'truth', text: 'What is something you do when you are alone that you would never do in front of others?', level: 2, packageId: 'default' },
  { id: '57', type: 'truth', text: 'What is your most unpopular opinion?', level: 2, packageId: 'default' },
  { id: '58', type: 'truth', text: 'Have you ever pretended to be sick to get out of something?', level: 2, packageId: 'default' },
  { id: '59', type: 'truth', text: 'What is the most embarrassing thing you have done in front of a crush?', level: 2, packageId: 'default' },
  { id: '60', type: 'truth', text: 'What is something you are secretly proud of but would never admit?', level: 2, packageId: 'default' },
  
  // Default Package - Medium dares (20)
  { id: '61', type: 'dare', text: 'Call someone and sing them a song', level: 2, packageId: 'default' },
  { id: '62', type: 'dare', text: 'Let someone else style your hair however they want', level: 2, packageId: 'default' },
  { id: '63', type: 'dare', text: 'Eat a spoonful of a condiment', level: 2, packageId: 'default' },
  { id: '64', type: 'dare', text: 'Do 20 burpees', level: 2, packageId: 'default' },
  { id: '65', type: 'dare', text: 'Let someone draw on your face with washable markers', level: 2, packageId: 'default' },
  { id: '66', type: 'dare', text: 'Wear your clothes backwards for the next hour', level: 2, packageId: 'default' },
  { id: '67', type: 'dare', text: 'Do your best stand-up comedy routine for 2 minutes', level: 2, packageId: 'default' },
  { id: '68', type: 'dare', text: 'Let someone else choose your outfit for tomorrow', level: 2, packageId: 'default' },
  { id: '69', type: 'dare', text: 'Eat something without using your hands', level: 2, packageId: 'default' },
  { id: '70', type: 'dare', text: 'Do your best magic trick', level: 2, packageId: 'default' },
  { id: '71', type: 'dare', text: 'Speak only in questions for the next 10 minutes', level: 2, packageId: 'default' },
  { id: '72', type: 'dare', text: 'Let someone tickle you for 30 seconds', level: 2, packageId: 'default' },
  { id: '73', type: 'dare', text: 'Do your best karaoke performance of a song you hate', level: 2, packageId: 'default' },
  { id: '74', type: 'dare', text: 'Let someone else post a status on your social media', level: 2, packageId: 'default' },
  { id: '75', type: 'dare', text: 'Wear socks on your hands for the next 30 minutes', level: 2, packageId: 'default' },
  { id: '76', type: 'dare', text: 'Do your best interpretive dance to describe your day', level: 2, packageId: 'default' },
  { id: '77', type: 'dare', text: 'Let someone else do your makeup', level: 2, packageId: 'default' },
  { id: '78', type: 'dare', text: 'Eat a raw onion slice', level: 2, packageId: 'default' },
  { id: '79', type: 'dare', text: 'Do your best impression of a baby for 2 minutes', level: 2, packageId: 'default' },
  { id: '80', type: 'dare', text: 'Let someone else choose what you eat for your next meal', level: 2, packageId: 'default' },
  
  // Default Package - Hard truths (20)
  { id: '81', type: 'truth', text: 'What is something you have never told anyone?', level: 3, packageId: 'default' },
  { id: '82', type: 'truth', text: 'What is your biggest regret?', level: 3, packageId: 'default' },
  { id: '83', type: 'truth', text: 'Who in this room would you date?', level: 3, packageId: 'default' },
  { id: '84', type: 'truth', text: 'What is the most illegal thing you have ever done?', level: 3, packageId: 'default' },
  { id: '85', type: 'truth', text: 'Have you ever been in love? If so, with whom?', level: 3, packageId: 'default' },
  { id: '86', type: 'truth', text: 'What is your deepest, darkest secret?', level: 3, packageId: 'default' },
  { id: '87', type: 'truth', text: 'Who do you have a crush on right now?', level: 3, packageId: 'default' },
  { id: '88', type: 'truth', text: 'What is the most embarrassing thing you have done while drunk?', level: 3, packageId: 'default' },
  { id: '89', type: 'truth', text: 'Have you ever cheated in a relationship?', level: 3, packageId: 'default' },
  { id: '90', type: 'truth', text: 'What is your biggest turn-on?', level: 3, packageId: 'default' },
  { id: '91', type: 'truth', text: 'What is something you would never want your parents to know about you?', level: 3, packageId: 'default' },
  { id: '92', type: 'truth', text: 'Have you ever had a one-night stand?', level: 3, packageId: 'default' },
  { id: '93', type: 'truth', text: 'What is the most money you have ever stolen?', level: 3, packageId: 'default' },
  { id: '94', type: 'truth', text: 'Who was the worst person you have ever kissed?', level: 3, packageId: 'default' },
  { id: '95', type: 'truth', text: 'What is your most shameful fantasy?', level: 3, packageId: 'default' },
  { id: '96', type: 'truth', text: 'Have you ever sent a nude photo to someone?', level: 3, packageId: 'default' },
  { id: '97', type: 'truth', text: 'What is the meanest thing you have ever done to someone you loved?', level: 3, packageId: 'default' },
  { id: '98', type: 'truth', text: 'Have you ever had feelings for someone of the same gender?', level: 3, packageId: 'default' },
  { id: '99', type: 'truth', text: 'What is something you have done that you would judge someone else for doing?', level: 3, packageId: 'default' },
  { id: '100', type: 'truth', text: 'Who in this room do you trust the least?', level: 3, packageId: 'default' },
  
  // Default Package - Hard dares (20)
  { id: '101', type: 'dare', text: 'Post an embarrassing photo on social media', level: 3, packageId: 'default' },
  { id: '102', type: 'dare', text: 'Let someone go through your phone for 1 minute', level: 3, packageId: 'default' },
  { id: '103', type: 'dare', text: 'Tell someone in this room how you really feel about them', level: 3, packageId: 'default' },
  { id: '104', type: 'dare', text: 'Kiss the person to your left', level: 3, packageId: 'default' },
  { id: '105', type: 'dare', text: 'Send a flirty text to your ex', level: 3, packageId: 'default' },
  { id: '106', type: 'dare', text: 'Let someone else read your last 5 text messages out loud', level: 3, packageId: 'default' },
  { id: '107', type: 'dare', text: 'Call your crush and tell them how you feel', level: 3, packageId: 'default' },
  { id: '108', type: 'dare', text: 'Let someone give you a hickey', level: 3, packageId: 'default' },
  { id: '109', type: 'dare', text: 'Take off your shirt for the rest of the game', level: 3, packageId: 'default' },
  { id: '110', type: 'dare', text: 'Let someone else control your social media for the next hour', level: 3, packageId: 'default' },
  { id: '111', type: 'dare', text: 'Make out with your hand for 30 seconds', level: 3, packageId: 'default' },
  { id: '112', type: 'dare', text: 'Let someone write something embarrassing on your forehead in permanent marker', level: 3, packageId: 'default' },
  { id: '113', type: 'dare', text: 'Call a random number and try to have a 2-minute conversation', level: 3, packageId: 'default' },
  { id: '114', type: 'dare', text: 'Let someone else choose a dare for you to do tomorrow', level: 3, packageId: 'default' },
  { id: '115', type: 'dare', text: 'Confess something to the group that you have never told anyone', level: 3, packageId: 'default' },
  { id: '116', type: 'dare', text: 'Let someone slap you as hard as they can', level: 3, packageId: 'default' },
  { id: '117', type: 'dare', text: 'Eat something gross that the group chooses', level: 3, packageId: 'default' },
  { id: '118', type: 'dare', text: 'Let someone else pick out your underwear for the next week', level: 3, packageId: 'default' },
  { id: '119', type: 'dare', text: 'Go skinny dipping (if possible)', level: 3, packageId: 'default' },
  { id: '120', type: 'dare', text: 'Let someone tie you up for 10 minutes', level: 3, packageId: 'default' },

  // Road Trip Package - Easy truths (20)
  { id: '121', type: 'truth', text: 'What is the weirdest thing you\'ve seen on a road trip?', level: 1, packageId: 'road-trip' },
  { id: '122', type: 'truth', text: 'What\'s your dream vacation destination?', level: 1, packageId: 'road-trip' },
  { id: '123', type: 'truth', text: 'What\'s the longest you\'ve ever been in a car?', level: 1, packageId: 'road-trip' },
  { id: '124', type: 'truth', text: 'What\'s your favorite road trip snack?', level: 1, packageId: 'road-trip' },
  { id: '125', type: 'truth', text: 'What\'s the best license plate you\'ve ever seen?', level: 1, packageId: 'road-trip' },
  { id: '126', type: 'truth', text: 'What\'s your favorite car game to play?', level: 1, packageId: 'road-trip' },
  { id: '127', type: 'truth', text: 'What\'s the most beautiful place you\'ve driven through?', level: 1, packageId: 'road-trip' },
  { id: '128', type: 'truth', text: 'What\'s your favorite road trip memory?', level: 1, packageId: 'road-trip' },
  { id: '129', type: 'truth', text: 'What\'s the worst traffic jam you\'ve ever been in?', level: 1, packageId: 'road-trip' },
  { id: '130', type: 'truth', text: 'What\'s your favorite type of music to listen to while driving?', level: 1, packageId: 'road-trip' },
  { id: '131', type: 'truth', text: 'What\'s the strangest roadside attraction you\'ve visited?', level: 1, packageId: 'road-trip' },
  { id: '132', type: 'truth', text: 'What\'s your favorite fast food restaurant for road trips?', level: 1, packageId: 'road-trip' },
  { id: '133', type: 'truth', text: 'What\'s the funniest thing that\'s happened to you in a car?', level: 1, packageId: 'road-trip' },
  { id: '134', type: 'truth', text: 'What\'s your dream road trip route?', level: 1, packageId: 'road-trip' },
  { id: '135', type: 'truth', text: 'What\'s the most miles you\'ve driven in one day?', level: 1, packageId: 'road-trip' },
  { id: '136', type: 'truth', text: 'What\'s your favorite thing to do as a passenger?', level: 1, packageId: 'road-trip' },
  { id: '137', type: 'truth', text: 'What\'s the best rest stop you\'ve ever been to?', level: 1, packageId: 'road-trip' },
  { id: '138', type: 'truth', text: 'What\'s your favorite car color?', level: 1, packageId: 'road-trip' },
  { id: '139', type: 'truth', text: 'What\'s the most interesting person you\'ve met while traveling?', level: 1, packageId: 'road-trip' },
  { id: '140', type: 'truth', text: 'What\'s your favorite travel app or website?', level: 1, packageId: 'road-trip' },

  // Road Trip Package - Easy dares (20)
  { id: '141', type: 'dare', text: 'Sing the alphabet backwards', level: 1, packageId: 'road-trip' },
  { id: '142', type: 'dare', text: 'Make up a story about the next car you see', level: 1, packageId: 'road-trip' },
  { id: '143', type: 'dare', text: 'Do your best impression of the GPS voice', level: 1, packageId: 'road-trip' },
  { id: '144', type: 'dare', text: 'Count 20 red cars out loud', level: 1, packageId: 'road-trip' },
  { id: '145', type: 'dare', text: 'Wave at 5 people in other cars', level: 1, packageId: 'road-trip' },
  { id: '146', type: 'dare', text: 'Sing "99 Bottles of Beer" for 2 minutes', level: 1, packageId: 'road-trip' },
  { id: '147', type: 'dare', text: 'Do the "I\'m a Little Teapot" dance', level: 1, packageId: 'road-trip' },
  { id: '148', type: 'dare', text: 'Make car sounds for 30 seconds', level: 1, packageId: 'road-trip' },
  { id: '149', type: 'dare', text: 'Pretend to be a tour guide describing the scenery', level: 1, packageId: 'road-trip' },
  { id: '150', type: 'dare', text: 'Do your best truck driver impression', level: 1, packageId: 'road-trip' },
  { id: '151', type: 'dare', text: 'Count backwards from 100 by 7s', level: 1, packageId: 'road-trip' },
  { id: '152', type: 'dare', text: 'Make up a song about the current weather', level: 1, packageId: 'road-trip' },
  { id: '153', type: 'dare', text: 'Do your best impression of a car salesman', level: 1, packageId: 'road-trip' },
  { id: '154', type: 'dare', text: 'Pretend to be a race car driver for 1 minute', level: 1, packageId: 'road-trip' },
  { id: '155', type: 'dare', text: 'Make up a commercial for the next billboard you see', level: 1, packageId: 'road-trip' },
  { id: '156', type: 'dare', text: 'Do your best motorcycle impression', level: 1, packageId: 'road-trip' },
  { id: '157', type: 'dare', text: 'Spell your name using only car brands', level: 1, packageId: 'road-trip' },
  { id: '158', type: 'dare', text: 'Pretend to be a hitchhiker trying to get a ride', level: 1, packageId: 'road-trip' },
  { id: '159', type: 'dare', text: 'Do your best impression of a honking horn', level: 1, packageId: 'road-trip' },
  { id: '160', type: 'dare', text: 'Make up a rap about road trips', level: 1, packageId: 'road-trip' },

  // Camping Package - Easy truths (20)
  { id: '161', type: 'truth', text: 'What\'s the scariest thing about being in nature?', level: 1, packageId: 'camping' },
  { id: '162', type: 'truth', text: 'What\'s your favorite camping activity?', level: 1, packageId: 'camping' },
  { id: '163', type: 'truth', text: 'What\'s the best camping meal you\'ve ever had?', level: 1, packageId: 'camping' },
  { id: '164', type: 'truth', text: 'What\'s your favorite thing about sleeping outdoors?', level: 1, packageId: 'camping' },
  { id: '165', type: 'truth', text: 'What\'s the most beautiful sunset you\'ve seen while camping?', level: 1, packageId: 'camping' },
  { id: '166', type: 'truth', text: 'What\'s your favorite campfire song?', level: 1, packageId: 'camping' },
  { id: '167', type: 'truth', text: 'What\'s the coolest wildlife you\'ve seen while camping?', level: 1, packageId: 'camping' },
  { id: '168', type: 'truth', text: 'What\'s your favorite camping snack?', level: 1, packageId: 'camping' },
  { id: '169', type: 'truth', text: 'What\'s the longest you\'ve gone without a shower while camping?', level: 1, packageId: 'camping' },
  { id: '170', type: 'truth', text: 'What\'s your favorite camping game?', level: 1, packageId: 'camping' },
  { id: '171', type: 'truth', text: 'What\'s the most challenging part of camping for you?', level: 1, packageId: 'camping' },
  { id: '172', type: 'truth', text: 'What\'s your favorite type of tent?', level: 1, packageId: 'camping' },
  { id: '173', type: 'truth', text: 'What\'s the best camping spot you\'ve ever been to?', level: 1, packageId: 'camping' },
  { id: '174', type: 'truth', text: 'What\'s your favorite thing to do around a campfire?', level: 1, packageId: 'camping' },
  { id: '175', type: 'truth', text: 'What\'s the funniest camping mishap you\'ve experienced?', level: 1, packageId: 'camping' },
  { id: '176', type: 'truth', text: 'What\'s your favorite camping memory with friends or family?', level: 1, packageId: 'camping' },
  { id: '177', type: 'truth', text: 'What\'s the weirdest sound you\'ve heard while camping?', level: 1, packageId: 'camping' },
  { id: '178', type: 'truth', text: 'What\'s your favorite outdoor activity besides camping?', level: 1, packageId: 'camping' },
  { id: '179', type: 'truth', text: 'What\'s the most essential camping item you can\'t live without?', level: 1, packageId: 'camping' },
  { id: '180', type: 'truth', text: 'What\'s your dream camping destination?', level: 1, packageId: 'camping' },

  // Camping Package - Easy dares (20)
  { id: '181', type: 'dare', text: 'Make the sound of your favorite animal for 10 seconds', level: 1, packageId: 'camping' },
  { id: '182', type: 'dare', text: 'Pretend to set up a tent with your eyes closed', level: 1, packageId: 'camping' },
  { id: '183', type: 'dare', text: 'Do your best bear impression', level: 1, packageId: 'camping' },
  { id: '184', type: 'dare', text: 'Howl like a wolf for 15 seconds', level: 1, packageId: 'camping' },
  { id: '185', type: 'dare', text: 'Pretend to start a campfire using only gestures', level: 1, packageId: 'camping' },
  { id: '186', type: 'dare', text: 'Do your best impression of a park ranger', level: 1, packageId: 'camping' },
  { id: '187', type: 'dare', text: 'Pretend to fish for 30 seconds', level: 1, packageId: 'camping' },
  { id: '188', type: 'dare', text: 'Make up a nature documentary narration for 1 minute', level: 1, packageId: 'camping' },
  { id: '189', type: 'dare', text: 'Do your best impression of a mosquito', level: 1, packageId: 'camping' },
  { id: '190', type: 'dare', text: 'Pretend to roast marshmallows and describe the taste', level: 1, packageId: 'camping' },
  { id: '191', type: 'dare', text: 'Do your best owl impression', level: 1, packageId: 'camping' },
  { id: '192', type: 'dare', text: 'Pretend to be lost in the woods and call for help', level: 1, packageId: 'camping' },
  { id: '193', type: 'dare', text: 'Do your best impression of wind blowing through trees', level: 1, packageId: 'camping' },
  { id: '194', type: 'dare', text: 'Pretend to be a squirrel gathering nuts', level: 1, packageId: 'camping' },
  { id: '195', type: 'dare', text: 'Make up a ghost story in 30 seconds', level: 1, packageId: 'camping' },
  { id: '196', type: 'dare', text: 'Do your best impression of a cricket chirping', level: 1, packageId: 'camping' },
  { id: '197', type: 'dare', text: 'Pretend to be a park guide giving a tour', level: 1, packageId: 'camping' },
  { id: '198', type: 'dare', text: 'Do your best impression of a frog', level: 1, packageId: 'camping' },
  { id: '199', type: 'dare', text: 'Pretend to be a beaver building a dam', level: 1, packageId: 'camping' },
  { id: '200', type: 'dare', text: 'Make the sound of a crackling campfire', level: 1, packageId: 'camping' },

  // Camping Package - Medium truths (20)
  { id: '201', type: 'truth', text: 'Have you ever gotten lost in the woods?', level: 2, packageId: 'camping' },
  { id: '202', type: 'truth', text: 'What\'s the scariest thing that\'s happened to you while camping?', level: 2, packageId: 'camping' },
  { id: '203', type: 'truth', text: 'Have you ever had to use the bathroom in the woods?', level: 2, packageId: 'camping' },
  { id: '204', type: 'truth', text: 'What\'s the grossest thing you\'ve eaten while camping?', level: 2, packageId: 'camping' },
  { id: '205', type: 'truth', text: 'Have you ever been caught in bad weather while camping?', level: 2, packageId: 'camping' },
  { id: '206', type: 'truth', text: 'What\'s the most embarrassing thing that\'s happened to you while camping?', level: 2, packageId: 'camping' },
  { id: '207', type: 'truth', text: 'Have you ever been afraid of the dark while camping?', level: 2, packageId: 'camping' },
  { id: '208', type: 'truth', text: 'What\'s the worst camping equipment failure you\'ve experienced?', level: 2, packageId: 'camping' },
  { id: '209', type: 'truth', text: 'Have you ever had a close encounter with dangerous wildlife?', level: 2, packageId: 'camping' },
  { id: '210', type: 'truth', text: 'What\'s the most uncomfortable you\'ve ever been while camping?', level: 2, packageId: 'camping' },
  { id: '211', type: 'truth', text: 'Have you ever gotten sick while camping?', level: 2, packageId: 'camping' },
  { id: '212', type: 'truth', text: 'What\'s the worst camping food you\'ve ever had?', level: 2, packageId: 'camping' },
  { id: '213', type: 'truth', text: 'Have you ever been homesick while camping?', level: 2, packageId: 'camping' },
  { id: '214', type: 'truth', text: 'What\'s the most you\'ve ever complained while camping?', level: 2, packageId: 'camping' },
  { id: '215', type: 'truth', text: 'Have you ever wanted to give up and go home while camping?', level: 2, packageId: 'camping' },
  { id: '216', type: 'truth', text: 'What\'s the most unprepared you\'ve ever been for a camping trip?', level: 2, packageId: 'camping' },
  { id: '217', type: 'truth', text: 'Have you ever had a camping trip go completely wrong?', level: 2, packageId: 'camping' },
  { id: '218', type: 'truth', text: 'What\'s the most you\'ve ever missed modern conveniences while camping?', level: 2, packageId: 'camping' },
  { id: '219', type: 'truth', text: 'Have you ever been injured while camping?', level: 2, packageId: 'camping' },
  { id: '220', type: 'truth', text: 'What\'s the longest you\'ve gone without technology while camping?', level: 2, packageId: 'camping' },

  // Camping Package - Medium dares (20)
  { id: '221', type: 'dare', text: 'Tell a spooky campfire story in 1 minute', level: 2, packageId: 'camping' },
  { id: '222', type: 'dare', text: 'Eat something you find outside (safely)', level: 2, packageId: 'camping' },
  { id: '223', type: 'dare', text: 'Sleep outside without a tent for one night', level: 2, packageId: 'camping' },
  { id: '224', type: 'dare', text: 'Go 24 hours without using any technology', level: 2, packageId: 'camping' },
  { id: '225', type: 'dare', text: 'Build a shelter using only natural materials', level: 2, packageId: 'camping' },
  { id: '226', type: 'dare', text: 'Start a fire without matches or a lighter', level: 2, packageId: 'camping' },
  { id: '227', type: 'dare', text: 'Go swimming in a natural body of water', level: 2, packageId: 'camping' },
  { id: '228', type: 'dare', text: 'Hike barefoot for 10 minutes', level: 2, packageId: 'camping' },
  { id: '229', type: 'dare', text: 'Eat only what you can forage for one meal', level: 2, packageId: 'camping' },
  { id: '230', type: 'dare', text: 'Sleep on the ground without a sleeping pad', level: 2, packageId: 'camping' },
  { id: '231', type: 'dare', text: 'Go without washing your face for 3 days', level: 2, packageId: 'camping' },
  { id: '232', type: 'dare', text: 'Carry someone else\'s backpack for an hour', level: 2, packageId: 'camping' },
  { id: '233', type: 'dare', text: 'Navigate using only the stars for 30 minutes', level: 2, packageId: 'camping' },
  { id: '234', type: 'dare', text: 'Drink water directly from a natural source', level: 2, packageId: 'camping' },
  { id: '235', type: 'dare', text: 'Go without shoes for an entire day while camping', level: 2, packageId: 'camping' },
  { id: '236', type: 'dare', text: 'Sleep outside during a thunderstorm', level: 2, packageId: 'camping' },
  { id: '237', type: 'dare', text: 'Eat dinner with your hands only', level: 2, packageId: 'camping' },
  { id: '238', type: 'dare', text: 'Go without talking for 2 hours', level: 2, packageId: 'camping' },
  { id: '239', type: 'dare', text: 'Carry all the firewood for the group', level: 2, packageId: 'camping' },
  { id: '240', type: 'dare', text: 'Go without a flashlight after dark', level: 2, packageId: 'camping' },

  // Camping Package - Hard truths (20)
  { id: '241', type: 'truth', text: 'What would you do if you saw a bear while camping?', level: 3, packageId: 'camping' },
  { id: '242', type: 'truth', text: 'Have you ever been so scared while camping that you wanted to leave immediately?', level: 3, packageId: 'camping' },
  { id: '243', type: 'truth', text: 'What\'s the most dangerous situation you\'ve been in while outdoors?', level: 3, packageId: 'camping' },
  { id: '244', type: 'truth', text: 'Have you ever done something illegal while camping?', level: 3, packageId: 'camping' },
  { id: '245', type: 'truth', text: 'What\'s the most reckless thing you\'ve done in nature?', level: 3, packageId: 'camping' },
  { id: '246', type: 'truth', text: 'Have you ever left trash behind while camping?', level: 3, packageId: 'camping' },
  { id: '247', type: 'truth', text: 'What\'s the most you\'ve ever panicked while outdoors?', level: 3, packageId: 'camping' },
  { id: '248', type: 'truth', text: 'Have you ever been completely lost and thought you might not make it back?', level: 3, packageId: 'camping' },
  { id: '249', type: 'truth', text: 'What\'s the most selfish thing you\'ve done while camping with others?', level: 3, packageId: 'camping' },
  { id: '250', type: 'truth', text: 'Have you ever put others in danger because of your actions while camping?', level: 3, packageId: 'camping' },
  { id: '251', type: 'truth', text: 'What\'s the most you\'ve ever regretted going on a camping trip?', level: 3, packageId: 'camping' },
  { id: '252', type: 'truth', text: 'Have you ever stolen something while camping?', level: 3, packageId: 'camping' },
  { id: '253', type: 'truth', text: 'What\'s the most desperate you\'ve ever been for food or water while camping?', level: 3, packageId: 'camping' },
  { id: '254', type: 'truth', text: 'Have you ever lied about your outdoor skills to impress someone?', level: 3, packageId: 'camping' },
  { id: '255', type: 'truth', text: 'What\'s the most you\'ve ever wanted to quit and call for rescue?', level: 3, packageId: 'camping' },
  { id: '256', type: 'truth', text: 'Have you ever done something that could have started a forest fire?', level: 3, packageId: 'camping' },
  { id: '257', type: 'truth', text: 'What\'s the most irresponsible thing you\'ve done while camping?', level: 3, packageId: 'camping' },
  { id: '258', type: 'truth', text: 'Have you ever abandoned someone while camping?', level: 3, packageId: 'camping' },
  { id: '259', type: 'truth', text: 'What\'s the most you\'ve ever feared for your life while outdoors?', level: 3, packageId: 'camping' },
  { id: '260', type: 'truth', text: 'Have you ever done something while camping that you\'re deeply ashamed of?', level: 3, packageId: 'camping' },

  // Camping Package - Hard dares (20)
  { id: '261', type: 'dare', text: 'Sleep alone in the woods for one night', level: 3, packageId: 'camping' },
  { id: '262', type: 'dare', text: 'Go camping for a week with only the clothes on your back', level: 3, packageId: 'camping' },
  { id: '263', type: 'dare', text: 'Eat only what you can catch or forage for 3 days', level: 3, packageId: 'camping' },
  { id: '264', type: 'dare', text: 'Go without any shelter for 2 nights', level: 3, packageId: 'camping' },
  { id: '265', type: 'dare', text: 'Drink your own urine if you run out of water', level: 3, packageId: 'camping' },
  { id: '266', type: 'dare', text: 'Sleep naked outside for one night', level: 3, packageId: 'camping' },
  { id: '267', type: 'dare', text: 'Go without food for 48 hours while camping', level: 3, packageId: 'camping' },
  { id: '268', type: 'dare', text: 'Climb a dangerous cliff or rock face', level: 3, packageId: 'camping' },
  { id: '269', type: 'dare', text: 'Go swimming in freezing water', level: 3, packageId: 'camping' },
  { id: '270', type: 'dare', text: 'Eat something that might make you sick', level: 3, packageId: 'camping' },
  { id: '271', type: 'dare', text: 'Go without any fire or heat source for 2 nights', level: 3, packageId: 'camping' },
  { id: '272', type: 'dare', text: 'Walk through dangerous terrain alone', level: 3, packageId: 'camping' },
  { id: '273', type: 'dare', text: 'Go without any communication device for a week', level: 3, packageId: 'camping' },
  { id: '274', type: 'dare', text: 'Sleep in a place where dangerous animals are known to be', level: 3, packageId: 'camping' },
  { id: '275', type: 'dare', text: 'Go without any first aid supplies for the entire trip', level: 3, packageId: 'camping' },
  { id: '276', type: 'dare', text: 'Drink untreated water from any source you find', level: 3, packageId: 'camping' },
  { id: '277', type: 'dare', text: 'Go camping during severe weather warnings', level: 3, packageId: 'camping' },
  { id: '278', type: 'dare', text: 'Sleep on a cliff edge or dangerous ledge', level: 3, packageId: 'camping' },
  { id: '279', type: 'dare', text: 'Go without any map or navigation tools', level: 3, packageId: 'camping' },
  { id: '280', type: 'dare', text: 'Intentionally get lost and find your way back without help', level: 3, packageId: 'camping' },

  // Note: Party Mode and Family Friendly packages have been removed
  // All content with packageId 'party' or 'family' has been excluded
];

export function useGameData() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [content, setContent] = useState<GameContent[]>([]);
  const [packages, setPackages] = useState<ContentPackage[]>([]);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading game data...');
      const [playersData, contentData, packagesData, settingsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PLAYERS),
        AsyncStorage.getItem(STORAGE_KEYS.CONTENT),
        AsyncStorage.getItem(STORAGE_KEYS.PACKAGES),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);

      console.log('Raw players data:', playersData);

      if (playersData) {
        try {
          const parsedPlayers = JSON.parse(playersData);
          console.log('Parsed players:', parsedPlayers);
          if (Array.isArray(parsedPlayers)) {
            setPlayers(parsedPlayers);
            console.log('Set players to:', parsedPlayers);
          } else {
            console.log('Players data is not an array, setting to empty');
            setPlayers([]);
          }
        } catch {
          console.log('Error parsing players data, setting to empty');
          setPlayers([]);
        }
      } else {
        console.log('No players data found, setting to empty');
        setPlayers([]);
      }

      if (contentData) {
        try {
          const parsedContent = JSON.parse(contentData);
          if (Array.isArray(parsedContent)) {
            setContent(parsedContent);
          } else {
            setContent(DEFAULT_CONTENT);
            await AsyncStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(DEFAULT_CONTENT));
          }
        } catch {
          setContent(DEFAULT_CONTENT);
          await AsyncStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(DEFAULT_CONTENT));
        }
      } else {
        setContent(DEFAULT_CONTENT);
        await AsyncStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(DEFAULT_CONTENT));
      }

      if (packagesData) {
        try {
          const parsedPackages = JSON.parse(packagesData);
          if (Array.isArray(parsedPackages)) {
            setPackages(parsedPackages);
          } else {
            setPackages(DEFAULT_PACKAGES);
            await AsyncStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(DEFAULT_PACKAGES));
          }
        } catch {
          setPackages(DEFAULT_PACKAGES);
          await AsyncStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(DEFAULT_PACKAGES));
        }
      } else {
        setPackages(DEFAULT_PACKAGES);
        await AsyncStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(DEFAULT_PACKAGES));
      }

      if (settingsData) {
        try {
          const parsedSettings = JSON.parse(settingsData);
          if (parsedSettings && typeof parsedSettings === 'object' && !Array.isArray(parsedSettings)) {
            setSettings(parsedSettings);
          } else {
            setSettings(DEFAULT_SETTINGS);
            await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
          }
        } catch {
          setSettings(DEFAULT_SETTINGS);
          await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        }
      } else {
        setSettings(DEFAULT_SETTINGS);
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
      
      console.log('Data loading complete, setting dataLoaded to true');
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set all states to their defaults if there's a general error
      setPlayers([]);
      setContent(DEFAULT_CONTENT);
      setPackages(DEFAULT_PACKAGES);
      setSettings(DEFAULT_SETTINGS);
      setDataLoaded(true);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const savePlayers = async (newPlayers: Player[]) => {
    try {
      console.log('Saving players:', newPlayers);
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(newPlayers));
      setPlayers(newPlayers);
      console.log('Players saved and state updated');
    } catch (error) {
      console.error('Error saving players:', error);
    }
  };

  const saveContent = async (newContent: GameContent[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(newContent));
      setContent(newContent);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const savePackages = async (newPackages: ContentPackage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(newPackages));
      setPackages(newPackages);
    } catch (error) {
      console.error('Error saving packages:', error);
    }
  };

  const saveSettings = async (newSettings: GameSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const addPlayer = (name: string) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      stats: { truths: 0, dares: 0 },
    };
    console.log('Adding player:', newPlayer);
    console.log('Current players before adding:', players);
    savePlayers([...players, newPlayer]);
  };

  const removePlayer = (playerId: string) => {
    savePlayers(players.filter(p => p.id !== playerId));
  };

  const addContent = (type: 'truth' | 'dare', text: string, level: number, packageId?: string) => {
    const newContent: GameContent = {
      id: Date.now().toString(),
      type,
      text,
      level,
      packageId: packageId || 'default',
    };
    saveContent([...content, newContent]);
  };

  const removeContent = (contentId: string) => {
    const newContent = content.filter(c => c.id !== contentId);
    console.log('Removing content:', contentId, 'New content length:', newContent.length);
    saveContent(newContent);
  };

  const updateContent = (contentId: string, updates: Partial<GameContent>) => {
    const newContent = content.map(c => 
      c.id === contentId ? { ...c, ...updates } : c
    );
    console.log('Updating content:', contentId, 'Updates:', updates);
    saveContent(newContent);
  };

  const updatePackagePassword = (packageId: string, password: string | null) => {
    // Prevent password protection on default packages
    const pkg = packages.find(p => p.id === packageId);
    if (pkg?.isDefault) {
      return;
    }

    const updatedPackages = packages.map(pkg => {
      if (pkg.id === packageId) {
        return {
          ...pkg,
          isPasswordProtected: password !== null,
          password: password || undefined,
          isUnlocked: false,
          unlockedAt: undefined,
        };
      }
      return pkg;
    });
    savePackages(updatedPackages);
  };

  const unlockPackage = (packageId: string, password: string): boolean => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg || !pkg.isPasswordProtected || pkg.password !== password) {
      return false;
    }

    const updatedPackages = packages.map(p => {
      if (p.id === packageId) {
        return {
          ...p,
          isUnlocked: true,
          unlockedAt: Date.now(),
        };
      }
      return p;
    });
    savePackages(updatedPackages);

    // Also update settings to track unlocked packages
    const newUnlockedPackages = {
      ...(settings.unlockedPackages || {}),
      [packageId]: Date.now(),
    };
    saveSettings({
      ...settings,
      unlockedPackages: newUnlockedPackages,
    });

    return true;
  };

  const lockPackage = (packageId: string) => {
    const updatedPackages = packages.map(p => {
      if (p.id === packageId) {
        return {
          ...p,
          isUnlocked: false,
          unlockedAt: undefined,
        };
      }
      return p;
    });
    savePackages(updatedPackages);

    // Remove from unlocked packages in settings
    const newUnlockedPackages = { ...(settings.unlockedPackages || {}) };
    delete newUnlockedPackages[packageId];
    saveSettings({
      ...settings,
      unlockedPackages: newUnlockedPackages,
    });
  };

  const checkAndLockExpiredPackages = () => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    let hasExpiredPackages = false;

    const updatedPackages = packages.map(pkg => {
      if (pkg.isPasswordProtected && pkg.isUnlocked && pkg.unlockedAt) {
        const timeSinceUnlock = now - pkg.unlockedAt;
        if (timeSinceUnlock >= oneDayMs) {
          hasExpiredPackages = true;
          return {
            ...pkg,
            isUnlocked: false,
            unlockedAt: undefined,
          };
        }
      }
      return pkg;
    });

    if (hasExpiredPackages) {
      savePackages(updatedPackages);
      
      // Clean up expired packages from settings
      const newUnlockedPackages = { ...(settings.unlockedPackages || {}) };
      Object.keys(newUnlockedPackages).forEach(packageId => {
        const unlockedAt = newUnlockedPackages[packageId];
        if (now - unlockedAt >= oneDayMs) {
          delete newUnlockedPackages[packageId];
        }
      });
      saveSettings({
        ...settings,
        unlockedPackages: newUnlockedPackages,
      });
    }
  };

  // Check for expired packages on load and periodically
  useEffect(() => {
    if (dataLoaded) {
      checkAndLockExpiredPackages();
      
      // Set up interval to check every hour
      const interval = setInterval(checkAndLockExpiredPackages, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [dataLoaded, packages, settings]);

  const getContentByLevel = (type: 'truth' | 'dare', level: number) => {
    // Get selected packages, default to 'default' if none selected
    const activePackageIds = settings.selectedPackages && settings.selectedPackages.length > 0 
      ? settings.selectedPackages 
      : ['default'];
    
    console.log('Getting content for level:', level, 'type:', type, 'activePackages:', activePackageIds);
    
    const selectedPackageIds = settings.selectedPackages && settings.selectedPackages.length > 0 
      ? settings.selectedPackages 
      : ['default'];
    
    return content.filter(c => {
      if (c.type !== type || c.level !== level) return false;
      
      // Handle content that might not have packageId set (legacy content)
      const contentPackageId = c.packageId || 'default';
      if (!selectedPackageIds.includes(contentPackageId)) return false;
      
      // Check if package is password protected and locked
      const pkg = packages.find(p => p.id === contentPackageId);
      if (pkg?.isPasswordProtected && !pkg?.isUnlocked) {
        console.log('Filtering out content from locked package:', pkg.name);
        return false;
      }
      
      return true;
    });
  }

  const addPackage = (name: string, description: string, icon: string, color: string) => {
    const newPackage: ContentPackage = {
      id: Date.now().toString(),
      name,
      description,
      icon,
      color,
    };
    const updatedPackages = [...packages, newPackage];
    savePackages(updatedPackages);
    
    // Automatically select the new package in settings
    const updatedSelectedPackages = [...(settings.selectedPackages || []), newPackage.id];
    saveSettings({
      ...settings,
      selectedPackages: updatedSelectedPackages,
    });
  };

  const removePackage = (packageId: string) => {
    // Prevent removal of default packages
    const packageToRemove = packages.find(p => p.id === packageId);
    if (packageToRemove?.isDefault) {
      return;
    }

    // Get the package being removed
    
    // Remove the package
    const updatedPackages = packages.filter(p => p.id !== packageId);
    savePackages(updatedPackages);
    
    // Remove content from this package
    const updatedContent = content.filter(c => c.packageId !== packageId);
    saveContent(updatedContent);
    
    // Update settings if this package was selected
    if ((settings.selectedPackages || []).includes(packageId)) {
      const newSelectedPackages = (settings.selectedPackages || []).filter(id => id !== packageId);
      if (newSelectedPackages.length === 0) {
        // If no packages are selected, select the first available unlocked package
        const firstAvailablePackage = updatedPackages.find(pkg => !pkg.isPasswordProtected || pkg.isUnlocked);
        if (firstAvailablePackage) {
          newSelectedPackages.push(firstAvailablePackage.id);
        } else if (updatedPackages.length > 0) {
          // Fallback to first package if no unlocked packages available
          newSelectedPackages.push(updatedPackages[0].id);
        }
      }
      saveSettings({
        ...settings,
        selectedPackages: newSelectedPackages,
      });
    }
  };

  const updatePlayerStats = (playerId: string, type: 'truth' | 'dare') => {
    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          stats: {
            ...player.stats,
            [type]: player.stats[type] + 1,
          },
        };
      }
      return player;
    });
    savePlayers(updatedPlayers);
  };

  const updatePackage = (packageId: string, updates: Partial<ContentPackage>) => {
    // Prevent editing of default packages
    const pkg = packages.find(p => p.id === packageId);
    if (pkg?.isDefault) {
      return;
    }

    const updatedPackages = packages.map(pkg => {
      if (pkg.id === packageId) {
        return { ...pkg, ...updates };
      }
      return pkg;
    });
    savePackages(updatedPackages);
  };

  const resetAppData = async () => {
    try {
      // Clear all stored data
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.PLAYERS),
        AsyncStorage.removeItem(STORAGE_KEYS.CONTENT),
        AsyncStorage.removeItem(STORAGE_KEYS.PACKAGES),
        AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS),
      ]);

      // Ensure default packages don't have password protection
      const cleanDefaultPackages = DEFAULT_PACKAGES.map(pkg => ({
        ...pkg,
        isPasswordProtected: false,
        password: undefined,
        isUnlocked: false,
        unlockedAt: undefined,
      }));

      // Reset to defaults
      setPlayers([]);
      setContent(DEFAULT_CONTENT);
      setPackages(cleanDefaultPackages);
      setSettings(DEFAULT_SETTINGS);

      // Save defaults to storage
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(DEFAULT_CONTENT)),
        AsyncStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(cleanDefaultPackages)),
        AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS)),
      ]);
    } catch (error) {
      console.error('Error resetting app data:', error);
    }
  };

  return {
    players,
    content,
    packages,
    settings,
    loading,
    dataLoaded,
    addPlayer,
    removePlayer,
    addContent,
    removeContent,
    updateContent,
    addPackage,
    removePackage,
    updatePackage,
    updatePackagePassword,
    unlockPackage,
    lockPackage,
    checkAndLockExpiredPackages,
    getContentByLevel,
    updatePlayerStats,
    saveSettings,
    resetAppData,
  };
}