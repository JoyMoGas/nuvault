import { ActivityIndicator, StyleSheet, View, ColorValue, ActivityIndicatorProps } from 'react-native';
import React from 'react';
import { theme } from '../constants/theme';

type LoadingProps = {
  size?: ActivityIndicatorProps['size']; // "small" | "large" | number
  color?: ColorValue;
};

const Loading: React.FC<LoadingProps> = ({ size = "large", color = theme.colors.primary }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
