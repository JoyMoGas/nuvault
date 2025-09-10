// services/vaultsService.ts
import { supabase } from "../lib/supabase";
import { EncryptionService } from "./encryptionService";

type Response<T> = {
  success: boolean;
  data?: T;
  msg?: string;
  error?: string;
};

export interface Vault {
  id: string;
  user_id?: string;
  userId?: string;     // For backward compatibility
  service_name?: string;
  service_username?: string;
  encrypted_password?: string;
  name?: string;       // For backward compatibility
  email?: string;      // For backward compatibility
  password?: string;   // Decrypted password for display
  category?: string;   // For backward compatibility
  category_id?: string;
  created_at?: string;
  is_favorite?: boolean;
  strength?: string;
  strength_score?: number;
  [key: string]: any;
}

/**
 * Decrypt password with error handling
 */
const safeDecryptPassword = (encryptedPassword: string): string => {
  try {
    // Ensure encryption service is ready
    if (!EncryptionService.isMasterKeySet()) {
      console.warn('⚠️ Master key not set, attempting to set temporary key');
      EncryptionService.setTempMasterKey();
    }
    
    // Try to decrypt
    const decrypted = EncryptionService.decryptPassword(encryptedPassword);
    return decrypted;
  } catch (error) {
    console.warn('⚠️ Failed to decrypt password, returning masked value', error);
    // Return masked password if decryption fails
    return '••••••••';
  }
};

/**
 * Fetch vaults with decryption
 */
export const fetchVaults = async (userId: string, limit: number = 10): Promise<Response<Vault[]>> => {
  try {
    const { data, error } = await supabase
      .from('vault_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.log('fetchVaults error: ', error);
      return { success: false, msg: 'Could not fetch vaults' };
    }

    // Process and decrypt passwords
    const processedData = (data || []).map(vault => {
      let decryptedPassword = '••••••••'; // Default masked value
      
      if (vault.encrypted_password) {
        decryptedPassword = safeDecryptPassword(vault.encrypted_password);
      }

      return {
        ...vault,
        userId: vault.user_id,  // Add userId for compatibility
        password: decryptedPassword,  // Store decrypted password for display
      };
    });

    return { success: true, data: processedData };
  } catch (error: any) {
    console.log('fetchVaults error: ', error);
    return { success: false, msg: 'Could not fetch vaults' };
  }
};

/**
 * Fetch single vault with decryption
 */
export const fetchVaultById = async (vaultId: string): Promise<Response<Vault>> => {
  try {
    const { data, error } = await supabase
      .from('vault_entries')
      .select('*')
      .eq('id', vaultId)
      .single();

    if (error) {
      console.log('fetchVaultById error: ', error);
      return { success: false, msg: 'Could not fetch vault entry' };
    }

    // Decrypt password
    let decryptedPassword = '••••••••';
    if (data.encrypted_password) {
      decryptedPassword = safeDecryptPassword(data.encrypted_password);
    }

    const processedData = {
      ...data,
      userId: data.user_id,
      password: decryptedPassword,
    };

    return { success: true, data: processedData };
  } catch (error: any) {
    console.log('fetchVaultById error: ', error);
    return { success: false, msg: 'Could not fetch vault entry' };
  }
};

/**
 * Create or update vault with encryption
 */
export const createOrUpdateVault = async (vault: Vault): Promise<Response<Vault>> => {
  try {
    // Prepare vault for database
    const vaultToSave = { ...vault };
    
    // If password is provided and not already encrypted, encrypt it
    if (vault.password && !vault.encrypted_password) {
      // Ensure encryption service is ready
      if (!EncryptionService.isMasterKeySet()) {
        EncryptionService.setTempMasterKey();
      }
      
      vaultToSave.encrypted_password = EncryptionService.encryptPassword(vault.password);
      delete vaultToSave.password; // Remove plain password
    }
    
    // Remove compatibility fields before saving
    delete vaultToSave.userId;

    const { data, error } = await supabase
      .from('vault_entries')
      .upsert(vaultToSave)
      .select()
      .single();
    
    if (error) {
      console.log('createOrUpdateVault error: ', error);
      return { success: false, msg: 'Could not create or update vault' };
    }
    
    // Decrypt password for response
    let decryptedPassword = '••••••••';
    if (data.encrypted_password) {
      decryptedPassword = safeDecryptPassword(data.encrypted_password);
    }

    const responseData = {
      ...data,
      userId: data.user_id,
      password: decryptedPassword,
    };
    
    return { success: true, data: responseData };
  } catch (error: any) {
    console.log('createOrUpdateVault error: ', error);
    return { success: false, msg: 'Could not create or update vault' };
  }
};

