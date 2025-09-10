// contexts/authContext.tsx
import { supabase } from "@/lib/supabase";
import { createContext, useContext, useState, ReactNode } from "react";

// --- Tipos ---
interface User {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  setAuth: (authUser: User | null) => void;
  setUserData: (userData: Partial<User>) => void;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const setAuth = (authUser: User | null) => {
    setUser(authUser);
  };

  const setUserData = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  // ✅ LÓGICA MEJORADA
  const logout = async () => {
    try {
      console.log("🚪 Iniciando logout...");
      
      // 1. Limpiar estado local PRIMERO
      setAuth(null);
      
      // 2. Luego hacer signOut global en Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("Error en signOut:", error.message);
        throw error;
      }
      
      console.log("✅ Logout completado exitosamente");
      
    } catch (e: any) {
      console.error("❌ Error durante logout:", e.message);
      // Incluso si falla el signOut, mantener el estado local limpio
      setAuth(null);
      throw e; // Re-lanzar para que changePassword pueda manejar el error
    }
  };

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};