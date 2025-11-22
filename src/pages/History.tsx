import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

export function History() {
  const { getDailyStats } = useApp();
  
  // Generate last 7 days data
  const data = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const stats = getDailyStats(date);
    return {
      name: format(date, 'EEE', { locale: pt }),
      calories: stats.caloriesConsumed,
      burned: stats.caloriesBurned,
      net: stats.netCalories,
      fullDate: format(date, 'd MMM', { locale: pt })
    };
  });

  return (
    <div className="p-6 space-y-8 pb-24">
      <h1 className="text-2xl font-bold text-gray-900">Meu Progresso</h1>

      {/* Chart */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6">Calorias da Semana</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="calories" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" name="Consumidas" />
              <Bar dataKey="burned" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Queimadas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">Histórico Detalhado</h3>
        {data.slice().reverse().map((day, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-900 capitalize">{day.name}, {day.fullDate}</p>
              <p className="text-xs text-gray-500">Saldo Líquido</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-emerald-600">{day.net} kcal</p>
              <div className="flex gap-2 text-[10px] text-gray-400">
                <span>+{day.calories}</span>
                <span>-{day.burned}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
