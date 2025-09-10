import { hp, wp } from '@/helpers/common';
import MaskedView from '@react-native-masked-view/masked-view';
import React, { useEffect, useRef, ReactNode } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { Svg, Circle, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
// Puedes usar cualquier icono de tu set (ej: lucide-react-native, expo/vector-icons, etc.)
import { Ionicons } from '@expo/vector-icons';
import Icon from '@/assets/icons/icons';
import { theme } from '@/constants/theme';

const SIZE = 220;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreBarProps {
  score?: number;
  children?: ReactNode;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ score = 0, children }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: score,
      duration: 1500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [score, progress]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View style={styles.container}>
      {/* Máscara con degradado */}
      <MaskedView
        style={styles.svg}
        maskElement={
          <LinearGradient
            colors={['black', 'black', 'transparent']}
            locations={[0, 0.1, 0.9]}
            style={{ flex: 1 }}
          />
        }
      >
        <Svg width={SIZE} height={SIZE}>
          <G rotation="90" originX={SIZE / 2} originY={SIZE / 2}>
            {/* Fondo gris */}
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#FFD400"
              strokeOpacity={0.2}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            {/* Círculo animado */}
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#FFD400"
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </G>
        </Svg>
      </MaskedView>

      {/* Contenido en el centro */}
      <View style={styles.innerContent}>{children}</View>

      {/* Círculo blanco con ícono en la parte baja */}
      <View style={styles.bottomCircle}>
        <Icon name='security' size={24} color={theme.colors.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  svg: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
  },
  innerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCircle: {
    position: 'absolute',
    bottom: -10, // lo baja un poco fuera del borde
    width: 45,
    height: 45,
    borderRadius: theme.radius.xxxl,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4, // sombra en Android
    shadowColor: '#000', // sombra en iOS
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default ScoreBar;
