import { ActivityIndicator, StyleSheet, View, ColorValue, ActivityIndicatorProps } from 'react-native';
import React from 'react';
import { theme } from '../constants/theme';
import Logo from '@/assets/images/logo-text.svg';

type LoadingProps = {
	size?: ActivityIndicatorProps['size']; // "small" | "large" | number
	color?: ColorValue;
};

const FirstLoading: React.FC<LoadingProps> = () => {
	return (
		<View style={styles.container}>
          <Logo width={200} height={60} />
		</View>
	);
};

export default FirstLoading;

const styles = StyleSheet.create({
	container: {
		backgroundColor: theme.colors.dark,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
