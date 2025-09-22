import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { theme } from '@/constants/theme';
import { hp } from '@/helpers/common';
import Icon, { IconName } from '@/assets/icons/icons';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

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

  // Se elimina el estado local 'isFavorite' para evitar conflictos de renderizado.
  // La única fuente de verdad es la prop 'vault'.

  const handleToggleFavorite = async () => {
    const newValue = !vault.is_favorite;
    onFavoriteChanged(vault.id, newValue); // Actualización optimista en la UI

    const { error } = await supabase
      .from('vault_entries')
      .update({ is_favorite: newValue })
      .eq('id', vault.id);
    if (error) {
      console.error('Error al actualizar favorito:', error.message);
      onFavoriteChanged(vault.id, !newValue); // Revertir si hay error
    }
  };

  const handleCopyPassword = async () => {
    await Clipboard.setStringAsync(vault.encrypted_password);
    onShowSuccess("Password copied to clipboard!");
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
          <Pressable
            onPress={handleEdit}
            style={[{ backgroundColor: '#808080' }, styles.actionButton]}
          >
            <Icon name="edit" size={24} color={theme.colors.light} />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={[{ backgroundColor: theme.colors.red }, styles.actionButton]}
          >
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
            {/* ✅ CAMBIO: El estilo ahora es dinámico */}
            <Text
              style={[
                styles.passwordTextBase,
                { fontSize: showPassword ? 16 : 20 } // Tamaño de fuente dinámico
              ]}
            >
              {showPassword ? vault.encrypted_password : '●●●●●●●●'}
            </Text>

            {/* ✅ CAMBIO: El texto "View/Hide" es ahora un icono */}
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Icon 
                name={showPassword ? 'hide' : 'show'} 
                size={24} 
                color={theme.colors.darkGray} 
              />
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
  },
  // ✅ NUEVO ESTILO: Estilo base para el texto de la contraseña
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