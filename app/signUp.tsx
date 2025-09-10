import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../assets/icons/icons/index';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import Input from '../components/Input';
import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { supabase } from '../lib/supabase';

const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const nameRef = useRef('');
  const [loading, setLoading] = useState(false);

  const Routes = {
    SIGN_UP: '/signUp',
    LOGIN: '/login',
    WELCOME: '/welcome',
  } as const;

  type RouteKeys = keyof typeof Routes;

  const navigate = (route: RouteKeys) => router.push(Routes[route]);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      Alert.alert('Sign Up', 'Please fill all the fields!');
      return;
    }

    let username = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        // ✅ AGREGADO: URL de redirección para verificación de email
        emailRedirectTo: 'https://nuvaultapp.netlify.app/email-validation',
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert('Sign Up', error.message);
      return;
    }

    if (data.user) {
      Alert.alert(
        'Verify your email',
        'We sent you a confirmation link. Please check your inbox before logging in.'
      );
      // Opcional: redirigir a una pantalla "Check your email"
      navigate('LOGIN');
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.dark}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* back button */}
        <View style={{marginTop: 10}}>
          <BackButton  size={30} />
        </View>
        

        {/* welcome */}
        <View>
          <Text style={styles.welcomeText}>Create Your Vault</Text>
          <Text style={styles.welcomeSubText}>
            Sign up to protect, store and organize your passwords in one secure place.
          </Text>
        </View>

        {/* form */}
        <View style={styles.formWrapper}>
          <View style={styles.formContainer}>

            <Input
              icon={<Icon name="user" size={26} />}
              placeholder="Enter your name"
              onChangeText={(value: string) => {
                nameRef.current = value;
              }}
            />
            <Input
              icon={<Icon name="email" size={26} />}
              placeholder="Enter your email"
              onChangeText={(value: string) => {
                emailRef.current = value;
              }}
            />
            <Input
              icon={<Icon name="lock" size={26} />}
              placeholder="Enter your password"
              secureTextEntry
              onChangeText={(value: string) => {
                passwordRef.current = value;
              }}
            />

            <Button title={'Sign Up'} loading={loading} onPress={onSubmit} textStyle={{color: theme.colors.dark}} />

            {/* footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable onPress={() => navigate('LOGIN')}>
                <Text
                  style={[
                    styles.footerText,
                    {
                      color: theme.colors.primaryDark,
                      fontWeight: theme.fonts.semibold,
                    },
                  ]}
                >
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

  form: {
    gap: 25,
  },

  forgotPassword: {
    textAlign: 'right',
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
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