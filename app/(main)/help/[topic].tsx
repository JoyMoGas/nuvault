// app/help/[topic].tsx

import BackButton from '@/components/BackButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import { theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

// --- Base de Datos de Contenido (esta parte no cambia) ---
const helpContent = {
  'getting-started': {
    categoryTitle: 'Getting Started',
    guides: [
      {
        subtitle: 'How to create and verify your account',
        text: '1. Enter your details: On the registration screen, provide a username, a valid email address, and a secure master password.\n\n2. Verify your email: We will send a verification link to your email. Open it to activate your account.\n\n3. Log in: Once verified, return to the app and log in.',
        image: require('@/assets/images/help/gs1.png'),
      },
      {
        subtitle: 'Reset your master password',
        text: '1. Request a reset: On the "Log In" screen, tap the `Forgot your password?` link.\n\n2. Enter your email: Type the email address associated with your account, and we will send you instructions.',
        image: require('@/assets/images/help/gs2.png'),
      },
    ],
  },
  'main-screen': {
    categoryTitle: 'Main Screen',
    guides: [
      {
        subtitle: "What is the 'Security Status'?",
        text: 'The "Security Status" chart gives you a percentage representing the combined strength of all your saved passwords.',
        image: require('@/assets/images/help/ms1.png'),
      },
      {
        subtitle: 'Search and filter your entries',
        text: 'Use the search bar to find an entry by its name. Use the tags (All, Favorites, etc.) to organize and view your entries.',
        image: require('@/assets/images/help/ms2.png'),
      },
    ],

  },
  'managing-passwords': {
    categoryTitle: 'Managing Passwords',
    guides: [
      { 
        subtitle: 'How to add a new entry', 
        text: '1. Tap the `+` button in the bottom corner of the main screen.\n\n2. Fill out the form with the category, service name, email, and password.\n\n3. Press "Add" to save it securely in your vault.', 
        image: require('@/assets/images/help/mp1.png'), 
      },
      { 
        subtitle: 'View, copy, and favorite an entry', 
        text: 'For each entry, you can:\n• View/Hide: Tap the eye icon (👁️).\n• Copy: Tap the copy icon (📋).\n• Favorite: Tap the star icon (❤️).', 
        image: require('@/assets/images/help/mp2.png'), 
      },
      { 
        subtitle: 'Edit or delete an entry', 
        text: '1. Swipe the entry you want to modify to the left.\n\n2. "Edit" and "Delete" buttons will appear.\n\n3. "Delete" will ask for confirmation before permanently erasing the entry.', 
        image: require('@/assets/images/help/mp3.png'), 
      }
    ],
  },
  tools: {
    categoryTitle: 'Tools',
    guides: [
      { 
        subtitle: 'Using the Password Generator', 
        text: '1. Access the generator from the main screen.\n\n2. Customize your password by adjusting the length and character types (uppercase, numbers, symbols).\n\n3. Use "Regenerate" until you like one, and then copy it.', 
        image: require('@/assets/images/help/st.png'), 
      }
    ]
  },
  'account-settings': {
    categoryTitle: 'Account & Settings',
    guides: [
      { 
        subtitle: 'Change your master password', 
        text: 'In "Settings," go to the "Security" section and select "Change password." You will need to enter your current password to create a new one. You will be logged out for security after changing it.', 
        image: require('@/assets/images/help/as1.png'), 
      },
      { 
        subtitle: 'Delete your account permanently', 
        text: 'WARNING! This action is irreversible and will erase ALL of your saved data.\n\nGo to "Settings," find the "Danger" section, and select "Delete Account." You will need to confirm your action to complete the process.', 
        image: require('@/assets/images/help/as2.png'), 
      }
    ]
  },
};

const HelpDetailScreen = () => {
  const router = useRouter();
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const content = topic ? helpContent[topic] : null;

  return (
    <ScreenWrapper bg="#f8f8f8">
      {/* ✅ ¡CAMBIO CLAVE AQUÍ! Ocultamos el header nativo. */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Este es tu header personalizado, el único que se mostrará ahora */}
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title}>{content?.categoryTitle || 'Ayuda'}</Text>
        </View>
        
        {content && content.guides.length > 0 ? (
          content.guides.map((guide, index) => (
            <View key={index} style={styles.guideSection}>
              <Text style={styles.subtitle}>{guide.subtitle}</Text>
              <Image source={guide.image} style={styles.image} />
              <Text style={styles.text}>{guide.text}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No se encontró contenido para este tema.</Text>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
    container: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
    marginTop: hp(2),
  },
  title: {
    fontSize: hp(3),
    fontWeight: "bold",
    color: theme.colors.dark,
    textAlign: "center",
    flex: 1,
    marginLeft: -wp(7),
  },
  guideSection: {
    marginBottom: hp(4),
  },
  subtitle: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    marginBottom: hp(2),
  },
  text: {
    fontSize: hp(2),
    color: theme.colors.darkGray,
    lineHeight: hp(3),
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: theme.radius.md,
    marginVertical: hp(2),
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
});

export default HelpDetailScreen;