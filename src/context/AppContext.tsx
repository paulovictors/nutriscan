import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserProfile, Meal, Workout, DailyStats } from '../types';
import { calculateBMR, calculateTDEE } from '../lib/calculations';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

interface AppContextType {
  user: UserProfile | null;
  isLoading: boolean;
  updateUser: (data: Partial<UserProfile>) => void;
  registerUser: (email: string, pass: string) => Promise<boolean>;
  saveProfileData: (data: Omit<UserProfile, 'bmr' | 'dailyCalorieGoal' | 'isOnboarded'>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  meals: Meal[];
  workouts: Workout[];
  addMeal: (meal: Meal) => void;
  addWorkout: (workout: Workout) => void;
  getDailyStats: (date: Date) => DailyStats;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  
  // Começamos com true para verificar a sessão inicial
  const [isLoading, setIsLoading] = useState(true);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // 1. Verificar sessão atual ao iniciar
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserData(session.user.id, session.user.email);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao iniciar sessão:", error);
        setIsLoading(false);
      }
    };
    
    initSession();

    // 2. Ouvir mudanças na autenticação (Login, Logout, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted.current) return;

      if (event === 'SIGNED_IN' && session?.user) {
        // Se o utilizador mudou, carregamos os dados
        if (user?.id !== session.user.id) {
          await loadUserData(session.user.id, session.user.email);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setMeals([]);
        setWorkouts([]);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      authListener.subscription.unsubscribe();
    };
  }, []); // Dependências vazias para rodar apenas uma vez

  const loadUserData = async (userId: string, email?: string) => {
    if (isMounted.current) setIsLoading(true);

    try {
      // Tentar buscar o perfil
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!isMounted.current) return;

      if (profile) {
        // Perfil existe -> Utilizador completo
        setUser({
          id: profile.id,
          email: email,
          name: profile.name,
          age: profile.age,
          height: profile.height_m ? Math.round(profile.height_m * 100) : 0,
          weight: profile.weight_kg,
          gender: 'male', // Padrão se não vier do banco
          activityLevel: profile.activity_level,
          bmr: profile.basal_metabolic_rate,
          dailyCalorieGoal: profile.daily_calorie_goal,
          isOnboarded: true
        } as UserProfile);

        // Carregar refeições e treinos em background
        loadUserActivity(userId);

      } else {
        // Perfil não encontrado (Novo utilizador ou erro de RLS)
        // Definimos o utilizador básico para permitir redirecionamento ao Onboarding
        console.log("Perfil não encontrado, redirecionando para onboarding.");
        setUser({
          id: userId,
          email: email,
          isOnboarded: false
        } as UserProfile);
      }

    } catch (error) {
      console.error("Erro fatal ao carregar dados:", error);
      // Fallback de segurança
      setUser({
        id: userId,
        email: email,
        isOnboarded: false
      } as UserProfile);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const loadUserActivity = async (userId: string) => {
    try {
      const { data: mealsData } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (mealsData && isMounted.current) {
        const mappedMeals: Meal[] = mealsData.map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          date: m.created_at,
          name: m.description ? m.description.split(' | ')[0] : 'Refeição',
          description: m.description ? (m.description.split(' | ')[1] || m.description) : '',
          imageUrl: m.image_url,
          calories: m.total_kcal,
          macros: m.macros || { protein: 0, carbs: 0, fat: 0 },
          micros: m.micronutrients || {},
          type: 'snack'
        }));
        setMeals(mappedMeals);
      }

      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (workoutsData && isMounted.current) {
        const mappedWorkouts: Workout[] = workoutsData.map((w: any) => ({
          id: w.id,
          user_id: w.user_id,
          date: w.created_at,
          type: w.workout_type,
          duration: w.duration_min,
          caloriesBurned: w.kcal_burned
        }));
        setWorkouts(mappedWorkouts);
      }
    } catch (e) {
      console.error("Erro ao carregar atividades:", e);
    }
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    
    if (data.weight || data.height || data.age || data.activityLevel) {
      updated.bmr = calculateBMR(updated.weight, updated.height, updated.age, updated.gender);
      updated.dailyCalorieGoal = calculateTDEE(updated.bmr, updated.activityLevel);
    }
    
    setUser(updated);

    if (user.id && user.isOnboarded) {
      await supabase.from('profiles').update({
        weight_kg: updated.weight,
        height_m: updated.height / 100,
        age: updated.age,
        activity_level: updated.activityLevel,
        basal_metabolic_rate: updated.bmr,
        daily_calorie_goal: updated.dailyCalorieGoal
      }).eq('id', user.id);
    }
  };

  const registerUser = async (email: string, pass: string): Promise<boolean> => {
    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pass,
    });
    
    if (error) throw error;
    return !!data.session;
  };

  const saveProfileData = async (data: Omit<UserProfile, 'bmr' | 'dailyCalorieGoal' | 'isOnboarded'>) => {
    if (!user || !user.id) throw new Error("Utilizador não autenticado");

    const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
    const dailyCalorieGoal = calculateTDEE(bmr, data.activityLevel);
    
    try {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        name: data.name,
        age: data.age,
        weight_kg: data.weight,
        height_m: data.height / 100,
        activity_level: data.activityLevel,
        basal_metabolic_rate: bmr,
        daily_calorie_goal: dailyCalorieGoal
      });

      if (profileError) throw profileError;

      setUser({
        ...user,
        ...data,
        bmr,
        dailyCalorieGoal,
        isOnboarded: true
      });
      
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      throw error;
    }
  };

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    
    // Apenas fazemos o pedido. NÃO chamamos loadUserData aqui.
    // Deixamos o onAuthStateChange lidar com o resto.
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass
    });
    
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // O onAuthStateChange lidará com a limpeza do estado
  };

  const addMeal = async (meal: Meal) => {
    const newMeal = { ...meal, user_id: user?.id };
    setMeals(prev => [newMeal, ...prev]);
    
    if (user?.id) {
      const combinedDescription = `${meal.name} | ${meal.description}`;
      await supabase.from('meals').insert({
        user_id: user.id,
        description: combinedDescription,
        image_url: meal.imageUrl,
        total_kcal: meal.calories,
        macros: meal.macros,
        micronutrients: meal.micros,
        created_at: new Date().toISOString()
      });
    }
  };

  const addWorkout = async (workout: Workout) => {
    const newWorkout = { ...workout, user_id: user?.id };
    setWorkouts(prev => [newWorkout, ...prev]);

    if (user?.id) {
      await supabase.from('workouts').insert({
        user_id: user.id,
        workout_type: workout.type,
        duration_min: workout.duration,
        kcal_burned: workout.caloriesBurned,
        created_at: new Date().toISOString()
      });
    }
  };

  const getDailyStats = (date: Date): DailyStats => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isSameDay = (isoString: string) => isoString.startsWith(dateStr);

    const daysMeals = meals.filter(m => isSameDay(m.date));
    const daysWorkouts = workouts.filter(w => isSameDay(w.date));
    
    const caloriesConsumed = daysMeals.reduce((acc, m) => acc + m.calories, 0);
    const caloriesBurned = daysWorkouts.reduce((acc, w) => acc + w.caloriesBurned, 0);
    
    const protein = daysMeals.reduce((acc, m) => acc + (m.macros?.protein || 0), 0);
    const carbs = daysMeals.reduce((acc, m) => acc + (m.macros?.carbs || 0), 0);
    const fat = daysMeals.reduce((acc, m) => acc + (m.macros?.fat || 0), 0);

    return {
      date: dateStr,
      caloriesConsumed,
      caloriesBurned,
      netCalories: caloriesConsumed - caloriesBurned,
      protein,
      carbs,
      fat,
      meals: daysMeals,
      workouts: daysWorkouts
    };
  };

  const resetData = () => {
    localStorage.clear();
    setUser(null);
    setMeals([]);
    setWorkouts([]);
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      isLoading,
      updateUser, 
      registerUser,
      saveProfileData, 
      login,
      logout,
      meals, 
      workouts, 
      addMeal, 
      addWorkout,
      getDailyStats,
      resetData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
