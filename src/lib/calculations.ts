import { ActivityLevel, UserGoal } from "../types";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Pouco ou nenhum exercício
  light: 1.375,        // Exercício leve 1-3 dias/semana
  moderate: 1.55,      // Exercício moderado 3-5 dias/semana
  active: 1.725,       // Exercício pesado 6-7 dias/semana
};

export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  // Fórmula Mifflin-St Jeor
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateGoalCalories(tdee: number, bmr: number, goal: UserGoal): number {
  let targetCalories = tdee;

  if (goal === 'loss') {
    // Déficit de 15%
    const deficit = tdee * 0.15;
    targetCalories = tdee - deficit;

    // Trava de segurança: Não baixar da TMB (Basal)
    if (targetCalories < bmr) {
      targetCalories = bmr;
    }
  } else if (goal === 'gain') {
    // Superávit de 15%
    const surplus = tdee * 0.15;
    targetCalories = tdee + surplus;
  }

  return Math.round(targetCalories);
}

// Lista expandida de exercícios
export const WORKOUT_TYPES = [
  { id: 'walking', label: 'Caminhada', mets: 3.5 },
  { id: 'running_moderate', label: 'Corrida', mets: 8.0 },
  { id: 'cycling', label: 'Ciclismo', mets: 7.5 },
  { id: 'weightlifting', label: 'Musculação', mets: 4.5 },
  { id: 'swimming', label: 'Natação', mets: 7.0 },
  { id: 'yoga', label: 'Yoga / Pilates', mets: 3.0 },
  { id: 'hiit', label: 'Treino HIIT', mets: 8.0 },
  { id: 'boxing', label: 'Boxe / Artes Marciais', mets: 9.0 },
  { id: 'dancing', label: 'Dança / Zumba', mets: 5.0 },
  { id: 'sports', label: 'Futebol / Desporto', mets: 7.0 },
  { id: 'crossfit', label: 'Crossfit', mets: 8.5 },
  { id: 'cleaning', label: 'Limpeza / Tarefas', mets: 3.0 },
  { id: 'hiking', label: 'Trilho / Caminhada', mets: 6.0 },
  { id: 'tennis', label: 'Ténis / Padel', mets: 7.0 },
  { id: 'basketball', label: 'Basquetebol', mets: 8.0 },
];

export function calculateWorkoutCalories(weight: number, durationMinutes: number, workoutId: string): number {
  const workout = WORKOUT_TYPES.find(w => w.id === workoutId);
  if (!workout) return 0;
  
  // Fórmula aproximada: Kcal = METs * Peso(kg) * (Tempo(min) / 60)
  return Math.round(workout.mets * weight * (durationMinutes / 60));
}
