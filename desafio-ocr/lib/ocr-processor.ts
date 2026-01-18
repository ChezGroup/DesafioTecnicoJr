import { format, isValid, parse } from "date-fns";
import {
  DadosEstruturados,
  DadosEstruturadosSchema,
  ItemNota,
  ResultadoProcessamento,
} from "./types";
import { ptBR } from "date-fns/locale";

export function processarTextoOCR(texto: string): ResultadoProcessamento {
  const linhas = texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  const dados: Partial<DadosEstruturados> = {};

  const problemasEncontrados: string[] = [];

  dados.estabelecimento = extrairEstabelecimento(linhas);

  const cnpjExtraido = extrairCNPJ(texto);
  if (cnpjExtraido) {
    dados.cnpj = cnpjExtraido;
  }

  const dataExtraida = extrairData(texto);
  if (dataExtraida) {
    dados.data = dataExtraida;
  } else {
    dados.data = "Data não identificada";
    problemasEncontrados.push("Data não pôde ser extraída ou validada");
  }

  dados.hora = extrairHora(texto);

  dados.itens = extrairItens(linhas);

  dados.valorTotal = extrairValorTotal(texto);

  dados.formaPagamento = extrairFormaPagamento(texto);

  // === VALIDAÇÃO COM ZOD ===

  try {
    // .parse() valida e retorna os dados se tudo estiver OK
    // Se falhar, lança um erro
    const dadosValidados = DadosEstruturadosSchema.parse(dados);

    const confianca = calcularConfianca(dadosValidados, problemasEncontrados);
    return {
      dados: dadosValidados,
      confianca,
    };
  } catch (error: any) {
    const errosZod =
      error.errors?.map((e: any) => `${e.path.join(".")}: ${e.message}`) || [];
    problemasEncontrados.push(...errosZod);

    // Retorna com confiança baixa
    return {
      dados: dados as DadosEstruturados,
      confianca: {
        score: 0.2,
        nivel: "Baixa",
        detalhes: problemasEncontrados,
      },
    };
  }
}

function extrairEstabelecimento(linhas: string[]): string {
  // Loop pelas primeiras 5 linhas apenas (estabelecimento geralmente está no topo)
  for (const linha of linhas.slice(0, 5)) {
    // Se a linha tem menos de 3 caracteres, provavelmente não é o nome
    // Se contém "CNPJ", é a linha do documento, não o nome
    if (linha.length < 3 || linha.includes("CNPJ")) continue;
    // regex que verifica se a linha contém APENAS números e símbolos
    if (/^[\d\s\-\/\*]+$/.test(linha)) continue;

    return linha;
  }
  return "Estabelecimento não identificado";
}

function extrairCNPJ(texto: string): string | undefined {
  // Regex para CNPJ com //Regex
  // CNPJ - palavra literal "CNPJ"
  // \.? - zero ou um ponto (? torna opcional)
  // [:\s]* - zero ou mais : ou espaços depois de "CNPJ"
  // /i - flag 'i' = case insensitive (aceita "cnpj", "CNPJ", "Cnpj")ou sem formatação
  const regexCNPJ = /CNPJ[:\s]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/i;
  const match = texto.match(regexCNPJ);

  if (match) {
    //remove caracteres não numericos
    const cnpjLimpo = match[1].replace(/\D/g, "");
    if (cnpjLimpo.length === 14) {
      // Formata no padrão XX.XXX.XXX/XXXX-XX
      return cnpjLimpo.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    }
  }

  return undefined;
}

function extrairData(texto: string): string | undefined {
  // Aceita: 15/01/2026, 15-01-26, 1/1/26, etc
  const regexData = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
  const match = texto.match(regexData);

  if (match) {
    // _ = ignora match[0] (texto completo)
    let [_, dia, mes, ano] = match;

    if (ano.length === 2) {
      ano = "20" + ano;
    }
    // .padStart(2, '0') - garante que tem 2 caracteres
    // Se dia 1, vira 01
    // Se dia 15, continua 15
    dia = dia.padStart(2, "0");
    mes = mes.padStart(2, "0");

    // Monta string de data no formato brasileiro
    const dataStr = `${dia}/${mes}/${ano}`;

    // === USA DATE-FNS PARA VALIDAR ===
    const dataObj = parse(dataStr, "dd/MM/yyyy", new Date(), { locale: ptBR });
    // isValid() verifica se a data é real
    // Exemplo: 31/02/2026 retornaria false
    if (isValid(dataObj)) {
      // format() converte para string no formato desejado
      // 'yyyy-MM-dd' = formato ISO (2026-01-15)
      return format(dataObj, "yyyy-MM-dd");
    }
  }

  return undefined;
}

function extrairHora(texto: string): string | undefined {
  // Regex para hora (aceita : ou . como separador)
  const regexHora = /(\d{1,2})[:.](\d{2})/;

  const match = texto.match(regexHora);

  if (match) {
    // Desestrutura os grupos

    const [_, hora, minuto] = match;
    const horaFormatada = `${hora.padStart(2, "0")}:${minuto}`;
    // Valida se hora e minuto estão dentro dos limites
    const h = parseInt(hora);
    const m = parseInt(minuto);

    // Hora deve ser 0-23, minuto deve ser 0-59
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return horaFormatada;
    }
  }
  return undefined;
}

