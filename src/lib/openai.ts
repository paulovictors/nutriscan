import OpenAI from 'openai';
import { Meal } from '../types';
import { generateId } from './utils';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Inicializa o cliente OpenAI
const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true 
});

export async function analyzeFoodImage(base64Image: string): Promise<Meal> {
  try {
    if (!apiKey || apiKey.includes('YOUR_API_KEY') || apiKey.length < 10) {
      throw new Error("Chave da API OpenAI inválida ou não configurada.");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system",
          content: `Você é um nutricionista especializado em análise alimentar por imagem. 
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
6. Se a imagem for ruim, peça uma foto mais clara.
7. Responda ESTRITAMENTE com um objeto JSON válido.

Formato do JSON esperado:
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
}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analise esta refeição e forneça a tabela nutricional completa." },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
                detail: "high"
              }
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Sem resposta da IA");
    }

    const data = JSON.parse(content);

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
    console.error("Erro na análise OpenAI:", error);
    
    if (error.status === 401) {
      throw new Error("Chave API inválida. Verifique a configuração.");
    }
    if (error.status === 429) {
      throw new Error("Limite de uso da IA excedido (Quota). Verifique o plano da OpenAI.");
    }
    
    throw error;
  }
}
