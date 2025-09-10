import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import Icon from '@/assets/icons/icons';
import { hp } from '@/helpers/common';
import { theme } from '@/constants/theme';

const GenerateButton = () => {
	const router = useRouter();

	const Routes = {
		GENERATE: '/passwordGenerator',
	} as const;

	type RouteKeys = keyof typeof Routes;

	const navigate = (route: RouteKeys) => router.push(Routes[route]);
	return (
		<View>
			<Pressable onPress={() => navigate('GENERATE')}>
				<View style={styles.button}>
					<Text style={styles.buttonText}>Generate</Text>
					<Icon name='secret' color={theme.colors.dark} />
				</View>
			</Pressable>
		</View>
	)
}

export default GenerateButton

const styles = StyleSheet.create({
	button: {
		flexDirection: 'row',
		alignContent: 'center',
		alignItems: 'center',
		paddingHorizontal: hp(2),
		paddingVertical: hp(1),
		backgroundColor: theme.colors.primary,
		borderRadius: theme.radius.sm,
		gap: 8		
	},
	buttonText: {
		color: theme.colors.dark,
		fontWeight: theme.fonts.bold,
		fontSize: theme.size.sm
	}
})