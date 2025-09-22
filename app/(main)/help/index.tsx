// app/help/index.tsx

import Icon from '@/assets/icons/icons';
import BackButton from '@/components/BackButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import { theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

const helpTopics = [
  {
    title: 'Getting Started',
    icon: 'key',
    route: '/help/getting-started',
  },
  {
    title: 'Understanding the Home Screen',
    icon: 'home',
    route: '/help/main-screen',
  },
  {
    title: 'Manage Passwords',
    icon: 'service',
    route: '/help/managing-passwords',
  },
  {
    title: 'Security Tools',
    icon: 'security',
    route: '/help/tools',
  },
  {
    title: 'Account and Settings',
    icon: 'settings',
    route: '/help/account-settings',
  },
];

const HelpScreen = () => {
  const router = useRouter();

  return (
    <ScreenWrapper bg="#f8f8f8">
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* ✅ Encabezado personalizado para coincidir con tu diseño */}
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title}>Help Center</Text>
        </View>

        <Text style={styles.subtitle}>
          Find guides and answers to your questions about Nuvault.
        </Text>
        
        <View style={styles.topicsContainer}>
          {helpTopics.map((topic, index) => (
            <Pressable
              key={index}
              style={styles.topicItem}
              onPress={() => router.push(topic.route)}
            >
              <View style={styles.iconContainer}>
                <Icon name={topic.icon as any} size={hp(3)} color={theme.colors.primary} />
              </View>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Icon name="arrowRight" size={hp(3)} color={theme.colors.darkGray} />
            </Pressable>
          ))}
        </View>
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
    marginLeft: -wp(7), // Para centrar el título correctamente
  },
  subtitle: {
    fontSize: hp(2),
    color: theme.colors.darkGray,
    textAlign: 'center',
    marginBottom: hp(4),
  },
  topicsContainer: {
    backgroundColor: 'white',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  iconContainer: {
    marginRight: wp(4),
    padding: wp(2),
    backgroundColor: theme.colors.light,
    borderRadius: theme.radius.md,
  },
  topicTitle: {
    flex: 1,
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.dark,
  },
});

export default HelpScreen;