function extrairValorTotal(texto: string): number {
  const linhas = texto.split("\n");

  for (const linha of linhas) {
    // Regex /total/i - procura "total" ignorando maiúsculas/minúsculas
    // .test() retorna true ou false
    if (/total/i.test(linha)) {
      // Regex para extrair valor monetário
      const match = linha.match(/(\d+)[,.](\d{2})/);
      if (match) {
        return parseFloat(`${match[1]}.${match[2]}`);
      }
    }
  }
  return 0;
}

function extrairItens(linhas: string[]): ItemNota[] {
  const itens: ItemNota[] = [];

  let dentroSecaoItens = false;

  for (const linha of linhas) {
    //cabeçalho da tabela de itens
    if (/DESC|QT|VL UNIT|VL TOTAL/i.test(linha)) {
      dentroSecaoItens = true;
      continue;
    }

    //fim da secao de itens
    if (/TOTAL|Pagamento/i.test(linha)) {
      dentroSecaoItens = false;
      break;
    }

    if (dentroSecaoItens) {
      //extrai item da linha
      const item = extrairItemDaLinha(linha);

      //se extraiu, add dentro do array
      if (item) {
        itens.push(item);
      }
    }
  }
  return itens;
}

function extrairItemDaLinha(linha: string): ItemNota | null {
  const partes = linha.split(/\s{2,}/).filter(Boolean);

  if (partes.length < 2) return null;

  const descricao = partes[0].trim();

  const numeros = partes
    .slice(1)
    .map((p) => {
      return parseFloat(p.replace(",", "."));
    })
    .filter((n) => !isNaN(n));

  //precisa ter pelo menos 2 numeros validos
  if (numeros.length >= 2) {
    if (numeros.length >= 3) {
      //Tem 3+ números (quantidade, valor unit, valor total)

      return {
        descricao,
        quantidade: numeros[0],
        valorUnitario: numeros[1],
        valorTotal: numeros[2],
      };
    }
    //tem 2 numeros (quantidade e valor total)
    //calcula o valor unitario
    else {
      return {
        descricao,
        quantidade: numeros[0],
        valorUnitario: numeros[1] / numeros[0],
        valorTotal: numeros[1],
      };
    }
  }
  return null;
}

function extrairFormaPagamento(texto: string): string | undefined {
  const formas = ["débito", "crédito", "dinheiro", "pix", "cartão"];

  const textoLower = texto.toLowerCase();

  for (const forma of formas) {
    if (textoLower.includes(forma)) {
      //capitaliza primeira letra
      return forma.charAt(0).toUpperCase() + forma.slice(1);
    }
  }

  return undefined;
}

function calcularConfianca(
  dados: DadosEstruturados,
  problemas: string[],
): { score: number; nivel: "Alta" | "Média" | "Baixa"; detalhes: string[] } {
  //começa com score perfeito
  let score = 1.0;

  const detalhes: string[] = [...problemas]; // Copia problemas já encontrados

  //PENALIDADES

  //estabelecimento nao identificado
  if (dados.estabelecimento === "Estabelecimento não identificado") {
    score -= 0.2;
    detalhes.push("Estabelecimento não identificado");
  }

  //cnpj ausente
  if (!dados.cnpj) {
    score -= 0.15;
    detalhes.push("CNPJ não encontrado");
  }

  //valor total ausente ou zero
  if (!dados.valorTotal || dados.valorTotal === 0) {
    score -= 0.3;
    detalhes.push("Valor total não encontrado");
  }

  if (dados.itens && dados.itens.length > 0) {
    //soma o valor total
    const somaItens = dados.itens.reduce(
      (acc, item) => acc + item.valorTotal,
      0,
    );

    const diferenca = Math.abs(somaItens - dados.valorTotal);

    if (diferenca > 0.1) {
      score -= 0.1;
      detalhes.push(
        `Soma dos itens (R$ ${somaItens.toFixed(2)}) ` +
          `difere do total (R$ ${dados.valorTotal.toFixed(2)})`,
      );
    }
  }

  // se tem hora, aumenta confiança levemente
  if (dados.hora) {
    score += 0.05;
    detalhes.push("Hora identificada com sucesso");
  }

  // se tem forma de pagamento, aumenta confiança
  if (dados.formaPagamento) {
    score += 0.05;
    detalhes.push("Forma de pagamento identificada");
  }

  // score fica entre 0 e 1
  score = Math.max(0, Math.min(1, score));

  // determinando nivel
  let nivel: "Alta" | "Média" | "Baixa";

  if (score >= 0.8) {
    nivel = "Alta";
  } else if (score >= 0.5) {
    nivel = "Média";
  } else {
    nivel = "Baixa";
  }

  return { score, nivel, detalhes };
}
