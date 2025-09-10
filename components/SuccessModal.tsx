import Icon, { IconName } from '@/assets/icons/icons';
import { theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import React, { useEffect, useRef } from 'react';
import {
	Animated,
	Modal,
	StyleSheet,
	Text,
	TouchableWithoutFeedback,
	View,
} from 'react-native';

interface SuccessModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  autoCloseDelay?: number;
  iconName?: IconName;
  iconColor?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  message,
  onClose,
  autoCloseDelay = 2000,
  iconName = 'correct',
  iconColor = '#22C55E',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-cerrar después del delay
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[
            styles.overlay,
            { opacity: fadeAnim },
          ]}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Icon 
                name={iconName}
                size={60} 
                color={iconColor}
              />
            </View>
            <Text style={styles.message}>{message}</Text>
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SuccessModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.xl,
    paddingVertical: hp(3),
    paddingHorizontal: wp(6),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    minWidth: wp(70),
    maxWidth: wp(85),
  },
  iconContainer: {
    marginBottom: hp(1.5),
  },
  message: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: theme.colors.dark,
    textAlign: 'center',
    lineHeight: hp(3),
  },
});
