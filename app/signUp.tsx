import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../assets/icons/icons/index';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import Input from '../components/Input';
import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { supabase } from '../lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';
import CustomModal from '../components/CustomModal';
import * as Linking from 'expo-linking'; // ✅ 1. Importar Linking

const SignUp = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: '', email: '', password: '', general: '' });
  const [modalConfig, setModalConfig] = useState<any>(null);

  const handleSuccess = () => {
    setModalConfig(null);
    router.push('/login');
  };

  const onSubmit = async () => {
    setErrors({ username: '', email: '', password: '', general: '' });

    if (!username || !email || !password) {
      setErrors(prev => ({ ...prev, general: 'Please fill all the fields!' }));
      return;
    }
    if (password.length < 6) {
      setErrors(prev => ({...prev, password: 'Password must be at least 6 characters.'}));
      return;
    }

    setLoading(true);

    // ✅ 2. Crear la URL de redirección dinámica
    const redirectUrl = __DEV__
      ? Linking.createURL('email-validation') // Para desarrollo (exp://...)
      : 'https://nuvaultapp.netlify.app/email-validation'; // Para producción

    // ✅ 3. Enviar la URL a la Edge Function
    const { data, error } = await supabase.functions.invoke('sign-up', {
      body: { 
        email: email.trim(), 
        password: password.trim(), 
        username: username.trim(),
        redirectTo: redirectUrl // <-- Se envía la URL correcta
      },
    });

    setLoading(false);

    if (error) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof FunctionsHttpError) {
        try {
          const errorData = await error.context.json();
          errorMessage = errorData.error;
        } catch (e) { errorMessage = error.message; }
      } else {
        errorMessage = error.message;
      }
      
      if (errorMessage.includes('User already registered')) {
        setErrors(prev => ({...prev, email: 'A user with this email is already registered.'}));
      } else if (errorMessage.includes('username is already in use')) {
        setErrors(prev => ({...prev, username: 'That username is already in use.'}));
      } else if (errorMessage.includes('Password should be at least 6 characters')) {
        setErrors(prev => ({...prev, password: errorMessage}));
      } else {
        setErrors(prev => ({...prev, general: errorMessage}));
      }
      return;
    }

    setModalConfig({
        iconName: "checkEmail",
        iconColor: theme.colors.green,
        title: "Verify your email",
        description: "We sent you a confirmation link. Please check your inbox before logging in.",
        primaryButtonTitle: "OK",
        onPrimaryButtonPress: handleSuccess,
    });
  };
  
  const clearErrorsOnChange = () => {
    if (errors.username || errors.email || errors.password || errors.general) {
      setErrors({ username: '', email: '', password: '', general: '' });
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.dark}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={{marginTop: 10}}>
          <BackButton size={30} />
        </View>
        <View>
          <Text style={styles.welcomeText}>Create Your Vault</Text>
          <Text style={styles.welcomeSubText}>
            Sign up to protect, store and organize your passwords in one secure place.
          </Text>
        </View>
        <View style={styles.formWrapper}>
          <View style={styles.formContainer}>
            {errors.general ? <Text style={styles.errorGeneral}>{errors.general}</Text> : null}
            <Input
              icon={<Icon name="user" size={26} color={theme.colors.text} />}
              placeholder="Enter your name"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                clearErrorsOnChange();
              }}
            />
            {errors.username ? <Text style={styles.errorTag}>{errors.username}</Text> : null}
            <Input
              icon={<Icon name="email" size={26} color={theme.colors.text} />}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearErrorsOnChange();
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email ? <Text style={styles.errorTag}>{errors.email}</Text> : null}
            <Input
              icon={<Icon name="lock" size={26} color={theme.colors.text} />}
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearErrorsOnChange();
              }}
              secureTextEntry={!isPasswordVisible}
              rightIcon={
                <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Icon name={isPasswordVisible ? 'show' : 'hide'} size={26} color={theme.colors.text} />
                </Pressable>
              }
            />
            {errors.password ? <Text style={styles.errorTag}>{errors.password}</Text> : null}
            <Button title={'Sign Up'} loading={loading} onPress={onSubmit} textStyle={{color: theme.colors.dark}} />
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable onPress={() => router.push('/login')}>
                <Text style={[ styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold } ]}>
                  Login
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      {modalConfig && (
        <CustomModal
            isVisible={!!modalConfig}
            onClose={() => setModalConfig(null)}
            {...modalConfig}
            onPrimaryButtonPress={
                modalConfig.onPrimaryButtonPress || (() => setModalConfig(null))
            }
        />
      )}
    </ScreenWrapper>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textLight,
  },
  welcomeSubText: {
    fontSize: hp(2),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  formWrapper: {
    flex: 1,
    marginHorizontal: -wp(5)
  },
  formContainer: {
    flex: 1,
    backgroundColor: theme.colors.light,
    borderTopLeftRadius: theme.radius.xxxl,
    borderTopRightRadius: theme.radius.xxxl,
    padding: wp(5),
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 5,
    gap: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
  errorGeneral: {
    color: theme.colors.red,
    fontSize: hp(1.8),
    textAlign: 'center',
    marginBottom: hp(1),
  },
  errorTag: {
    color: theme.colors.red,
    fontSize: hp(1.6),
    marginTop: -hp(1.5),
    marginBottom: hp(0.5),
    paddingLeft: wp(2),
  },
});