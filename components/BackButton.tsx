import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter, Router } from 'expo-router';
import { theme } from '@/constants/theme';
import Icon from '@/assets/icons/icons/index';

interface BackButtonProps {
  size?: number;
}

const BackButton: React.FC<BackButtonProps> = ({ size = 24 }) => {
  const router: Router = useRouter();

  return (
    <Pressable
      onPress={() => router.back()}
      style={styles.button} // padding proporcional
    >
      <Icon name="arrowLeft" size={size} />
    </Pressable>
  );
};


export default BackButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    padding: 5,
    color: theme.colors.darkGray,
    borderRadius: theme.radius.xxl,
    zIndex: 999,
  },
});
