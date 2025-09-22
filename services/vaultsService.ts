import { supabase } from "../lib/supabase";
import { EncryptionService } from "./encryptionService";
import { getUserId } from "./userService";

type Response<T> = {
  success: boolean;
  data?: T;
  msg?: string;
  error?: string;
};

export interface Vault {
  id: string;
  user_id?: string;
  userId?: string;
  service_name?: string;
  service_username?: string;
  encrypted_password?: string;
  name?: string;
  email?: string;
  password?: string;
  category?: string;
  category_id?: string;
  created_at?: string;
  is_favorite?: boolean;
  strength?: string;
  strength_score?: number;
  [key: string]: any;
}

const safeDecryptPassword = (encryptedPassword: string): string => {
  try {
    if (!EncryptionService.isMasterKeySet()) {
      console.warn('⚠️ Master key not set, attempting to set temporary key');
      EncryptionService.setTempMasterKey();
    }
    const decrypted = EncryptionService.decryptPassword(encryptedPassword);
    return decrypted;
  } catch (error) {
    console.warn('⚠️ Failed to decrypt password, returning masked value', error);
    return '••••••••';
  }
};

export const fetchVaults = async (userId: string, limit: number = 10): Promise<Response<Vault[]>> => {
  try {
    const { data, error } = await supabase
      .from('vault_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      return { success: false, msg: 'Could not fetch vaults' };
    }
    const processedData = (data || []).map(vault => ({
      ...vault,
      userId: vault.user_id,
      password: vault.encrypted_password ? safeDecryptPassword(vault.encrypted_password) : '••••••••',
    }));
    return { success: true, data: processedData };
  } catch (error: any) {
    return { success: false, msg: 'Could not fetch vaults' };
  }
};

export const fetchVaultById = async (vaultId: string): Promise<Response<Vault>> => {
  try {
    const { data, error } = await supabase
      .from('vault_entries')
      .select('*')
      .eq('id', vaultId)
      .single();
    if (error) {
      return { success: false, msg: 'Could not fetch vault entry' };
    }
    const processedData = {
      ...data,
      userId: data.user_id,
      password: data.encrypted_password ? safeDecryptPassword(data.encrypted_password) : '••••••••',
    };
    return { success: true, data: processedData };
  } catch (error: any) {
    return { success: false, msg: 'Could not fetch vault entry' };
  }
};

export const createOrUpdateVault = async (vault: Vault): Promise<Response<Vault>> => {
  try {
    const vaultToSave = { ...vault };
    if (vault.password && !vault.encrypted_password) {
      if (!EncryptionService.isMasterKeySet()) {
        EncryptionService.setTempMasterKey();
      }
      vaultToSave.encrypted_password = EncryptionService.encryptPassword(vault.password);
      delete vaultToSave.password;
    }
    delete vaultToSave.userId;
    const { data, error } = await supabase
      .from('vault_entries')
      .upsert(vaultToSave)
      .select()
      .single();
    if (error) {
      return { success: false, msg: 'Could not create or update vault' };
    }
    const responseData = {
      ...data,
      userId: data.user_id,
      password: data.encrypted_password ? safeDecryptPassword(data.encrypted_password) : '••••••••',
    };
    return { success: true, data: responseData };
  } catch (error: any) {
    return { success: false, msg: 'Could not create or update vault' };
  }
};

export const addVaultEntry = async (entry: {
  category_id: string;
  service_name: string;
  service_username: string;
  password: string;
  strength?: string;
  strength_score?: number;
  is_favorite?: boolean;
}): Promise<Response<Vault>> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, msg: 'User not authenticated' };
    }
    const vaultEntry = {
      user_id: user.id,
      category_id: entry.category_id,
      service_name: entry.service_name,
      service_username: entry.service_username,
      encrypted_password: entry.password,
      strength: entry.strength,
      strength_score: entry.strength_score,
      is_favorite: entry.is_favorite || false,
    };
    const { data, error } = await supabase
      .from('vault_entries')
      .insert([vaultEntry])
      .select()
      .single();
    if (error) {
      return { success: false, msg: 'Could not save vault entry', error: error.message };
    }
    const responseData = {
      ...data,
      userId: data.user_id,
      password: data.encrypted_password ? safeDecryptPassword(data.encrypted_password) : '••••••••',
    };
    return { success: true, data: responseData };
  } catch (error: any) {
    return { success: false, msg: 'Could not save vault entry', error: error.message };
  }
};

