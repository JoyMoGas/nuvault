import { Pressable, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { theme } from '@/constants/theme';
import { hp } from '@/helpers/common';
import Icon, { IconName } from '@/assets/icons/icons';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { EncryptionService } from '@/services/encryptionService'; // ✅ 1. Importar el servicio de encriptación

const categoryIconsById: Record<number, IconName> = {
  1: 'email', 2: 'socialMedia', 3: 'shopping', 4: 'bank', 5: 'media', 
  6: 'gaming', 7: 'work', 8: 'cloud', 9: 'education', 10: 'health', 
  11: 'airplane', 12: 'tools', 13: 'news', 14: 'bill', 15: 'home', 
  16: 'build', 17: 'wifi', 18: 'browser', 19: 'mobile', 20: 'other',
};

const getIconByCategory = (category?: number) => {
  const iconName = categoryIconsById[category || 20] || 'other';
  return <Icon name={iconName} size={40} />;
};

interface Vault {
  id: string;
  category_id: number;
  service_name: string;
  service_username: string;
  encrypted_password: string;
  is_favorite?: boolean;
}

interface PasswordCardProps {
  vault: Vault;
  onFavoriteChanged: (id: string, newValue: boolean) => void;
  onDeletePress: (vault: Vault) => void;
  onShowSuccess: (message: string) => void;
}

const PasswordCard: React.FC<PasswordCardProps> = ({ vault, onFavoriteChanged, onDeletePress, onShowSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // ✅ 2. Añadir estados para la contraseña desencriptada y el estado de carga
  const [decryptedPassword, setDecryptedPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 3. Crear una función para desencriptar la contraseña solo cuando sea necesario
  const getAndSetDecryptedPassword = async () => {
    // Si ya la tenemos, la devolvemos para no desencriptar de nuevo
    if (decryptedPassword) return decryptedPassword;

    setIsLoading(true);
    try {
      // Asegúrate de que tu EncryptionService tiene la Master Key cargada al iniciar sesión
      const plainText = EncryptionService.decryptPassword(vault.encrypted_password);
      setDecryptedPassword(plainText);
      return plainText;
    } catch (error) {
      console.error("Falló la desencriptación:", error);
      // Opcional: mostrar un modal de error aquí
      return "Error";
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    const newValue = !vault.is_favorite;
    onFavoriteChanged(vault.id, newValue);
    const { error } = await supabase
      .from('vault_entries')
      .update({ is_favorite: newValue })
      .eq('id', vault.id);
    if (error) {
      console.error('Error al actualizar favorito:', error.message);
      onFavoriteChanged(vault.id, !newValue);
    }
  };

  // ✅ 4. Actualizar la función de copiar para que use la contraseña desencriptada
  const handleCopyPassword = async () => {
    const plainText = await getAndSetDecryptedPassword();
    if (plainText !== "Error") {
      await Clipboard.setStringAsync(plainText);
      onShowSuccess("Password copied to clipboard!");
    }
  };

  // ✅ 5. Actualizar la función para mostrar/ocultar la contraseña
  const handleToggleVisibility = async () => {
    // Si vamos a mostrar la contraseña por primera vez, la desencriptamos
    if (!showPassword && !decryptedPassword) {
      await getAndSetDecryptedPassword();
    }
    // Luego, simplemente cambiamos la visibilidad
    setShowPassword(!showPassword);
  };

  const handleEdit = () => {
    router.push({
      pathname: '/editPassword',
      params: { vaultId: vault.id }
    });
  };

  const handleDelete = () => {
    onDeletePress(vault);
  };

  return (
    <Swipeable
      renderRightActions={() => (
        <View style={styles.buttonContainer}>
          <Pressable onPress={handleEdit} style={[{ backgroundColor: '#808080' }, styles.actionButton]}>
            <Icon name="edit" size={24} color={theme.colors.light} />
          </Pressable>
          <Pressable onPress={handleDelete} style={[{ backgroundColor: theme.colors.red }, styles.actionButton]}>
            <Icon name="delete" size={24} color={theme.colors.light} />
          </Pressable>
        </View>
      )}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          {getIconByCategory(vault.category_id)}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>{vault.service_name}</Text>
          <Text style={styles.infoName}>{vault.service_username}</Text>
          <View style={styles.infoPassContainer}>
            {/* ✅ 6. Mostrar el estado de carga o la contraseña correcta */}
            {isLoading ? (
                <ActivityIndicator color={theme.colors.darkGray} />
            ) : (
                <Text style={[styles.passwordTextBase, { fontSize: showPassword ? 16 : 20 }]}>
                    {showPassword ? decryptedPassword : '●●●●●●●●'}
                </Text>
            )}
            <Pressable onPress={handleToggleVisibility}>
              <Icon name={showPassword ? 'hide' : 'show'} size={24} color={theme.colors.darkGray} />
            </Pressable>
          </View>
        </View>

        <View style={styles.iconsContainer}>
          <Pressable onPress={handleCopyPassword}>
            <Icon name="copy" size={31} />
          </Pressable>
          <TouchableOpacity onPress={handleToggleFavorite}>
            <Icon
              name="favorite"
              size={31}
              color={vault.is_favorite ? theme.colors.red : '#808080'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );
};

export default PasswordCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.light,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: hp(1.5),
    borderRadius: theme.radius.xl,
    borderWidth: 0.5,
    borderColor: theme.colors.semiWhite,
  },
  iconContainer: {
    width: 66,
    height: 66,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  infoTitle: {
    fontSize: theme.size.subtitle,
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  infoName: {
    fontSize: theme.size.sm,
    color: theme.colors.darkGray,
  },
  infoPassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 28, // Altura mínima para evitar saltos al cargar
  },
  passwordTextBase: {
    color: '#808080',
    flexShrink: 1,
    fontWeight: 'bold',
  },
  iconsContainer: {
    marginLeft: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginRight: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    gap: 15,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.xxxl,
    height: 48,
    width: 48,
  },
});
