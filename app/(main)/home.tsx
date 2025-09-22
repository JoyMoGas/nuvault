import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import ScoreBar from '@/components/SecurityScoreBar';
import SecurityScore from '@/components/SecurityScore';
import PasswordCard from '@/components/PasswordCard';
import { theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import { useAuth } from '@/contexts/authContext';
import { getGreeting } from '@/helpers/greetings';
import SearchBar from '@/components/SearchBar';
import { getUserData } from '@/services/userService';
import { supabase } from '@/lib/supabase';
import { deleteVault, fetchVaults } from '@/services/vaultsService';
import Icon from '@/assets/icons/icons';
import { getUserSecurityStatus } from '@/helpers/calculatePasswordStrength';
import GoToAdd from '@/components/GoToAdd';
import SettingsButton from '@/components/SettingsButton';
import GenerateButton from '@/components/GenerateButton';
import { StatusBar } from 'expo-status-bar';
import CustomModal from '@/components/CustomModal';
import SuccessModal from '@/components/SuccessModal';

let limit = 0;

interface Vault {
  id: string;
  user_id?: string;
  service_name: string;
  service_username: string;
  created_at?: string;
  is_favorite?: boolean;
  [key: string]: any;
  user?: Record<string, any>;
}

interface Payload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Vault;
  old?: Vault;
}

