import { supabase } from '@/lib/supabase';

export interface Category {
  id: string;
  name: string;
  [key: string]: any; // si hay otros campos
}

export const getCategories = async (): Promise<{ success: boolean; data: Category[] | null; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true }); // opcional, ordenar alfabéticamente

    if (error) {
      console.error('Error fetching categories:', error.message);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Unexpected error fetching categories:', err);
    return { success: false, data: null, error: err.message || 'Unknown error' };
  }
};
