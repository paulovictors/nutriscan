import { GoogleGenerativeAI } from "@google/generative-ai";
import { Meal } from "../types";
import { generateId } from "./utils";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializa o cliente Gemini
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeFoodImage(base64Image: string): Promise<Meal> {
  try {
    if (!apiKey || apiKey.includes('YOUR_API_KEY')) {
      throw new Error("Chave da API Gemini inválida ou não configurada.");
    }

    // O Gemini espera a string base64 sem o prefixo "data:image/..."
    // Exemplo: "data:image/jpeg;base64,/9j/4AAQ..." -> "/9j/4AAQ..."
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    if (!base64Data) {
      throw new Error("Formato de imagem inválido.");
    }

    // Usamos o modelo flash padrão da versão mais recente do SDK
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const prompt = `Você é um nutricionista especializado em análise alimentar por imagem. 
Sua tarefa é analisar cuidadosamente o alimento presente na imagem enviada.

Regras:
1. Identifique cada comida ou ingrediente visível.
2. Estime quantidades em gramas de cada item.
3. Calcule:
   - Calorias totais (kcal)
   - Macronutrientes: carboidratos, proteínas, gorduras
   - Fibras
   - Açúcares
   - Sódio
4. Sempre forneça uma tabela final com todos os nutrientes.
5. Seja preciso, objetivo e baseado em referência nutricional padrão (USDA ou TACO).
6. Se a imagem for ruim ou não for comida, retorne um erro no JSON.

Responda ESTRITAMENTE com este formato JSON:
{
  "name": "Nome curto do prato",
  "description": "Descrição detalhada com gramas de cada item identificado",
  "calories": número (total kcal),
  "macros": {
    "protein": número (g),
    "carbs": número (g),
    "fat": número (g)
  },
  "micros": {
    "Fibras": "valor (ex: 5g)",
    "Açúcares": "valor (ex: 2g)",
    "Sódio": "valor (ex: 150mg)"
  },
  "error": "Mensagem de erro opcional se a imagem não for de comida ou estiver ilegível"
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg", 
        },
      },
    ]);

    const response = result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("Sem resposta da IA");
    }

    const data = JSON.parse(text);

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      id: generateId(),
      date: new Date().toISOString(),
      imageUrl: base64Image,
      name: data.name || "Refeição",
      description: data.description || "Sem descrição disponível",
      calories: Number(data.calories) || 0,
      macros: {
        protein: Number(data.macros?.protein || 0),
        carbs: Number(data.macros?.carbs || 0),
        fat: Number(data.macros?.fat || 0)
      },
      micros: data.micros || {},
      type: 'lunch'
    };

  } catch (error: any) {
    console.error("Erro na análise Gemini:", error);
    
    // Tratamento de erros amigável
    if (error.message?.includes('404') || error.message?.includes('not found')) {
       throw new Error("Modelo de IA indisponível ou chave incorreta. Verifique a API Key.");
    }
    
    throw error;
  }
}
