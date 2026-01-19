"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { DadosEstruturados } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function extrairComIA(
  textoSujo: string,
): Promise<DadosEstruturados | null> {
  const prompt = `Você é um especialista em OCR de notas fiscais brasileiras.

Corrija este texto e retorne APENAS um JSON válido (sem markdown, sem explicações):

TEXTO OCR:
${textoSujo}

REGRAS DE CORREÇÃO:

1. **Produtos comuns** (corrija palavras quebradas pelo OCR):
   - "ar oz" ou "ar z" → "Arroz"
   - "fe jao" ou "feij" → "Feijão"
   - "ole" ou "ol o" → "Óleo"
   - "so a" → "Soja"
   - "aç car" → "Açúcar"
   
2. **CNPJ**: 
   - Formate como XX.XXX.XXX/XXXX-XX
   - Se não encontrar ou estiver incompleto: use null
   
3. **Data**: 
   - Converta para YYYY-MM-DD (ex: 19/01/26 → 2026-01-19)
   
4. **Forma de pagamento**: 
   - "d nh" ou "dinheiro" → "Dinheiro"
   - "cart" → "Cartão"
   - "pix" → "PIX"
   
5. **MATEMÁTICA CRÍTICA** ⚠️:
   - SEMPRE calcule: quantidade × valorUnitario = valorTotal (para cada item)
   - SEMPRE some todos os itens e compare com o total da nota
   - Se os valores no OCR estiverem errados, CORRIJA para que a matemática feche
   - Exemplo: se "2k × 1,80" está no texto mas deveria dar 3,60, use esses valores
   
6. **Interpretação de quantidades**:
   - "2k" significa 2 quilos = quantidade 2
   - "1un" significa 1 unidade = quantidade 1
   
7. Use português correto com acentos nos nomes

EXEMPLO DE ANÁLISE:
Texto: "ar oz t1  2k  1,80"
Interpretação:
- Produto: "Arroz tipo 1"
- Quantidade: 2 (kg)
- Valor unitário: R$ 1,80
- Valor total do item: 2 × 1,80 = R$ 3,60

FORMATO JSON ESPERADO:
{
  "estabelecimento": "string",
  "cnpj": "XX.XXX.XXX/XXXX-XX ou null",
  "data": "YYYY-MM-DD",
  "hora": "HH:MM ou null",
  "itens": [
    {
      "descricao": "Arroz tipo 1",
      "quantidade": 2.0,
      "valorUnitario": 1.80,
      "valorTotal": 3.60
    }
  ],
  "subtotal": null,
  "valorTotal": 19.70,
  "formaPagamento": "Dinheiro",
  "valorAproximado": false,
  "observacoes": null
}

⚠️ VALIDAÇÃO FINAL OBRIGATÓRIA:
- Some todos os valorTotal dos itens
- O resultado DEVE ser igual ao valorTotal da nota
- Se não bater, REVISE os cálculos

⚠️ SITUAÇÕES ESPECIAIS:

1. **Se a soma dos itens NÃO bater com o total**:
   - Verifique se há taxa de serviço, desconto, ou itens faltando
   - Priorize o valor "TOTAL" escrito na nota
   - Adicione no campo "observacoes" a explicação, exemplo:
     "Atenção: Soma dos itens (R$ 19,70) difere do total informado (R$ 27,90). Possível item faltando ou taxa adicional."

2. **Valores aproximados**:
   - Se tiver "aprox" no texto, marque valorAproximado: true

3. **CNPJ incompleto ou inválido**:
   - Se não tiver 14 dígitos ou estiver malformado: use null

Retorne APENAS o JSON, sem explicações.`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const conteudo = response.text();

    if (!conteudo) {
      console.error("❌ Gemini retornou resposta vazia");
      return null;
    }

    // Remove possíveis markdown wrappers que às vezes aparecem
    let textoLimpo = conteudo.trim();
    textoLimpo = textoLimpo.replace(/^```json\s*/i, "");
    textoLimpo = textoLimpo.replace(/^```\s*/i, "");
    textoLimpo = textoLimpo.replace(/\s*```$/g, "");
    textoLimpo = textoLimpo.trim();

    const dados = JSON.parse(textoLimpo) as DadosEstruturados;

    // Validação matemática extra: garante que os cálculos estão corretos
    if (dados.itens) {
      dados.itens = dados.itens.map((item) => ({
        ...item,
        valorTotal: parseFloat(
          (item.quantidade * item.valorUnitario).toFixed(2),
        ),
      }));
    }

    console.log("✅ IA (Gemini) processou com sucesso");
    return dados;
  } catch (error: any) {
    console.error("❌ Erro na IA (Gemini):", error?.message || error);

    // Log adicional para debug
    if (error?.response) {
      console.error("Resposta do erro:", error.response);
    }

    return null;
  }
}
