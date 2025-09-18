// Content moderation utility functions
export const moderateContent = (text) => {
  const inappropriateWords = [
    'damn', 'hell', 'stupid', 'idiot', 'hate', 'suck', 'crap', 'shut up',
    'dumb', 'loser', 'worthless', 'pathetic', 'useless', 'terrible',
    'awful', 'worst', 'horrible', 'disgusting', 'gross', 'ugly'
  ];
  
  const threats = ['kill', 'die', 'hurt', 'harm', 'attack', 'destroy'];
  const spam = ['click here', 'buy now', 'free money', 'make money fast', 'http', 'www.'];
  
  const lowerText = text.toLowerCase();
  
  // Check for inappropriate language
  for (const word of inappropriateWords) {
    if (lowerText.includes(word)) {
      return {
        isValid: false,
        message: 'Your message contains inappropriate language. Please keep messages positive and encouraging.'
      };
    }
  }
  
  // Check for threats
  for (const word of threats) {
    if (lowerText.includes(word)) {
      return {
        isValid: false,
        message: 'Your message contains threatening content. This platform is for positive encouragement only.'
      };
    }
  }
  
  // Check for spam
  for (const word of spam) {
    if (lowerText.includes(word)) {
      return {
        isValid: false,
        message: 'Your message appears to contain promotional content. Please share genuine encouragement for teachers.'
      };
    }
  }
  
  // Check for excessive caps (potential shouting)
  const capsCount = (text.match(/[A-Z]/g) || []).length;
  if (capsCount > text.length * 0.7 && text.length > 10) {
    return {
      isValid: false,
      message: 'Please avoid using excessive capital letters. Write your message in a normal tone.'
    };
  }
  
  // Check for very short messages
  if (text.trim().length < 10) {
    return {
      isValid: false,
      message: 'Please write a more meaningful message to encourage teachers (at least 10 characters).'
    };
  }
  
  return {
    isValid: true,
    message: null
  };
};

// Additional utility functions
export const getSeasonalColors = () => {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) { // Spring
    return {
      gratitude: '#FF6B9D',
      support: '#4ECDC4', 
      inspiration: '#45B7D1',
      appreciation: '#98FB98'
    };
  } else if (month >= 5 && month <= 7) { // Summer
    return {
      gratitude: '#FF69B4',
      support: '#00CED1',
      inspiration: '#1E90FF', 
      appreciation: '#32CD32'
    };
  } else if (month >= 8 && month <= 10) { // Autumn
    return {
      gratitude: '#FF8C00',
      support: '#CD853F',
      inspiration: '#B22222',
      appreciation: '#DAA520'
    };
  } else { // Winter
    return {
      gratitude: '#DC143C',
      support: '#4682B4',
      inspiration: '#6A5ACD',
      appreciation: '#2E8B57'
    };
  }
};

export const generateRandomPosition = () => ({
  x: Math.random() * 60 + 20,
  y: Math.random() * 40 + 25,
  rotation: Math.random() * 40 - 20
});