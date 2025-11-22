import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WORKOUT_TYPES, calculateWorkoutCalories } from '../lib/calculations';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { generateId } from '../lib/utils';
import { Dumbbell, Clock, Flame, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Workouts() {
  const { user, addWorkout } = useApp();
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [duration, setDuration] = useState('');

  const handleAddWorkout = () => {
    if (!selectedWorkout || !duration || !user) return;

    const workoutType = WORKOUT_TYPES.find(w => w.id === selectedWorkout);
    if (!workoutType) return;

    const calories = calculateWorkoutCalories(user.weight, Number(duration), selectedWorkout);

    addWorkout({
      id: generateId(),
      date: new Date().toISOString(),
      type: workoutType.label,
      duration: Number(duration),
      caloriesBurned: calories
    });

    setSelectedWorkout(null);
    setDuration('');
  };

  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Registar Treino</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {WORKOUT_TYPES.map((workout) => (
          <button
            key={workout.id}
            onClick={() => setSelectedWorkout(workout.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedWorkout === workout.id 
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 ring-offset-2' 
                : 'border-gray-200 bg-white hover:border-emerald-200'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-emerald-600">
              <Dumbbell size={20} />
            </div>
            <p className="font-bold text-gray-900 text-sm">{workout.label}</p>
            <p className="text-xs text-gray-500 mt-1">Intensidade: {workout.mets > 7 ? 'Alta' : 'Média'}</p>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedWorkout && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
            onClick={() => setSelectedWorkout(null)}
          >
            <div 
              className="bg-white w-full max-w-md rounded-3xl p-6 space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Detalhes do Treino</h3>
                <button onClick={() => setSelectedWorkout(null)} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-xl">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <Dumbbell size={24} />
                </div>
                <div>
                  <p className="font-bold text-emerald-900">
                    {WORKOUT_TYPES.find(w => w.id === selectedWorkout)?.label}
                  </p>
                  <p className="text-sm text-emerald-700">
                    {user ? calculateWorkoutCalories(user.weight, 60, selectedWorkout).toFixed(0) : 0} kcal / hora (aprox.)
                  </p>
                </div>
              </div>

              <Input
                label="Duração (minutos)"
                type="number"
                placeholder="Ex: 45"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                autoFocus
              />

              <Button 
                className="w-full" 
                onClick={handleAddWorkout}
                disabled={!duration}
              >
                Confirmar Treino
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
