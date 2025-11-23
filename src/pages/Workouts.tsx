import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WORKOUT_TYPES, calculateWorkoutCalories } from '../lib/calculations';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { generateId } from '../lib/utils';
import { 
  Dumbbell, 
  Flame, 
  Plus, 
  X, 
  Footprints, 
  Bike, 
  Waves, 
  Activity, 
  Swords, 
  Music, 
  Trophy,
  Home,
  Mountain,
  CircleDot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mapeamento de ícones para os tipos de exercício
const iconMap: Record<string, React.ElementType> = {
  walking: Footprints,
  running_moderate: Activity,
  cycling: Bike,
  weightlifting: Dumbbell,
  swimming: Waves,
  yoga: CircleDot,
  hiit: Flame,
  boxing: Swords,
  dancing: Music,
  sports: Trophy,
  crossfit: Dumbbell,
  cleaning: Home,
  hiking: Mountain,
  tennis: CircleDot,
  basketball: Trophy
};

export function Workouts() {
  const { user, addWorkout } = useApp();
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [duration, setDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddWorkout = async () => {
    if (!selectedWorkout || !duration || !user) return;

    setIsSubmitting(true);
    try {
      const workoutType = WORKOUT_TYPES.find(w => w.id === selectedWorkout);
      if (!workoutType) return;

      const calories = calculateWorkoutCalories(user.weight, Number(duration), selectedWorkout);

      await addWorkout({
        id: generateId(),
        date: new Date().toISOString(),
        type: workoutType.label,
        duration: Number(duration),
        caloriesBurned: calories
      });

      setSelectedWorkout(null);
      setDuration('');
    } catch (error) {
      console.error("Erro ao salvar treino:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (id: string) => {
    const Icon = iconMap[id] || Dumbbell;
    return <Icon size={24} />;
  };

  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Registar Treino</h1>

      <div className="grid grid-cols-1 gap-3">
        {WORKOUT_TYPES.map((workout) => (
          <button
            key={workout.id}
            onClick={() => setSelectedWorkout(workout.id)}
            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
              selectedWorkout === workout.id 
                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
                : 'border-gray-100 bg-white hover:border-emerald-200 hover:bg-gray-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              selectedWorkout === workout.id ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {getIcon(workout.id)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{workout.label}</p>
              <p className="text-xs text-gray-500">
                Intensidade: {workout.mets > 7 ? 'Alta' : workout.mets > 4 ? 'Média' : 'Baixa'}
              </p>
            </div>
            <div className="text-emerald-500">
              <Plus size={20} />
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedWorkout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm"
            onClick={() => setSelectedWorkout(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              // ADICIONADO -mt-32 PARA SUBIR A CAIXA VISUALMENTE
              className="bg-white w-full max-w-md rounded-3xl p-6 space-y-6 shadow-2xl relative -mt-32"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Detalhes do Treino</h3>
                <button onClick={() => setSelectedWorkout(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                  {getIcon(selectedWorkout)}
                </div>
                <div>
                  <p className="font-bold text-lg text-emerald-900">
                    {WORKOUT_TYPES.find(w => w.id === selectedWorkout)?.label}
                  </p>
                  <p className="text-sm text-emerald-700 font-medium">
                    {user ? calculateWorkoutCalories(user.weight, 60, selectedWorkout).toFixed(0) : 0} kcal / hora
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Duração (minutos)"
                  type="number"
                  placeholder="Ex: 45"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  autoFocus
                  className="text-lg"
                />

                <Button 
                  className="w-full h-14 text-lg font-bold shadow-lg shadow-emerald-200" 
                  onClick={handleAddWorkout}
                  disabled={!duration || isSubmitting}
                  isLoading={isSubmitting}
                >
                  Confirmar Treino
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