/**
 * Add new vault entry (password is already encrypted from AddPassword component)
 */
export const addVaultEntry = async (entry: {
  category_id: string;
  service_name: string;
  service_username: string;
  password: string; // This will be the encrypted password from AddPassword
  strength?: string;
  strength_score?: number;
  is_favorite?: boolean;
}): Promise<Response<Vault>> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, msg: 'User not authenticated' };
    }

    // Prepare vault entry for database
    const vaultEntry = {
      user_id: user.id,
      category_id: entry.category_id,
      service_name: entry.service_name,
      service_username: entry.service_username,
      encrypted_password: entry.password, // Password is already encrypted
      strength: entry.strength,
      strength_score: entry.strength_score,
      is_favorite: entry.is_favorite || false,
    };

    // Insert into database
    const { data, error } = await supabase
      .from('vault_entries')
      .insert([vaultEntry])
      .select()
      .single();

    if (error) {
      console.log('addVaultEntry error: ', error);
      return { success: false, msg: 'Could not save vault entry', error: error.message };
    }

    // Decrypt password for response
    let decryptedPassword = '••••••••';
    if (data.encrypted_password) {
      decryptedPassword = safeDecryptPassword(data.encrypted_password);
    }

    const responseData = {
      ...data,
      userId: data.user_id,
      password: decryptedPassword,
    };

    return { success: true, data: responseData };
  } catch (error: any) {
    console.log('addVaultEntry error: ', error);
    return { success: false, msg: 'Could not save vault entry', error: error.message };
  }
};

/**
 * Update vault entry with encryption
 */
export const updateVaultEntry = async (
  entryId: string, 
  updates: Partial<Vault>
): Promise<Response<Vault>> => {
  try {
    const updateData = { ...updates };
    
    // If password is being updated, encrypt it
    if (updates.password) {
      // Ensure encryption service is ready
      if (!EncryptionService.isMasterKeySet()) {
        EncryptionService.setTempMasterKey();
      }
      
      updateData.encrypted_password = EncryptionService.encryptPassword(updates.password);
      delete updateData.password;
    }
    
    // Remove compatibility fields
    delete updateData.userId;
    delete updateData.id; // Don't update the ID

    const { data, error } = await supabase
      .from('vault_entries')
      .update(updateData)
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      console.log('updateVaultEntry error: ', error);
      return { success: false, msg: 'Could not update vault entry', error: error.message };
    }

    // Decrypt password for response
    let decryptedPassword = '••••••••';
    if (data.encrypted_password) {
      decryptedPassword = safeDecryptPassword(data.encrypted_password);
    }

    const responseData = {
      ...data,
      userId: data.user_id,
      password: decryptedPassword,
    };

    return { success: true, data: responseData };
  } catch (error: any) {
    console.log('updateVaultEntry error: ', error);
    return { success: false, msg: 'Could not update vault entry', error: error.message };
  }
};

/**
 * Delete vault entry
 */
export const deleteVaultEntry = async (entryId: string): Promise<Response<void>> => {
  try {
    const { error } = await supabase
      .from('vault_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.log('deleteVaultEntry error: ', error);
      return { success: false, msg: 'Could not delete vault entry', error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.log('deleteVaultEntry error: ', error);
    return { success: false, msg: 'Could not delete vault entry', error: error.message };
  }
};

/**
 * Search vault entries with decryption
 */
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
      console.log('searchVaults error: ', error);
      return { success: false, msg: 'Could not search vaults' };
    }

    // Process and decrypt passwords
    const processedData = (data || []).map(vault => {
      let decryptedPassword = '••••••••';
      
      if (vault.encrypted_password) {
        decryptedPassword = safeDecryptPassword(vault.encrypted_password);
      }

      return {
        ...vault,
        userId: vault.user_id,
        password: decryptedPassword,
      };
    });

    return { success: true, data: processedData };
  } catch (error: any) {
    console.log('searchVaults error: ', error);
    return { success: false, msg: 'Could not search vaults' };
  }
};

/**
 * Get vaults by category with decryption
 */
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
      console.log('getVaultsByCategory error: ', error);
      return { success: false, msg: 'Could not fetch vaults by category' };
    }

    // Process and decrypt passwords
    const processedData = (data || []).map(vault => {
      let decryptedPassword = '••••••••';
      
      if (vault.encrypted_password) {
        decryptedPassword = safeDecryptPassword(vault.encrypted_password);
      }

      return {
        ...vault,
        userId: vault.user_id,
        password: decryptedPassword,
      };
    });

    return { success: true, data: processedData };
  } catch (error: any) {
    console.log('getVaultsByCategory error: ', error);
    return { success: false, msg: 'Could not fetch vaults by category' };
  }
};