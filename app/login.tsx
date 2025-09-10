// app/login.tsx

import { StyleSheet, Text, View, Pressable, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import BackButton from '../components/BackButton'
import Input from '../components/Input'
import Button from '../components/Button'
import Icon from '@/assets/icons/icons'
import { supabase } from '@/lib/supabase'

const Login = () => {
  const router = useRouter()
  const emailRef = useRef("")
  const passwordRef = useRef("")
  const [loading, setLoading] = useState(false)

  // ... (la función navigate se queda igual)
  const navigate = (route) => router.push(route);

  const onSubmit = async () => {
    // ... (la función onSubmit se queda igual)
    if(!emailRef.current || !passwordRef.current) {
      Alert.alert('Login', 'Please fill all the fields!')
      return;
    }
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();
    setLoading(true);

    const {error} = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false)

    if (error) {
      Alert.alert('Login', error.message);
    }
  }

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
            <Input
              icon={<Icon name='email' size={26} />}
              placeholder='Enter your email'
              onChangeText={(value: string) => {emailRef.current = value}}
            />
            <Input
              icon={<Icon name='lock' size={26} />}
              placeholder='Enter your password'
              secureTextEntry
              onChangeText={(value: string) => {passwordRef.current = value}}
            />

            {/* ✅ CAMBIO AQUÍ */}
            <Pressable onPress={() => navigate('/forgotPassword')}>
              <Text style={styles.forgotPassword}>
                Forgot Password?
              </Text>
            </Pressable>
            {/* FIN DEL CAMBIO */}

            <Button 
              title={'Login'}
              textStyle={{color: theme.colors.dark}}
              loading={loading}
              onPress={onSubmit}
            />
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {"Don't have an account?"}
              </Text>
              <Pressable onPress={() => navigate('/signUp')}>
                <Text
                  style={[
                    styles.footerText,
                    {
                      color: theme.colors.primaryDark,
                      fontWeight: theme.fonts.semibold,
                    },
                  ]} >
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

// ... (los estilos se quedan igual)
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
})