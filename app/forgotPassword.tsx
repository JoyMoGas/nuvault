import Icon from '@/assets/icons/icons';
import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ScreenWrapper from '@/components/ScreenWrapper';
import { theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CustomModal from '@/components/CustomModal';

const ForgotPassword = () => {
  const router = useRouter();
  const emailRef = useRef('');
  const [loading, setLoading] = useState(false);
  
  const [modalConfig, setModalConfig] = useState<any>(null);

  const handleSendInstructions = async () => {
    if (!emailRef.current) {
      setModalConfig({
        iconName: "error",
        iconColor: theme.colors.red,
        title: "Error",
        description: "Please enter your email address.",
        primaryButtonTitle: "OK",
      });
      return;
    }

    setLoading(true);
    
    const redirectUrl = Linking.createURL('resetPassword'); 
    
    const { error } = await supabase.auth.resetPasswordForEmail(emailRef.current, {
        redirectTo: redirectUrl,
    });

    setLoading(false);

    if (error) {
      setModalConfig({
        iconName: "error",
        iconColor: theme.colors.red,
        title: "Error",
        description: error.message,
        primaryButtonTitle: "OK",
      });
    } else {
      setModalConfig({
        iconName: "checkEmail",
        iconColor: theme.colors.green,
        title: "Check your email",
        description: "Password reset instructions have been sent to your email address.",
        primaryButtonTitle: "OK",
        onPrimaryButtonPress: () => router.back(),
      });
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.light}>
      <View style={styles.container}>
        <View style={{ marginTop: 10 }}>
          <BackButton />
        </View>
        <Text style={styles.headerText}>Forgot Password</Text>
        <Text style={styles.subtitleText}>{'Enter your email address and we\'ll send you instructions to reset your password.'}</Text>
        <Input
          icon={<Icon name="email" size={26} />}
          placeholder="Enter your email"
          keyboardType="email-address"
          onChangeText={(value) => (emailRef.current = value)}
        />
        <Button
          title="Send Instructions"
          loading={loading}
          onPress={handleSendInstructions}
          textStyle={{ color: theme.colors.dark }}
        />
      </View>

      {/* ✅ 3. Renderizar el modal dinámico */}
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
    }
});

export default ForgotPassword;