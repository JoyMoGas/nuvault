import { StyleSheet, TextInput, View, TextInputProps } from 'react-native';
import React from 'react';
import { hp } from '@/helpers/common';
import { theme } from '@/constants/theme';

interface CustomInputProps extends TextInputProps {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
}

const Input = ({ icon, rightIcon, containerStyle, ...props }: CustomInputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {icon}
      <TextInput
        style={styles.inputField}
        placeholderTextColor={theme.colors.textGray}
        {...props}
      />
      {rightIcon}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: hp(7.2),
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    borderCurve: 'continuous',
    paddingHorizontal: 18,
    gap: 12,
  },
  inputField: {
    flex: 1,
    color: theme.colors.text, // Aseguramos que el texto sea visible
    fontSize: hp(2), // Un tamaño de fuente razonable
  },
});