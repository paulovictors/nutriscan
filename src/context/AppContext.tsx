import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserProfile, Meal, Workout, DailyStats } from '../types';
import { calculateBMR, calculateTDEE } from '../lib/calculations';
import { format } from 'date-fns';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateId } from '../lib/utils';

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
  isDemoMode: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const init = async () => {
      // Timeout de segurança para garantir que a app abre mesmo se o Supabase falhar
      const safetyTimeout = setTimeout(() => {
        if (isMounted.current && isLoading) {
          console.warn("Inicialização demorou muito. Forçando entrada.");
          setIsLoading(false);
        }
      }, 5000); // Reduzido para 5s para ser mais ágil

      if (isSupabaseConfigured) {
        // Limpar dados de demonstração antigos
        localStorage.removeItem('demo_user');
        
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
             console.warn("Erro ao verificar sessão:", error.message);
          }

          if (session?.user) {
            await loadUserData(session.user.id, session.user.email);
          } else {
            if (isMounted.current) setIsLoading(false);
          }
        } catch (error: any) {
          console.error("Erro crítico na inicialização:", error);
          if (isMounted.current) setIsLoading(false);
        }
      } else {
        // MODO DEMO
        const localUser = localStorage.getItem('demo_user');
        if (localUser) {
          try {
            setUser(JSON.parse(localUser));
            const localMeals = localStorage.getItem('demo_meals');
            const localWorkouts = localStorage.getItem('demo_workouts');
            if (localMeals) setMeals(JSON.parse(localMeals));
            if (localWorkouts) setWorkouts(JSON.parse(localWorkouts));
          } catch (e) {
            console.error("Erro ao ler localStorage", e);
            localStorage.clear();
          }
        }
        setTimeout(() => {
            if (isMounted.current) setIsLoading(false);
        }, 1000);
      }

      clearTimeout(safetyTimeout);
    };

    init();

    let authListener: any = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isMounted.current) return;
        
        // CORREÇÃO DO LOOP: Usar setTimeout para evitar deadlock em operações async dentro do listener
        setTimeout(async () => {
            if (event === 'SIGNED_IN' && session?.user) {
              // Só carrega se o usuário mudou ou se ainda não temos dados
              if (user?.id !== session.user.id) {
                await loadUserData(session.user.id, session.user.email);
              }
            } else if (event === 'SIGNED_OUT') {
              handleLogoutState();
            }
        }, 0);
      });
      authListener = data;
    }

    return () => {
      isMounted.current = false;
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []); 

  const saveLocal = (key: string, data: any) => {
    try {
      if (!isSupabaseConfigured) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.error("Erro ao salvar localmente", e);
    }
  };

  const handleLogoutState = () => {
    setUser(null);
    setMeals([]);
    setWorkouts([]);
    setIsLoading(false);
    if (!isSupabaseConfigured) {
      localStorage.clear();
    }
  };

  const loadUserData = async (userId: string, email?: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!isMounted.current) return;

      if (error) {
        console.warn("Erro ao buscar perfil:", error.message);
        // Se der erro, assumimos que é um user novo sem perfil
        setUser({ id: userId, email: email, isOnboarded: false } as UserProfile);
      } else if (profile) {
        setUser({
          id: profile.id,
          email: email,
          name: profile.name,
          age: profile.age,
          height: profile.height_m ? Math.round(profile.height_m * 100) : 0,
          weight: profile.weight_kg,
          gender: profile.gender || 'male',
          activityLevel: profile.activity_level,
          bmr: profile.basal_metabolic_rate,
          dailyCalorieGoal: profile.daily_calorie_goal,
          isOnboarded: true
        } as UserProfile);

        await loadUserActivity(userId);
      } else {
        setUser({ id: userId, email: email, isOnboarded: false } as UserProfile);
      }
    } catch (error) {
      console.error("Exceção ao carregar dados:", error);
      setUser({ id: userId, email: email, isOnboarded: false } as UserProfile);
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
          calories: m.calories, 
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
    
    if (data.weight || data.height || data.age || data.activityLevel || data.gender) {
      updated.bmr = calculateBMR(updated.weight, updated.height, updated.age, updated.gender);
      updated.dailyCalorieGoal = calculateTDEE(updated.bmr, updated.activityLevel);
    }
    
    setUser(updated);
    saveLocal('demo_user', updated);

    if (isSupabaseConfigured && user.id && user.isOnboarded) {
      try {
        await supabase.from('profiles').update({
          weight_kg: updated.weight,
          height_m: updated.height / 100,
          age: updated.age,
          activity_level: updated.activityLevel,
          basal_metabolic_rate: updated.bmr,
          daily_calorie_goal: updated.dailyCalorieGoal,
          gender: updated.gender
        }).eq('id', user.id);
      } catch (e) {
        console.error("Erro ao atualizar perfil remoto:", e);
      }
    }
  };

  const registerUser = async (email: string, pass: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const demoUser = { id: generateId(), email, isOnboarded: false } as UserProfile;
      setUser(demoUser);
      saveLocal('demo_user', demoUser);
      return true;
    }

    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pass,
    });
    
    if (error) throw error;
    return !!data.session;
  };

  const saveProfileData = async (data: Omit<UserProfile, 'bmr' | 'isOnboarded'>) => {
    if (!user) throw new Error("Utilizador não autenticado");

    const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
    const dailyCalorieGoal = data.dailyCalorieGoal || calculateTDEE(bmr, data.activityLevel);
    
    const updatedUser = {
      ...user,
      ...data,
      bmr,
      dailyCalorieGoal,
      isOnboarded: true
    };

    setUser(updatedUser);
    saveLocal('demo_user', updatedUser);

    if (isSupabaseConfigured && user.id) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        name: data.name,
        age: data.age,
        weight_kg: data.weight,
        height_m: data.height / 100,
        activity_level: data.activityLevel,
        basal_metabolic_rate: bmr,
        daily_calorie_goal: dailyCalorieGoal,
        gender: data.gender
      });
      if (profileError) throw profileError;
    }
  };

  const login = async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const stored = localStorage.getItem('demo_user');
      if (stored) setUser(JSON.parse(stored));
      else {
        const newUser = { id: generateId(), email, isOnboarded: false } as UserProfile;
        setUser(newUser);
        saveLocal('demo_user', newUser);
      }
      return;
    }

    const cleanEmail = email.trim();
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass
    });
    
    if (error) throw error;
    // O listener onAuthStateChange tratará o resto
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      handleLogoutState();
    }
  };

  const addMeal = async (meal: Meal) => {
    const newMeal = { ...meal, user_id: user?.id };
    const updatedMeals = [newMeal, ...meals];
    setMeals(updatedMeals);
    saveLocal('demo_meals', updatedMeals);
    
    if (isSupabaseConfigured && user?.id) {
      try {
        const combinedDescription = `${meal.name} | ${meal.description}`;
        await supabase.from('meals').insert({
          user_id: user.id,
          description: combinedDescription,
          image_url: meal.imageUrl,
          calories: meal.calories,
          macros: meal.macros,
          micronutrients: meal.micros,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.error("Erro ao salvar refeição remota:", e);
      }
    }
  };

  const addWorkout = async (workout: Workout) => {
    const newWorkout = { ...workout, user_id: user?.id };
    const updatedWorkouts = [newWorkout, ...workouts];
    setWorkouts(updatedWorkouts);
    saveLocal('demo_workouts', updatedWorkouts);

    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase.from('workouts').insert({
          user_id: user.id,
          workout_type: workout.type,
          duration_min: workout.duration,
          kcal_burned: workout.caloriesBurned,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.error("Erro ao salvar treino remoto:", e);
      }
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
    if (isSupabaseConfigured) {
      supabase.auth.signOut();
    }
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
      resetData,
      isDemoMode: !isSupabaseConfigured
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
