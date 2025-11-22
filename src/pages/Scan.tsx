import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { analyzeFoodImage } from '../lib/openai';
import { Camera, Upload, Check, X, Sparkles, ScanLine, AlertCircle, KeyRound } from 'lucide-react';
import { Meal } from '../types';
import { motion } from 'framer-motion';

export function Scan() {
  const navigate = useNavigate();
  const { addMeal } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<Meal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (max 4MB para evitar custos altos/limites)
      if (file.size > 4 * 1024 * 1024) {
        setError("A imagem é muito grande. Tente uma menor que 4MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setError(null);
        runAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (imgData: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const mealData = await analyzeFoodImage(imgData);
      setResult(mealData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Não foi possível analisar a imagem. Tente novamente.");
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (result) {
      addMeal(result);
      navigate('/');
    }
  };

  const handleRetake = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  // Tela de Carregamento / Análise
  if (image && isAnalyzing) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <img src={image} alt="Scanning" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-6"
          >
            <ScanLine size={64} className="text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Consultando a IA...</h2>
          <p className="text-gray-300 text-center max-w-xs">Estamos a identificar os ingredientes e a calcular as calorias.</p>
        </div>
        
        <motion.div 
          className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] z-20"
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Tela de Resultados
  if (result && image) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
        <div className="relative h-64 -mx-6 -mt-6 mb-6">
          <img src={image} alt="Result" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Análise IA Concluída</span>
              </div>
              <h1 className="text-2xl font-bold text-white">{result.name}</h1>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">{result.description}</p>
          
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-gray-50 p-3 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">Kcal</p>
              <p className="font-bold text-gray-900">{result.calories}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl text-center">
              <p className="text-xs text-emerald-700 mb-1">Prot</p>
              <p className="font-bold text-emerald-900">{result.macros.protein}g</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl text-center">
              <p className="text-xs text-blue-700 mb-1">Carb</p>
              <p className="font-bold text-blue-900">{result.macros.carbs}g</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-center">
              <p className="text-xs text-amber-700 mb-1">Gord</p>
              <p className="font-bold text-amber-900">{result.macros.fat}g</p>
            </div>
          </div>

          {result.micros && Object.keys(result.micros).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Micronutrientes Principais</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.micros).map(([key, value]) => (
                  <span key={key} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium capitalize">
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto flex gap-4">
          <Button variant="outline" onClick={handleRetake} className="flex-1">
            <X className="mr-2 w-4 h-4" /> Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Check className="mr-2 w-4 h-4" /> Registar
          </Button>
        </div>
      </div>
    );
  }

  // Tela Inicial
  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <Camera size={32} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Escanear Refeição</h1>
          <p className="text-gray-500 max-w-xs mx-auto">Tire uma foto do seu prato e deixe a nossa IA calcular as calorias e nutrientes.</p>
        </div>

        {/* Exibição de Erros */}
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-left w-full max-w-xs animate-in fade-in slide-in-from-bottom-2">
            {error.includes('chave') ? (
              <KeyRound className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            ) : (
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            )}
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium">Erro na Análise</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}
        
        <div className="w-full max-w-xs space-y-4 pt-8">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <Button 
            className="w-full h-14 text-lg" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="mr-2" /> Tirar Foto
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 w-4 h-4" /> Carregar da Galeria
          </Button>
        </div>
      </div>
    </div>
  );
}