export const updateVaultEntry = async (
  entryId: string, 
  updates: Partial<Vault>
): Promise<Response<Vault>> => {
  try {
    const updateData = { ...updates };
    if (updates.password) {
      if (!EncryptionService.isMasterKeySet()) {
        EncryptionService.setTempMasterKey();
      }
      updateData.encrypted_password = EncryptionService.encryptPassword(updates.password);
      delete updateData.password;
    }
    delete updateData.userId;
    delete updateData.id;
    const { data, error } = await supabase
      .from('vault_entries')
      .update(updateData)
      .eq('id', entryId)
      .select()
      .single();
    if (error) {
      return { success: false, msg: 'Could not update vault entry', error: error.message };
    }
    const responseData = {
      ...data,
      userId: data.user_id,
      password: data.encrypted_password ? safeDecryptPassword(data.encrypted_password) : '••••••••',
    };
    return { success: true, data: responseData };
  } catch (error: any) {
    return { success: false, msg: 'Could not update vault entry', error: error.message };
  }
};

// REEMPLAZA tu función deleteVaultEntry con esta:
export const deleteVault = async (vaultId: string): Promise<Response<void>> => {
  try {
    const { error } = await supabase
      .from('vault_entries')
      .delete()
      .eq('id', vaultId);

    if (error) {
      return { success: false, msg: 'Could not delete vault entry', error: error.message };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, msg: 'Could not delete vault entry', error: error.message };
  }
};

export const searchVaults = async (
  userId: string, 
  searchTerm: string
): Promise<Response<Vault[]>> => {
  try {
    const { data, error } = await supabase
      .from('vault_entries')
      .select('*')
      .eq('user_id', userId)
      .or(`service_name.ilike.%${searchTerm}%,service_username.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
    if (error) {
      return { success: false, msg: 'Could not search vaults' };
    }
    const processedData = (data || []).map(vault => ({
      ...vault,
      userId: vault.user_id,
      password: vault.encrypted_password ? safeDecryptPassword(vault.encrypted_password) : '••••••••',
    }));
    return { success: true, data: processedData };
  } catch (error: any) {
    return { success: false, msg: 'Could not search vaults' };
  }
};

export const getVaultsByCategory = async (
  userId: string, 
  categoryId: string
): Promise<Response<Vault[]>> => {
  try {
    const { data, error } = await supabase
      .from('vault_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    if (error) {
      return { success: false, msg: 'Could not fetch vaults by category' };
    }
    const processedData = (data || []).map(vault => ({
      ...vault,
      userId: vault.user_id,
      password: vault.encrypted_password ? safeDecryptPassword(vault.encrypted_password) : '••••••••',
    }));
    return { success: true, data: processedData };
  } catch (error: any) {
    return { success: false, msg: 'Could not fetch vaults by category' };
  }
};

// Esta función verifica si un nombre de servicio ya existe PARA UN USUARIO ESPECÍFICO.
export const checkIfServiceNameExists = async (serviceName: string): Promise<boolean> => {
  const userId = await getUserId();
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('vault_entries')
      .select('id')
      .eq('user_id', userId)
      .ilike('service_name', serviceName.trim()) // Usamos ilike para no distinguir mayúsculas/minúsculas
      .maybeSingle();

    if (error) {
      console.error("Error checking service name:", error.message);
      return false;
    }

    return !!data; // Si data no es null, significa que ya existe.
  } catch (e: any) {
    console.error("Unexpected error in checkIfServiceNameExists:", e.message);
    return false;
  }
};