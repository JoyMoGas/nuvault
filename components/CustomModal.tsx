// components/CustomModal.tsx

import Icon, { IconName } from '@/assets/icons/icons';
import { theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

// Definimos las propiedades que nuestro modal aceptará
interface CustomModalProps {
  isVisible: boolean;
  onClose: () => void;
  iconName: IconName; // Nombre del ícono de tu set de íconos
  iconSize?: number;
  iconColor?: string;
  title: string;
  description: string;
  primaryButtonTitle: string;
  onPrimaryButtonPress: () => void;
  primaryButtonColor?: string;
  secondaryButtonTitle?: string; // Título del botón secundario (opcional)
  onSecondaryButtonPress?: () => void; // Acción del botón secundario (opcional)
  secondaryButtonColor?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  onClose,
  iconName,
  iconSize = 40,
  iconColor = theme.colors.primary,
  title,
  description,
  primaryButtonTitle,
  onPrimaryButtonPress,
  primaryButtonColor = theme.colors.primary,
  secondaryButtonTitle,
  onSecondaryButtonPress,
  secondaryButtonColor = theme.colors.darkGray,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Icono */}
          <View style={styles.iconContainer}>
            <Icon name={iconName} size={iconSize} color={iconColor} />
          </View>

          {/* Título */}
          <Text style={styles.modalTitle}>{title}</Text>
          
          {/* Descripción */}
          <Text style={styles.modalText}>{description}</Text>

          {/* Contenedor de Botones */}
          <View style={styles.buttonContainer}>
            {/* Botón Secundario (solo si existe) */}
            {secondaryButtonTitle && onSecondaryButtonPress && (
              <Pressable
                style={[styles.button, { backgroundColor: secondaryButtonColor }]}
                onPress={onSecondaryButtonPress}
              >
                <Text style={styles.textStyle}>{secondaryButtonTitle}</Text>
              </Pressable>
            )}

            {/* Botón Primario */}
            <Pressable
              style={[styles.button, { backgroundColor: primaryButtonColor }]}
              onPress={onPrimaryButtonPress}
            >
              <Text style={styles.textStyle}>{primaryButtonTitle}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: wp(85), // Ancho del 85% de la pantalla
  },
  iconContainer: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    marginBottom: 10,
    textAlign: 'center',
    color: theme.colors.dark,
  },
  modalText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    marginBottom: 25,
    textAlign: 'center',
    color: theme.colors.darkGray,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 15,
  },
  button: {
    borderRadius: theme.radius.xl,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    flex: 1, // Para que los botones ocupen el espacio disponible
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: hp(1.8),
  },
});

export default CustomModal;