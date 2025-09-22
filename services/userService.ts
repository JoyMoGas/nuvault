import { supabase } from "@/lib/supabase";

type Response<T> = {
  success: boolean;
  data?: T;
  msg?: string;
};

// Para obtener datos de usuario
export const getUserData = async (userId: string): Promise<Response<any>> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('userId', userId)
      .single();
    if (error) {
      return { success: false, msg: error.message };
    }
    return { success: true, data };
  } catch (error: any) {
    console.log('got error', error);
    return { success: false, msg: error.message };
  }
};

// Para actualizar usuario
export const updateUser = async (
  userId: string,
  data: Record<string, any>
): Promise<Response<any>> => {
  try {
    const { data: updatedData, error } = await supabase
      .from('users')
      .update(data)
      .eq('userId', userId);
    if (error) {
      return { success: false, msg: error.message };
    }
    return { success: true, data: updatedData };
  } catch (error: any) {
    console.log('got error', error);
    return { success: false, msg: error.message };
  }
};

// Para eliminar usuario completamente (actualizado)
export const deleteUserAccount = async (userId: string): Promise<Response<void>> => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-user-account', {
      body: { userId: userId },
    });
    if (error) {
      console.error('Error invoking delete-user-account function:', error);
      return { success: false, msg: 'Failed to delete account from server' };
    }
    if (data && data.error) {
      console.error('Server-side error:', data.error);
      return { success: false, msg: data.error };
    }
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('Error signing out:', signOutError);
      return { success: false, msg: 'Account deleted, but sign out failed.' };
    }
    console.log('✅ User account completely deleted and signed out');
    return { success: true, msg: 'Account successfully deleted' };
  } catch (error: any) {
    console.error('Error deleting user account:', error);
    return { success: false, msg: `Could not delete account: ${error.message}` };
  }
};

// ✅ FUNCIÓN AÑADIDA
/**
 * Obtiene el ID del usuario actualmente autenticado desde Supabase Auth.
 * @returns {Promise<string | null>} El ID del usuario o null si no está autenticado.
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error.message);
      return null;
    }
    return user?.id || null;
  } catch (e: any) {
    console.error("Unexpected error in getUserId:", e.message);
    return null;
  }
};