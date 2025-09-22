import { StyleSheet, Text, View, Pressable } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import BackButton from '../components/BackButton';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '@/assets/icons/icons';
import { supabase } from '@/lib/supabase';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // <-- 1. AÑADIDO: Estado para la visibilidad

  const handleLogin = async () => {
    setErrors({ email: '', password: '', general: '' });
    if (!email || !password) {
      setErrors(prev => ({ ...prev, general: 'Please fill all fields.' }));
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
    setLoading(false);
    if (signInError) {
      const msg = signInError.message;
      if (msg.includes('Invalid login credentials')) {
        setErrors(prev => ({ ...prev, password: 'Invalid email or password.' }));
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        setErrors(prev => ({...prev, email: 'Please confirm your email address first.'}));
      } else if (msg.includes('format')) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address.' }));
      } else {
        setErrors(prev => ({ ...prev, general: msg }));
      }
    }
  };
  
  const clearErrorsOnChange = () => {
    if (errors.email || errors.password || errors.general) {
      setErrors({ email: '', password: '', general: '' });
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.dark}>
      <StatusBar style='light' />
      <View style={styles.container}>
        <BackButton size={30} />
        <View>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.welcomeSubText}>
            Access your secure vault and manage your saved passwords easily.
          </Text>
        </View>
        <View style={styles.formWrapper}>
          <View style={styles.formContainer}>
            {errors.general ? <Text style={styles.errorGeneral}>{errors.general}</Text> : null}
            <Input
              icon={<Icon name='email' size={26} color={theme.colors.text} />}
              placeholder='Enter your email'
              onChangeText={(text) => {
                setEmail(text);
                clearErrorsOnChange();
              }}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email ? <Text style={styles.errorTag}>{errors.email}</Text> : null}
            <Input
              icon={<Icon name='lock' size={26} color={theme.colors.text} />}
              placeholder='Enter your password'
              // 2. AÑADIDO: Controla si el texto es seguro basado en el estado
              secureTextEntry={!isPasswordVisible}
              onChangeText={(text) => {
                setPassword(text);
                clearErrorsOnChange();
              }}
              value={password}
              // 3. AÑADIDO: Usa la prop rightIcon para mostrar el botón
              rightIcon={
                <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Icon name={isPasswordVisible ? 'show' : 'hide'} size={26} color={theme.colors.text} />
                </Pressable>
              }
            />
            {errors.password ? <Text style={styles.errorTag}>{errors.password}</Text> : null}
            <Pressable onPress={() => router.push('/forgotPassword')}>
              <Text style={styles.forgotPassword}>
                Forgot Password?
              </Text>
            </Pressable>
            <Button 
              title={'Login'}
              textStyle={{color: theme.colors.dark}}
              loading={loading}
              onPress={handleLogin}
            />
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {"Don't have an account?"}
              </Text>
              <Pressable onPress={() => router.push('/signUp')}>
                <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]} >
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Login;

// Los estilos se quedan igual que en tu versión anterior
const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: theme.colors.dark,
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
    marginHorizontal: -wp(5), 
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
  forgotPassword: {
    textAlign: 'right',
    fontWeight: theme.fonts.semibold,
    color: theme.colors.primaryDark
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
});