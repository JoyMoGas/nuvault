import { StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { theme } from '@/constants/theme';
import Icon from '@/assets/icons/icons';
import { useRouter } from 'expo-router';

const GoToAdd = () => {

	const router = useRouter();

	const Routes = {
		ADD: '/addPassword'
	} as const;

	type RouteKeys = keyof typeof Routes;

	const navigate = (route: RouteKeys) => router.push(Routes[route]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
      onPress={() => {navigate('ADD')}}
    >
      <Icon name="add" color={theme.colors.light} size={32} />
    </Pressable>
  );
};

export default GoToAdd;

const styles = StyleSheet.create({
  button: {
    width: 68,
    height: 68,
    backgroundColor: theme.colors.primary,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,.6)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
