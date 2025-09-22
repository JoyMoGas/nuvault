import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { hp, wp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import ScreenWrapper from '@/components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import Icon from '@/assets/icons/icons';
import { calculatePasswordStrength, StrengthLevel } from '@/helpers/calculatePasswordStrength';
import { generatePassword, PasswordOptions } from '@/helpers/passwordGenerator';
import * as Clipboard from 'expo-clipboard';


const PasswordGenerator = () => {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 15,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecial: false,
  });

  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<{ level: StrengthLevel; score: number } | null>(null);
  const [copied, setCopied] = useState(false);

  // Generar contraseña al cargar y cuando cambian las opciones
  useEffect(() => {
    handleGenerate();
  }, [options]);

  const handleGenerate = () => {
    const newPassword = generatePassword(options);
    setGeneratedPassword(newPassword);
    if (newPassword) {
      setPasswordStrength(calculatePasswordStrength(newPassword));
    } else {
      setPasswordStrength(null);
    }
  };

  const handleCopy = () => {
    if (generatedPassword && generatedPassword !== 'Select an option') {
      Clipboard.setStringAsync(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // El mensaje "Copied" desaparece después de 2 segundos
    }
  };
  
  const updateOption = (key: keyof PasswordOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const changeLength = (amount: number) => {
    setOptions(prev => ({
        ...prev,
        length: Math.max(8, Math.min(50, prev.length + amount)) // Limita la longitud entre 8 y 50
    }));
  };

  return (
    <ScreenWrapper bg="#f8f8f8">
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
            <BackButton size={30} />
            <Text style={styles.title}>Generator</Text>
        </View>

        {/* --- Display de la Contraseña --- */}
        <View style={styles.passwordDisplay}>
            <Text style={styles.passwordText}>{generatedPassword}</Text>
            <TouchableOpacity onPress={handleGenerate}>
                <Icon name="regenerate" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
        </View>

        {/* --- Indicador de Fortaleza --- */}
        {passwordStrength && (
            <View style={styles.strengthIndicator}>
                <Text style={[styles.strengthText, { color: getColorForStrength(passwordStrength.level) }]}>
                    {passwordStrength.level}
                </Text>
                <Icon name="security" size={18} color={getColorForStrength(passwordStrength.level)} />
            </View>
        )}

        {/* --- Botón de Copiar --- */}
        <Button 
            title={copied ? "Copied ✓" : "Copy"}
            onPress={handleCopy}
            buttonStyle={styles.copyButton}
            textStyle={styles.copyButtonText}
        />

        {/* --- Opciones de Personalización --- */}
        <View style={styles.optionsContainer}>
            <OptionRow label="Length">
                <View style={styles.lengthControl}>
                    <TouchableOpacity onPress={() => changeLength(-1)} style={styles.lengthButton}>
                        <Text style={styles.lengthButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.lengthValue}>{options.length}</Text>
                    <TouchableOpacity onPress={() => changeLength(1)} style={styles.lengthButton}>
                        <Text style={styles.lengthButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </OptionRow>
            
            <OptionRow label="Uppercase (A-Z)">
                <Switch
                    trackColor={{ false: "#767577", true: "#FFD700" }}
                    thumbColor={"#f4f3f4"}
                    onValueChange={(val) => updateOption('includeUppercase', val)}
                    value={options.includeUppercase}
                />
            </OptionRow>

            <OptionRow label="Lowercase (a-z)">
                <Switch
                    trackColor={{ false: "#767577", true: "#FFD700" }}
                    thumbColor={"#f4f3f4"}
                    onValueChange={(val) => updateOption('includeLowercase', val)}
                    value={options.includeLowercase}
                />
            </OptionRow>

            <OptionRow label="Numbers (0-9)">
                 <Switch
                    trackColor={{ false: "#767577", true: "#FFD700" }}
                    thumbColor={"#f4f3f4"}
                    onValueChange={(val) => updateOption('includeNumbers', val)}
                    value={options.includeNumbers}
                />
            </OptionRow>

            <OptionRow label="Special (!@#$...)">
                 <Switch
                    trackColor={{ false: "#767577", true: "#FFD700" }}
                    thumbColor={"#f4f3f4"}
                    onValueChange={(val) => updateOption('includeSpecial', val)}
                    value={options.includeSpecial}
                />
            </OptionRow>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
};

// Componente auxiliar para las filas de opciones
const OptionRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>{label}</Text>
        {children}
    </View>
);

const getColorForStrength = (level: StrengthLevel) => {
    switch (level) {
        case 'Very Weak': return '#EF4444';
        case 'Weak': return '#F59E0B';
        case 'Medium': return '#EAB308';
        case 'Strong': return '#22C55E';
        case 'Very Strong': return '#16A34A';
        default: return '#E5E7EB';
    }
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  title: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: theme.colors.dark,
    textAlign: 'center',
    flex: 1,
    marginLeft: -wp(7),
  },
  passwordDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: hp(1),
  },
  passwordText: {
    fontSize: hp(2.2),
    color: theme.colors.dark,
    flex: 1,
  },
  strengthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: wp(2),
    marginBottom: hp(2),
  },
  strengthText: {
    fontSize: hp(1.8),
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: '#FFD700',
    height: hp(7),
    marginBottom: hp(4),
  },
  copyButtonText: {
    color: theme.colors.dark,
    fontWeight: 'bold',
    fontSize: hp(2.2),
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.xl,
    padding: wp(4),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionLabel: {
    fontSize: hp(2),
    color: theme.colors.darkGray,
  },
  lengthControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  lengthButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lengthButtonText: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    color: theme.colors.darkGray,
  },
  lengthValue: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: theme.colors.dark,
    minWidth: 30,
    textAlign: 'center',
  }
});

export default PasswordGenerator;