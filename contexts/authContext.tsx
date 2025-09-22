// contexts/authContext.tsx
import { supabase } from "@/lib/supabase";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";

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

  // ✅ ¡LA SOLUCIÓN ESTÁ AQUÍ!
  // Envolvemos las funciones en useCallback para darles una referencia estable.
  // Esto evita que los hooks que dependen de ellas se reinicien innecesariamente.
  const setAuth = useCallback((authUser: User | null) => {
    console.log('[AuthContext] setAuth llamado. Usuario:', authUser?.email || 'null');
    setUser(authUser);
  }, []);

  const setUserData = useCallback((userData: Partial<User>) => {
    setUser(currentUser => (currentUser ? { ...currentUser, ...userData } : null));
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log("[AuthContext] 🚪 Iniciando logout...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error en signOut de Supabase:", error.message);
      }
      setAuth(null); // Limpiamos el estado después de que signOut termine.
      console.log("[AuthContext] ✅ Logout completado.");
    } catch (e: any) {
      console.error("❌ Error durante el logout:", e.message);
      setAuth(null);
    }
  }, [setAuth]); // setAuth es estable, por lo que logout también lo es.
  
  // Creamos el valor del contexto una vez para mayor optimización.
  const contextValue = { user, setAuth, setUserData, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};