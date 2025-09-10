import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import MaskedView from '@react-native-masked-view/masked-view';
import ScreenWrapper from '@/components/ScreenWrapper';
import { theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import Logo from '@/assets/images/logo-text.svg';
import PhoneImg from '@/assets/images/image.png';
import Button from '@/components/Button';

const Welcome = () => {
  const router = useRouter();
  const Routes = {
    SIGN_UP: '/signUp',
    LOGIN: '/login',
    WELCOME: '/welcome',
  } as const;

  type RouteKeys = keyof typeof Routes;

  const navigate = (route: RouteKeys) => router.push(Routes[route]);


  return (
    <ScreenWrapper bg={theme.colors.dark}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Logo width={200} height={60} />
        </View>

        <MaskedView
          style={styles.maskedViewContainer}
          maskElement={
            <LinearGradient
              colors={['black', 'black', 'transparent']}
              locations={[0, 0.1, 0.6]}
              style={{ flex: 1 }}
            />
          }
        >
          <Image
            source={PhoneImg}
            style={styles.phoneImage}
            resizeMode="contain"
          />
        </MaskedView>

        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Manage all your{'\n'}passwords in one{'\n'}safe place.
            </Text>
            <Text style={styles.punchline}>
              Your digital vault to store, organize and protect your credentials—anytime, anywhere.
            </Text>
          </View>
          <View style={styles.footer}>
					<Button 
						title="Getting Started"
            textStyle={{color: theme.colors.dark}}
						buttonStyle={{width: '100%'}}
						onPress={()=> navigate('SIGN_UP')}
            
					/>
					<View style={styles.bottomTextContainer}>
						<Text style={styles.loginText}>
							Already have an account?
						</Text>
						<Pressable onPress={() => navigate('LOGIN')}>
							<Text style={[styles.loginText, {color: theme.colors.primary, fontWeight: theme.fonts.semibold}]}>
								Login
							</Text>
						</Pressable>
					</View>
				</View>
        </View>
        
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.dark,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: hp(6),
    zIndex: 2, // El logo debe estar por encima de todo
  },
  // Este contenedor posiciona nuestro MaskedView
  maskedViewContainer: {
    position: 'absolute',
    top: hp(15),
    width: wp(90),
    height: hp(70),
  },
  phoneImage: {
    // La imagen debe llenar completamente su contenedor (el MaskedView)
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: hp(45),
    paddingHorizontal: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'flex-start'
  },
  title: {
    color: theme.colors.textLight,
    fontSize: theme.size.title,
    fontWeight: 'bold',
    marginBottom: hp(1),
  },
  punchline: {
    fontSize: theme.size.subtitle,
    color: theme.colors.textLight,
  },
  
	footer: {
    marginTop: hp(1.5),
		gap: 20,
		width: '100%'
	},

	bottomTextContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 5
	},

	loginText: {
		textAlign: 'center',
		color: theme.colors.textLight,
		fontSize: hp(1.6)
	}
});
