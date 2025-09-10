import Icon from '@/assets/icons/icons';
import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ScreenWrapper from '@/components/ScreenWrapper';
import { theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

const ResetPassword = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [sessionSet, setSessionSet] = useState(false);
  const passwordRef = useRef('');
  const confirmPasswordRef = useRef('');

  useEffect(() => {
    const setupSession = async () => {
      const token = Array.isArray(params.token) ? params.token[0] : params.token;
      const refreshToken = Array.isArray(params.refresh_token) 
        ? params.refresh_token[0] 
        : params.refresh_token;

      if (token) {
        try {
          // Establecer la sesión con el token de recovery
          const { data, error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: refreshToken || '',
          });

          if (error) {
            console.error('Error setting session:', error);
            Alert.alert('Error', 'Invalid or expired reset link. Please request a new one.');
            router.push('/forgotPassword');
            return;
          }

          if (data.session) {
            setSessionSet(true);
            console.log('Session established for password reset');
          }
        } catch (error) {
          console.error('Error in setupSession:', error);
          Alert.alert('Error', 'Something went wrong. Please try again.');
          router.push('/login');
        }
      } else {
        Alert.alert('Error', 'No reset token provided.');
        router.push('/forgotPassword');
      }
    };

    setupSession();
  }, [params]);

  const handleResetPassword = async () => {
    if (!passwordRef.current || !confirmPasswordRef.current) {
      Alert.alert('Error', 'Please fill in both password fields.');
      return;
    }

    if (passwordRef.current !== confirmPasswordRef.current) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (passwordRef.current.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordRef.current
      });

      setLoading(false);

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      Alert.alert(
        'Success', 
        'Your password has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Cerrar sesión y redirigir al login
              supabase.auth.signOut();
              router.push('/login');
            }
          }
        ]
      );
    } catch (error) {
      setLoading(false);
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  if (!sessionSet) {
    return (
      <ScreenWrapper bg={theme.colors.light}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.headerText}>Setting up...</Text>
          <Text style={styles.subtitleText}>Please wait while we verify your reset link.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.light}>
      <View style={styles.container}>
        <View style={{ marginTop: 10 }}>
          <BackButton />
        </View>

        <Text style={styles.headerText}>Reset Password</Text>
        <Text style={styles.subtitleText}>Enter your new password below.</Text>

        <Input
          icon={<Icon name="lock" size={26} />}
          placeholder="New password"
          secureTextEntry
          onChangeText={(value) => (passwordRef.current = value)}
        />

        <Input
          icon={<Icon name="lock" size={26} />}
          placeholder="Confirm new password"
          secureTextEntry
          onChangeText={(value) => (confirmPasswordRef.current = value)}
        />

        <Button
          title="Update Password"
          loading={loading}
          onPress={handleResetPassword}
          textStyle={{ color: theme.colors.dark }}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  headerText: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  subtitleText: {
    fontSize: hp(2),
    color: theme.colors.darkGray,
    lineHeight: hp(3),
  },
});

export default ResetPassword;