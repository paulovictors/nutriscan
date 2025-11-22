export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

export interface UserProfile {
  id?: string; // Supabase User ID
  email?: string;
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
  bmr: number;
  dailyCalorieGoal: number;
  isOnboarded: boolean;
}

export interface MacroNutrients {
  protein: number; // g
  carbs: number; // g
  fat: number; // g
}

export interface MicroNutrients {
  vitaminA?: string;
  vitaminC?: string;
  calcium?: string;
  iron?: string;
}

export interface Meal {
  id: string;
  user_id?: string;
  date: string; // ISO string
  name: string;
  description: string;
  imageUrl?: string;
  calories: number;
  macros: MacroNutrients;
  micros: MicroNutrients;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface Workout {
  id: string;
  user_id?: string;
  date: string; // ISO string
  type: string;
  duration: number; // minutes
  caloriesBurned: number;
}

export interface DailyStats {
  date: string;
  caloriesConsumed: number;
  caloriesBurned: number;
  netCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: Meal[];
  workouts: Workout[];
}
