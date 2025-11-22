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
    // Déficit de 15% (média entre 10-20%)
    const deficit = tdee * 0.15;
    targetCalories = tdee - deficit;

    // Trava de segurança: Não baixar da TMB (Basal)
    if (targetCalories < bmr) {
      targetCalories = bmr;
    }
  } else if (goal === 'gain') {
    // Superávit de 15% (média entre 10-20%)
    const surplus = tdee * 0.15;
    targetCalories = tdee + surplus;
  }

  return Math.round(targetCalories);
}

export const WORKOUT_TYPES = [
  { id: 'walking', label: 'Caminhada Leve', mets: 3.5 },
  { id: 'running_moderate', label: 'Corrida Moderada', mets: 8.0 },
  { id: 'running_intense', label: 'Corrida Intensa', mets: 11.5 },
  { id: 'weightlifting', label: 'Musculação', mets: 4.5 }, // Média geral
  { id: 'hiit', label: 'HIIT', mets: 8.0 },
  { id: 'cycling', label: 'Ciclismo', mets: 7.5 },
  { id: 'yoga', label: 'Yoga', mets: 2.5 },
  { id: 'functional', label: 'Treino Funcional', mets: 6.0 },
];

export function calculateWorkoutCalories(weight: number, durationMinutes: number, workoutId: string): number {
  const workout = WORKOUT_TYPES.find(w => w.id === workoutId);
  if (!workout) return 0;
  
  // Fórmula aproximada: Kcal = METs * Peso(kg) * (Tempo(min) / 60)
  return Math.round(workout.mets * weight * (durationMinutes / 60));
}
