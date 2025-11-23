import OpenAI from 'openai';
import { Meal } from '../types';
import { generateId } from './utils';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true 
});

export async function analyzeFoodImage(base64Image: string): Promise<Meal> {
  try {
    if (!apiKey) {
      throw new Error("Chave da API OpenAI não configurada.");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system",
          content: `Você é um nutricionista especializado.
Sua tarefa é analisar a imagem da refeição e retornar dados nutricionais precisos.

REGRAS OBRIGATÓRIAS:
1. O idioma de resposta deve ser **PORTUGUÊS DE PORTUGAL (PT-PT)**.
2. Identifique os alimentos e estime as quantidades.
3. Retorne APENAS um JSON válido.
4. NÃO use termos em inglês nos valores visíveis.

Formato do JSON:
{
  "name": "Nome curto do prato (ex: Bife com Batatas)",
  "description": "Descrição curta dos ingredientes (ex: 150g de bife grelhado, 100g de batatas assadas)",
  "calories": número (total kcal),
  "macros": {
    "protein": número (gramas de proteína),
    "carbs": número (gramas de hidratos de carbono),
    "fat": número (gramas de gordura)
  },
  "micros": {
    "Fibras": "valor (ex: 5g)",
    "Açúcares": "valor (ex: 2g)",
    "Sódio": "valor (ex: 150mg)"
  },
  "error": "Mensagem de erro em português se a imagem não for clara"
}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analise esta refeição e forneça os dados nutricionais." },
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
      throw new Error("Sem resposta da análise.");
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
      throw new Error("Erro de configuração de API.");
    }
    if (error.status === 429) {
      throw new Error("Limite de requisições excedido. Tente mais tarde.");
    }
    
    throw error;
  }
}
