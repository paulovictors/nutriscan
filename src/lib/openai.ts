import OpenAI from 'openai';
import { Meal } from '../types';
import { generateId } from './utils';

// Obtém a chave das variáveis de ambiente
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Inicializa o cliente OpenAI
const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
  dangerouslyAllowBrowser: true 
});

export async function analyzeFoodImage(base64Image: string): Promise<Meal> {
  // Se não houver chave configurada, lançamos erro ou usamos mock direto (opcional)
  // Mas vamos tentar chamar a API primeiro se a chave existir.

  try {
    if (!apiKey || apiKey.includes('YOUR_API_KEY')) {
      throw new Error("API Key missing");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um nutricionista especialista. Sua tarefa é analisar imagens de comida e fornecer informações nutricionais precisas.
          
          Regras de Resposta:
          1. Retorne APENAS um objeto JSON válido. Não use blocos de código markdown (\`\`\`).
          2. O idioma deve ser Português (pt-PT).
          3. Estime as calorias e macros com base em porções padrão visíveis.
          4. Se a imagem não for de comida, retorne um JSON com o campo "error": "Não foi possível identificar comida nesta imagem."
          
          Formato do JSON esperado:
          {
            "name": "Nome curto do prato (ex: Salmão Grelhado)",
            "description": "Descrição dos ingredientes visíveis (ex: Filete de salmão com brócolos e puré)",
            "calories": número (total kcal, ex: 450),
            "macros": {
              "protein": número (gramas),
              "carbs": número (gramas),
              "fat": número (gramas)
            },
            "micros": {
              "Vitamina A": "valor (ex: 15%)",
              "Ferro": "valor (ex: 2mg)",
              "Cálcio": "valor"
            }
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
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Sem resposta da IA");
    }

    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let data;
    try {
      data = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Erro ao fazer parse do JSON da IA:", cleanJson);
      throw new Error("A IA retornou um formato inválido.");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      id: generateId(),
      date: new Date().toISOString(),
      imageUrl: base64Image,
      name: data.name,
      description: data.description,
      calories: Number(data.calories),
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
    
    // FALLBACK: Se for erro de Cota (429) ou Autenticação (401), retornamos um Mock
    // Isso permite testar o app mesmo sem pagar a API.
    if (
      error.status === 429 || 
      error.status === 401 || 
      error.code === 'insufficient_quota' ||
      error.message === "API Key missing"
    ) {
      console.warn("⚠️ Usando dados simulados (Mock) devido a erro de API/Cota.");
      
      // Simular delay de rede para parecer real
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        id: generateId(),
        date: new Date().toISOString(),
        imageUrl: base64Image,
        name: "Refeição Detectada (Modo Simulação)",
        description: "A sua chave da OpenAI excedeu a cota ou expirou. Esta é uma resposta simulada para demonstrar a funcionalidade. O prato parece saudável e equilibrado.",
        calories: 520,
        macros: {
          protein: 35,
          carbs: 45,
          fat: 18
        },
        micros: {
          "Vitamina C": "25%",
          "Ferro": "3.2mg",
          "Cálcio": "12%"
        },
        type: 'lunch'
      };
    }
    
    // Outros erros (ex: servidor em baixo) continuam a ser lançados
    throw error;
  }
}
