import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { analyzeFoodImage } from '../lib/openai'; 
import { Camera, Upload, Check, X, Sparkles, ScanLine, Headset, Loader2 } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("A imagem é muito grande (Máx 5MB).");
        return;
      }

      const reader = new FileReader();
      
      reader.onloadstart = () => {
        setIsAnalyzing(true);
        setError(null);
      };

      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        runAnalysis(base64);
      };

      reader.onerror = () => {
        setError("Erro ao ler o ficheiro.");
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (imgData: string) => {
    try {
      const mealData = await analyzeFoodImage(imgData);
      setResult(mealData);
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível identificar o alimento. Tente uma foto mais clara.");
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (result) {
      setIsSaving(true);
      try {
        await addMeal(result);
        // Pequeno delay para garantir atualização do estado
        setTimeout(() => {
           navigate('/');
        }, 500);
      } catch (e) {
        console.error("Erro ao salvar", e);
        setIsSaving(false);
      }
    }
  };

  const handleRetake = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setIsSaving(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (image && isAnalyzing) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <img src={image} alt="Scanning" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-6 relative"
          >
            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full"></div>
            <ScanLine size={64} className="text-emerald-400 relative z-10" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">A analisar refeição...</h2>
          <p className="text-gray-300 text-center max-w-xs text-sm">A identificar ingredientes e nutrientes.</p>
        </div>
        
        <motion.div 
          className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] z-20"
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-100">
          <Headset size={40} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ups!</h2>
        <p className="text-gray-500 mb-8 max-w-xs leading-relaxed">
          {error}
        </p>
        
        <div className="w-full max-w-xs space-y-3">
          <Button onClick={handleGoHome} className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white">
            Voltar ao Início
          </Button>
          <Button variant="ghost" onClick={handleRetake} className="w-full text-gray-400 text-sm">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (result && image) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col pb-24">
        <div className="relative h-64 -mx-6 -mt-6 mb-6 group">
          <img src={image} alt="Result" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-2 bg-black/30 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/10">
                <Sparkles size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Análise Nutricional</span>
              </div>
              <h1 className="text-2xl font-bold text-white leading-tight">{result.name}</h1>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 -mt-12 relative z-10">
          <p className="text-gray-600 mb-6 text-sm leading-relaxed border-b border-gray-100 pb-4">
            {result.description}
          </p>
          
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Calorias</p>
              <p className="font-bold text-gray-900 text-lg">{result.calories}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl text-center border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Proteínas</p>
              <p className="font-bold text-emerald-900 text-lg">{result.macros.protein}g</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-2xl text-center border border-blue-100">
              {/* CORREÇÃO: Alterado de Hidratos para Carboidratos */}
              <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Carboidratos</p>
              <p className="font-bold text-blue-900 text-lg">{result.macros.carbs}g</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-2xl text-center border border-amber-100">
              <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Gorduras</p>
              <p className="font-bold text-amber-900 text-lg">{result.macros.fat}g</p>
            </div>
          </div>

          {result.micros && Object.keys(result.micros).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <ScanLine size={12} /> Detalhes Adicionais
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.micros).map(([key, value]) => (
                  <span key={key} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600 font-medium capitalize">
                    <span className="text-gray-400 mr-1">{key}:</span> {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto flex gap-4 z-20">
          <Button variant="outline" onClick={handleRetake} className="flex-1 h-12 rounded-xl" disabled={isSaving}>
            <X className="mr-2 w-4 h-4" /> Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1 h-12 rounded-xl shadow-lg shadow-emerald-200" isLoading={isSaving}>
            <Check className="mr-2 w-4 h-4" /> Registar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-200 blur-2xl opacity-30 rounded-full"></div>
          <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mb-4 relative border border-emerald-100 shadow-sm">
            <Camera size={40} className="text-emerald-600" strokeWidth={1.5} />
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Registar Refeição</h1>
          <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
            Tire uma foto do seu prato. A nossa app identifica os ingredientes e calcula as calorias automaticamente.
          </p>
        </div>
        
        <div className="w-full max-w-xs space-y-4 pt-8">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <Button 
            className="w-full h-14 text-lg shadow-xl shadow-emerald-100 transition-transform active:scale-95" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="mr-2" /> Tirar Foto
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-14 text-base border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 w-4 h-4" /> Carregar da Galeria
          </Button>
        </div>
      </div>
    </div>
  );
}