const Home = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [securityStatus, setSecurityStatus] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedTag, setSelectedTag] = useState<'All' | 'Favorites' | 'Recent' | 'Oldest'>('All');
  const [username, setUsername] = useState(user?.username || 'User');
  const [modalConfig, setModalConfig] = useState<any>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccessModal = (message: string) => {
    setSuccessMessage(message);
    setSuccessModalVisible(true);
  };

  useEffect(() => {
    setGreeting(getGreeting(new Date()));
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  const filteredVaults = vaults.filter(vault =>
    vault.service_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    vault.service_username?.toLowerCase().includes(searchText.toLowerCase())
  );

  const tagFilteredVaults = [...filteredVaults]
    .sort((a, b) => {
      if (selectedTag === 'Recent') {
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      }
      if (selectedTag === 'Oldest') {
        return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
      }
      return 0;
    })
    .filter(vault => {
      if (selectedTag === 'Favorites') return vault.is_favorite === true;
      return true;
    });

  const handleVaultEvent = async (payload: Payload) => {
    if (payload.eventType === 'INSERT' && payload.new?.id) {
      const newVault: Vault = { ...payload.new };
      if (newVault.user_id !== user?.id) return;
      const res = await getUserData(newVault.user_id);
      newVault.user = res.success ? res.data : {};
      setVaults(prevVaults => [newVault, ...prevVaults]);
    }
    if (payload.eventType === 'DELETE' && payload.old?.id) {
      setVaults(prevVaults => prevVaults.filter(vault => vault.id !== payload.old?.id));
    }
    if (payload.eventType === 'UPDATE' && payload.new?.id) {
      setVaults(prevVaults =>
        prevVaults.map(vault => (vault.id === payload.new?.id ? { ...vault, ...payload.new } : vault))
      );
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    const userChannel = supabase
      .channel(`user:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `userId=eq.${user.id}` },
        (payload: any) => {
          if (payload.new.username) {
            setUsername(payload.new.username);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(userChannel);
    };
  }, [user?.id]);

  useEffect(() => {
    const vaultChannel = supabase
      .channel('vault_entries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vault_entries' },
        handleVaultEvent
      )
      .subscribe();
    fetchVaultsData();
    return () => {
      supabase.removeChannel(vaultChannel);
    };
  }, [user]);

  const fetchVaultsData = async () => {
    if (!user?.id) return;
    limit += 10;
    const res = await fetchVaults(user.id, limit);
    if (res.success) {
      setVaults(res.data || []);
    } else {
      console.error('Failed to fetch vaults:', res.msg);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    const fetchSecurity = async () => {
      const result = await getUserSecurityStatus(user.id);
      setSecurityStatus(result.securityStatus);
    };
    fetchSecurity();
  }, [user, vaults]);

  const handleDeleteRequest = (vaultToDelete: Vault) => {
    setModalConfig({
      iconName: "delete",
      iconColor: theme.colors.red,
      title: "Confirm Deletion",
      description: `Are you sure you want to delete the entry for "${vaultToDelete.service_name}"?`,
      primaryButtonTitle: "Delete",
      onPrimaryButtonPress: () => executeDelete(vaultToDelete.id),
      primaryButtonColor: theme.colors.red,
      secondaryButtonTitle: "Cancel",
    });
  };

  const executeDelete = async (vaultId: string) => {
    setModalConfig(null);
    const res = await deleteVault(vaultId);
    if (res.success) {
      setVaults(prevVaults => prevVaults.filter(v => v.id !== vaultId));
    } else {
      setModalConfig({
        iconName: "error",
        iconColor: theme.colors.red,
        title: "Error",
        description: res.msg || "Failed to delete the entry. Please try again.",
        primaryButtonTitle: "OK",
      });
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.dark}>
      <StatusBar style='light' />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.userInfoRow}>
            <View>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.greetings}>{greeting}</Text>
            </View>
            <SettingsButton />
          </View>
        </View>

        <View style={styles.securityContainer}>
          <ScoreBar score={securityStatus}>
            <SecurityScore score={securityStatus} />
          </ScoreBar>
        </View>

        <View style={styles.generateContainer}>
          <GenerateButton />
        </View>

        <View style={styles.content}>
          <SearchBar value={searchText} onChangeText={setSearchText} />

          <View style={styles.tagsRow}>
            {['All', 'Favorites', 'Recent', 'Oldest'].map((tag) => (
              <Pressable
                key={tag}
                onPress={() => setSelectedTag(tag as any)}
                style={[styles.tag, selectedTag === tag && styles.tagActive]}
              >
                <Text style={[styles.tagText, selectedTag === tag && styles.tagTextActive]}>
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>

          {tagFilteredVaults.length === 0 ? (
            <View style={styles.noVaultsContainer}>
              <Text style={styles.noVaultsText}>
                {"You don't have any saved passwords yet."}
              </Text>
              <Text style={styles.noVaultsText}>
                Please press <Icon name="add" size={16} /> to start
              </Text>
            </View>
          ) : (
            tagFilteredVaults.map((vault) => (
              <PasswordCard
                key={vault.id}
                vault={vault}
                onFavoriteChanged={(id, newValue) => {
                  setVaults((prev) =>
                    prev.map((v) =>
                      v.id === id ? { ...v, is_favorite: newValue } : v
                    )
                  );
                }}
                onDeletePress={handleDeleteRequest}
                onShowSuccess={showSuccessModal} 
              />
            ))
          )}
        </View>
      </ScrollView>

      {modalConfig && (
        <CustomModal
          isVisible={!!modalConfig}
          onClose={() => setModalConfig(null)}
          {...modalConfig}
          onPrimaryButtonPress={
            modalConfig.onPrimaryButtonPress || (() => setModalConfig(null))
          }
           onSecondaryButtonPress={
            modalConfig.onSecondaryButtonPress || (() => setModalConfig(null))
          }
        />
      )}
      
      {successModalVisible && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <SuccessModal
            visible={successModalVisible}
            message={successMessage}
            onClose={() => setSuccessModalVisible(false)}
            iconName="correct"
            iconColor="#22C55E"
            autoCloseDelay={2000}
          />
        </View>
      )}

      <View style={styles.floatingButton}>
        <GoToAdd />
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    paddingHorizontal: hp(2),
  },
  username: {
    color: theme.colors.light,
    fontSize: theme.size.subtitle,
    marginBottom: 4,
    fontWeight: theme.fonts.medium,
  },
  greetings: {
    color: theme.colors.light,
    fontSize: theme.size.sm,
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  securityContainer: {
    marginTop: hp(2),
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  content: {
    flex: 1,
    marginTop: hp(5),
    paddingTop: hp(2),
    paddingHorizontal: hp(2),
    backgroundColor: theme.colors.light,
    borderTopLeftRadius: theme.radius.xxxl,
    borderTopRightRadius: theme.radius.xxxl,
    padding: wp(2),
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 5,
    gap: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  tag: {
    width: wp(20),
    height: 36,
    borderRadius: 20,
    backgroundColor: theme.colors.light,
    borderColor: theme.colors.semiWhite,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  tagActive: {
    backgroundColor: theme.colors.primary,
  },
  tagText: {
    color: theme.colors.dark,
    fontSize: theme.size.sm,
  },
  tagTextActive: {
    fontWeight: 'bold',
  },
  noVaultsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  noVaultsText: {
    color: theme.colors.darkGray,
    fontSize: theme.size.subtitle,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    zIndex: 100,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  generateContainer: {
    position: 'absolute',
    top: '33%',
    right: 15,
    zIndex: 100,
  },
  overlayContainer: {
  ...StyleSheet.absoluteFillObject,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999, // 🔑 asegura que quede arriba del ScrollView
},

});