import React from 'react';
import { useApp } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Flame, Droplets, Wheat, Beef, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export function Home() {
  const { user, getDailyStats } = useApp();
  const today = new Date();
  const stats = getDailyStats(today);
  
  if (!user) return null;

  const remainingCalories = user.dailyCalorieGoal - stats.netCalories;
  const progress = Math.min(100, (stats.netCalories / user.dailyCalorieGoal) * 100);

  // Cálculo de Metas de Macros (Estimativa Padrão)
  const goalProtein = Math.round((user.dailyCalorieGoal * 0.3) / 4);
  const goalCarbs = Math.round((user.dailyCalorieGoal * 0.4) / 4);
  const goalFat = Math.round((user.dailyCalorieGoal * 0.3) / 9);

  const macroData = [
    { 
      name: 'Proteína', 
      value: stats.protein, 
      goal: goalProtein,
      color: '#10b981', 
      icon: Beef, 
      label: 'Proteínas' 
    },
    { 
      name: 'Carbos', 
      value: stats.carbs, 
      goal: goalCarbs,
      color: '#3b82f6', 
      icon: Wheat, 
      label: 'Carboidratos' 
    },
    { 
      name: 'Gordura', 
      value: stats.fat, 
      goal: goalFat,
      color: '#f59e0b', 
      icon: Droplets, 
      label: 'Gorduras' 
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Olá, {user.name}</p>
          <h1 className="text-2xl font-bold text-gray-900">Resumo de Hoje</h1>
        </div>
        <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium capitalize">
          {format(today, "d 'de' MMMM", { locale: pt })}
        </div>
      </div>

      {/* Main Calorie Card */}
      <div className="bg-emerald-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-600 rounded-full -ml-10 -mb-10 opacity-50 blur-2xl" />
        
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-emerald-200 text-sm font-medium mb-1">Calorias Restantes</p>
            <h2 className="text-4xl font-bold mb-1">{Math.max(0, Math.round(remainingCalories))}</h2>
            <p className="text-xs text-emerald-300">Meta: {user.dailyCalorieGoal} kcal</p>
          </div>
          <div className="w-24 h-24 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: progress }, { value: 100 - progress }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={45}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#ffffff" />
                  <Cell fill="#064e3b" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame size={20} className="text-white fill-white" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 relative z-10">
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <p className="text-xs text-emerald-200 mb-1">Consumidas</p>
            <p className="font-bold text-lg">{stats.caloriesConsumed}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <p className="text-xs text-emerald-200 mb-1">Queimadas</p>
            <p className="font-bold text-lg">{stats.caloriesBurned}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <p className="text-xs text-emerald-200 mb-1">Líquido</p>
            <p className="font-bold text-lg">{stats.netCalories}</p>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4">Macronutrientes</h3>
        <div className="grid grid-cols-3 gap-3">
          {macroData.map((macro) => {
            const percentage = macro.goal > 0 ? Math.min(100, (macro.value / macro.goal) * 100) : 0;
            
            return (
              <div key={macro.name} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-gray-50">
                      {/* Ícone aumentado para 32px para melhor visibilidade mobile */}
                      <macro.icon size={32} color={macro.color} className="flex-shrink-0" />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-600 block mb-1">{macro.label}</span>
                  <p className="text-xl font-bold text-gray-900">{Math.round(macro.value)}g</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">de {macro.goal}g</p>
                </div>
                
                <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ 
                      width: `${percentage}%`, 
                      backgroundColor: macro.color 
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Meals */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900">Refeições de Hoje</h3>
          <Link to="/history" className="text-emerald-600 text-sm font-medium flex items-center">
            Ver tudo <ChevronRight size={16} />
          </Link>
        </div>
        
        {stats.meals.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm mb-3">Nenhuma refeição registada hoje</p>
            <Link to="/scan">
              <button className="text-emerald-600 font-medium text-sm flex items-center justify-center gap-1 mx-auto">
                <Plus size={16} /> Adicionar Refeição
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.meals.map((meal) => (
              <div key={meal.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Foto</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm truncate">{meal.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{meal.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-emerald-600 text-sm">{meal.calories} kcal</p>
                  <p className="text-[10px] text-gray-400 capitalize">
                    {meal.type === 'breakfast' ? 'Pequeno-almoço' : 
                     meal.type === 'lunch' ? 'Almoço' : 
                     meal.type === 'dinner' ? 'Jantar' : 'Lanche'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
