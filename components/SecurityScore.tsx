import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';

const INNER_SIZE = 180; // Ajustado para que quede dentro del ScoreBar

interface SecurityScoreProps {
  score?: number;
}

const SecurityScore: React.FC<SecurityScoreProps> = ({ score = 0 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayedScore, setDisplayedScore] = useState<number>(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    const listenerId = animatedValue.addListener(({ value }) => {
      setDisplayedScore(Math.round(value));
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [score, animatedValue]);

  return (
    <View style={styles.innerCircle}>
      <Text style={styles.label}>Security Status</Text>
      <Text style={styles.score}>{displayedScore}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  innerCircle: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    backgroundColor: '#FFD400',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#4B5563', // gray-800
    fontSize: 16,
    marginBottom: 8,
  },
  score: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827', // gray-900
  },
});

export default SecurityScore;
