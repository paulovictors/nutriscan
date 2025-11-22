import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ActivityLevel, UserGoal } from '../types';
import { calculateBMR, calculateTDEE, calculateGoalCalories } from '../lib/calculations';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, LogOut, TrendingDown, TrendingUp, Target } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

const steps = [
  { id: 'personal', title: 'Sobre Você', description: 'Vamos configurar o seu perfil.' },
  { id: 'body', title: 'Medidas Corporais', description: 'Para calcularmos suas necessidades.' },
  { id: 'activity', title: 'Nível de Atividade', description: 'Como é o seu dia a dia?' },
  { id: 'goal', title: 'O Seu Objetivo', description: 'O que deseja alcançar?' },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { saveProfileData, logout } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female',
    weight: '',
    height: '',
    activityLevel: 'sedentary' as ActivityLevel,
    goal: 'loss' as UserGoal,
  });

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      setIsLoading(true);
      try {
        // Cálculos finais antes de salvar
        const weight = Number(formData.weight);
        const height = Number(formData.height);
        const age = Number(formData.age);
        
        const bmr = calculateBMR(weight, height, age, formData.gender);
        const tdee = calculateTDEE(bmr, formData.activityLevel);
        const dailyCalorieGoal = calculateGoalCalories(tdee, bmr, formData.goal);

        await saveProfileData({
          name: formData.name,
          age: age,
          gender: formData.gender,
          weight: weight,
          height: height,
          activityLevel: formData.activityLevel,
          goal: formData.goal,
          dailyCalorieGoal: dailyCalorieGoal // Passamos o valor calculado explicitamente
        });
        // O redirecionamento para home acontece automaticamente via App.tsx
      } catch (error) {
        console.error(error);
        alert("Erro ao salvar perfil. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isValid = () => {
    if (currentStep === 0) return formData.name && formData.age;
    if (currentStep === 1) return formData.weight && formData.height;
    return true;
  };

  // Preview do cálculo para o último passo
  const getCaloriePreview = () => {
    const weight = Number(formData.weight);
    const height = Number(formData.height);
    const age = Number(formData.age);
    if (!weight || !height || !age) return 0;

    const bmr = calculateBMR(weight, height, age, formData.gender);
    const tdee = calculateTDEE(bmr, formData.activityLevel);
    return calculateGoalCalories(tdee, bmr, formData.goal);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto p-6 relative">
      {/* Header com Logo e Botão de Sair */}
      <div className="flex justify-between items-center mb-6">
        <Logo size="sm" />
        <button 
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 font-medium transition-colors"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <div className="flex gap-2 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= currentStep ? 'bg-emerald-500' : 'bg-gray-100'}`} />
            ))}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{steps[currentStep].title}</h1>
          <p className="text-gray-500">{steps[currentStep].description}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {currentStep === 0 && (
              <>
                <Input 
                  label="Nome" 
                  placeholder="Como gosta de ser chamado?"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <Input 
                  label="Idade" 
                  type="number" 
                  placeholder="Anos"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Género Biológico</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFormData({...formData, gender: 'male'})}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${formData.gender === 'male' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'}`}
                    >
                      Masculino
                    </button>
                    <button
                      onClick={() => setFormData({...formData, gender: 'female'})}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${formData.gender === 'female' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'}`}
                    >
                      Feminino
                    </button>
                  </div>
                </div>
              </>
            )}

            {currentStep === 1 && (
              <>
                <Input 
                  label="Peso (kg)" 
                  type="number" 
                  placeholder="Ex: 70.5"
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                />
                <Input 
                  label="Altura (cm)" 
                  type="number" 
                  placeholder="Ex: 175"
                  value={formData.height}
                  onChange={e => setFormData({...formData, height: e.target.value})}
                />
              </>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                {[
                  { id: 'sedentary', label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
                  { id: 'light', label: 'Levemente Ativo', desc: 'Exercício 1-3x/semana' },
                  { id: 'moderate', label: 'Moderadamente Ativo', desc: 'Exercício 3-5x/semana' },
                  { id: 'active', label: 'Muito Ativo', desc: 'Exercício 6-7x/semana' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({...formData, activityLevel: option.id as ActivityLevel})}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.activityLevel === option.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className={`font-semibold ${formData.activityLevel === option.id ? 'text-emerald-900' : 'text-gray-900'}`}>{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                      {formData.activityLevel === option.id && <Check className="text-emerald-500" size={20} />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => setFormData({...formData, goal: 'loss'})}
                    className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${formData.goal === 'loss' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-emerald-600">
                          <TrendingDown size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">Emagrecimento</h3>
                        <p className="text-sm text-gray-500 mt-1">Déficit calórico saudável para perder gordura mantendo energia.</p>
                      </div>
                      {formData.goal === 'loss' && <div className="bg-emerald-500 text-white p-1 rounded-full"><Check size={16} /></div>}
                    </div>
                  </button>

                  <button
                    onClick={() => setFormData({...formData, goal: 'gain'})}
                    className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${formData.goal === 'gain' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-emerald-600">
                          <TrendingUp size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">Ganho de Massa</h3>
                        <p className="text-sm text-gray-500 mt-1">Superávit calórico controlado para construção muscular.</p>
                      </div>
                      {formData.goal === 'gain' && <div className="bg-emerald-500 text-white p-1 rounded-full"><Check size={16} /></div>}
                    </div>
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-1">
                    <Target size={16} />
                    <span>Meta Estimada</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">
                    {getCaloriePreview()} <span className="text-sm font-medium text-gray-400">kcal/dia</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Baseado no seu metabolismo e objetivo.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-4 mt-8">
        {currentStep > 0 && (
          <Button variant="outline" onClick={handleBack} className="flex-1" disabled={isLoading}>
            <ChevronLeft className="mr-2 w-4 h-4" /> Voltar
          </Button>
        )}
        <Button 
          onClick={handleNext} 
          className="flex-1"
          disabled={!isValid() || isLoading}
          isLoading={isLoading}
        >
          {currentStep === steps.length - 1 ? 'Finalizar Perfil' : 'Próximo'}
          {currentStep !== steps.length - 1 && <ChevronRight className="ml-2 w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
