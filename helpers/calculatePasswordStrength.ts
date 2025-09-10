import { supabase } from '@/lib/supabase';

// 🔹 Tipos
export type StrengthLevel = "Very Weak" | "Weak" | "Medium" | "Strong" | "Very Strong";

export interface VaultEntry {
  id: string;
  user_id: string;
  encrypted_password: string;
  strength?: StrengthLevel;
  strength_score?: number;
}

// 🔹 Función avanzada para calcular fuerza de contraseña
export function calculatePasswordStrength(password: string): { level: StrengthLevel, score: number } {
  let score = 0;

  // 🔹 Longitud
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // 🔹 Caracteres
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (hasLower) score += 10;
  if (hasUpper) score += 10;
  if (hasNumber) score += 20;
  if (hasSpecial) score += 30;

  // 🔹 Penalizaciones o bonuses adicionales
  if (password.length < 6) score = Math.min(score, 20); // Muy corto, limitar score
  if (password.length >= 20 && hasUpper && hasLower && hasNumber && hasSpecial) score += 10; // Bonus extremo

  // Limitar score máximo a 100
  score = Math.min(score, 100);

  // 🔹 Determinar nivel
  let level: StrengthLevel = "Very Weak";
  if (score < 30) level = "Very Weak";
  else if (score < 50) level = "Weak";
  else if (score < 70) level = "Medium";
  else if (score < 90) level = "Strong";
  else level = "Very Strong";

  return { level, score };
}

// 🔹 Función principal: calcular security status
export async function getUserSecurityStatus(userId: string) {
  // 1️⃣ Obtener todas las vaults del usuario
  const { data: vaults, error } = await supabase
    .from<VaultEntry>('vault_entries')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  if (!vaults) return { securityStatus: 0, totalVaults: 0 };

  let updatedVaults: VaultEntry[] = [];
  let totalScore = 0;

  for (const vault of vaults) {
    // 2️⃣ Si no tiene fuerza calculada, calcularla
    let strength = vault.strength;
    let score = vault.strength_score;

    if (!strength || score === undefined || score === null) {
      const password = vault.encrypted_password; // Desencriptar si fuera necesario
      const result = calculatePasswordStrength(password);
      strength = result.level;
      score = result.score;

      // 3️⃣ Actualizar en DB
      await supabase
        .from('vault_entries')
        .update({ strength, strength_score: score })
        .eq('id', vault.id);

      updatedVaults.push({ ...vault, strength, strength_score: score });
    } else {
      updatedVaults.push(vault);
    }

    totalScore += score || 0;
  }

  // 4️⃣ Calcular Security Status promedio
  const securityStatus = vaults.length > 0 ? Math.round(totalScore / vaults.length) : 0;

  // 5️⃣ Contar por nivel (opcional, para UI o gráficas)
  const levelCount: Record<StrengthLevel, number> = {
    "Very Weak": 0,
    "Weak": 0,
    "Medium": 0,
    "Strong": 0,
    "Very Strong": 0
  };
  updatedVaults.forEach(v => {
    if (v.strength) levelCount[v.strength]++;
  });

  return {
    securityStatus,   // porcentaje 0-100
    totalVaults: vaults.length,
    levelCount,       // resumen por nivel
    vaults: updatedVaults
  };
}
