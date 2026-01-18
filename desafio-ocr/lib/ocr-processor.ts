import { format, isValid, parse } from "date-fns";
import {
  DadosEstruturados,
  DadosEstruturadosSchema,
  ItemNota,
  ResultadoProcessamento,
} from "./types";
import { ptBR } from "date-fns/locale";

function corrigirErrosOCR(texto: string): string {
  let corrigido = texto;

  // O maiúsculo no meio/fim de números → 0
  corrigido = corrigido.replace(/(\d)O(\d)/g, "$10$2");
  corrigido = corrigido.replace(/(\d)O\b/g, "$10");
  corrigido = corrigido.replace(/\bO(\d)/g, "0$1");

  // l (letra L minúscula) em contexto numérico → 1
  corrigido = corrigido.replace(/\bl(\d)/g, "1$1");
  corrigido = corrigido.replace(/(\d)l\b/g, "$11");

  // Espaços múltiplos em números (ex: "1 ,80" → "1,80")
  corrigido = corrigido.replace(/(\d)\s+([,.]\s*\d)/g, "$1$2");
  corrigido = corrigido.replace(/(\d[,.])\s+(\d)/g, "$1$2");

  return corrigido;
}

function detectarValorAproximado(texto: string): boolean {
  return /aprox|aproximad|~|circa/i.test(texto);
}

function extrairObservacoes(texto: string): string | undefined {
  const observacoes: string[] = [];

  // Detecta volume (qualquer unidade: L, kg, ml, etc)
  const matchVolume = texto.match(
    /vol(?:ume)?[:\s]*(\d+[,.]?\d*)\s*([a-zA-Z]+)/i,
  );
  if (matchVolume) {
    observacoes.push(
      `Volume: ${matchVolume[1].replace(",", ".")} ${matchVolume[2]}`,
    );
  }

  // Detecta preço unitário (por litro, por kg, etc)
  const matchPrecoUnit = texto.match(
    /(?:preco|pre[cç]o|r\$)[\/\s]*([a-zA-Z]+)[:\s]*(\d+[,.]?\d*)/i,
  );
  if (matchPrecoUnit) {
    observacoes.push(
      `Preço por ${matchPrecoUnit[1]}: R$ ${matchPrecoUnit[2].replace(",", ".")}`,
    );
  }

  // Detecta taxa de serviço
  const matchTaxa = texto.match(/(?:tx|taxa).*?(\d+)%/i);
  if (matchTaxa) {
    observacoes.push(`Taxa de serviço: ${matchTaxa[1]}%`);
  }

  // Detecta troco/resto
  const matchTroco = texto.match(
    /(?:troco|rest(?:o)?|volta)[:\s]*(\d+[,.]?\d*)/i,
  );
  if (matchTroco) {
    observacoes.push(`Troco: R$ ${matchTroco[1].replace(",", ".")}`);
  }

  // Detecta valor pago
  const matchPago = texto.match(
    /(?:dinheiro|pago|recebido)[:\s]*(\d+[,.]?\d*)/i,
  );
  if (matchPago) {
    observacoes.push(`Valor pago: R$ ${matchPago[1].replace(",", ".")}`);
  }

  // Detecta desconto
  const matchDesconto = texto.match(/desconto[:\s]*(\d+[,.]?\d*)/i);
  if (matchDesconto) {
    observacoes.push(`Desconto: R$ ${matchDesconto[1].replace(",", ".")}`);
  }

  // Detecta mesa/comanda (restaurantes)
  const matchMesa = texto.match(/(?:mesa|comanda)[:\s]*(\d+)/i);
  if (matchMesa) {
    observacoes.push(`Mesa/Comanda: ${matchMesa[1]}`);
  }

  return observacoes.length > 0 ? observacoes.join(" | ") : undefined;
}

function extrairSubtotal(texto: string): number | undefined {
  const match = texto.match(/sub[\s\-]*t(?:otal)?[:\s]*(\d+[,.]?\d*)/i);
  if (match) {
    return parseFloat(match[1].replace(",", "."));
  }
  return undefined;
}

function determinarValorTotal(
  texto: string,
  itens: ItemNota[] | undefined,
  subtotal: number | undefined,
): number {
  const linhas = texto.split("\n");

  for (const linha of linhas) {
    const linhaLimpa = linha.trim().toLowerCase();

    // Ignora se tem "sub" antes de total
    if (linhaLimpa.includes("sub")) continue;

    // Procura "TOTAL" no início da linha
    if (
      /^(?:to\s*al|total|valor\s*(?:a\s*pagar|total)|total\s*(?:a\s*pagar)?)/i.test(
        linha,
      )
    ) {
      // Extrai o último número da linha (total)
      const numeros = linha.match(/\d+[,.]?\d*/g);
      if (numeros && numeros.length > 0) {
        const ultimoNumero = numeros[numeros.length - 1];
        const valor = parseFloat(ultimoNumero.replace(",", "."));
        if (valor > 0) return valor;
      }
    }
  }

  if (subtotal) {
    const matchTaxa = texto.match(/(?:tx|taxa)[^0-9]*(\d+[,.]?\d*)/i);
    if (matchTaxa) {
      const valorTaxa = parseFloat(matchTaxa[1].replace(",", "."));
      // Verifica se faz sentido (taxa entre 0.1% e 30% do subtotal)
      if (valorTaxa > 0 && valorTaxa < subtotal * 0.3) {
        return subtotal + valorTaxa;
      }
    }

    return subtotal;
  }

  const matchVolume = texto.match(/vol(?:ume)?[:\s]*(\d+[,.]?\d*)/i);
  const matchPreco = texto.match(/preco[\/\s]*[lL][:\s]*(\d+[,.]?\d*)/i);
  if (matchVolume && matchPreco) {
    const volume = parseFloat(matchVolume[1].replace(",", "."));
    const preco = parseFloat(matchPreco[1].replace(",", "."));
    const calculado = volume * preco;
    // Verifica se o valor calculado está próximo de algum valor no texto
    const matchValorTexto = texto.match(/(\d{2,}[,.]?\d*)/g);
    if (matchValorTexto) {
      const valores = matchValorTexto.map((v) =>
        parseFloat(v.replace(",", ".")),
      );
      const valorProximo = valores.find((v) => Math.abs(v - calculado) < 5);
      if (valorProximo) return valorProximo;
    }
    return calculado;
  }

  if (itens && itens.length > 0) {
    const soma = itens.reduce((acc, item) => acc + item.valorTotal, 0);
    if (soma > 0) return soma;
  }

  const matchFallback = texto.match(
    /(?:total|pagar|valor)[^\d]*(\d+[,.]?\d*)/i,
  );
  if (matchFallback) {
    return parseFloat(matchFallback[1].replace(",", "."));
  }

  const todosNumeros = texto.match(/\d+[,.]?\d{2}/g);
  if (todosNumeros) {
    const valores = todosNumeros.map((n) => parseFloat(n.replace(",", ".")));
    return Math.max(...valores);
  }

  return 0;
}

export function processarTextoOCR(texto: string): ResultadoProcessamento {
  const textoCorrigido = corrigirErrosOCR(texto);

  const linhas = textoCorrigido
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  const dados: Partial<DadosEstruturados> = {};

  const problemasEncontrados: string[] = [];

  dados.estabelecimento = extrairEstabelecimento(linhas);
  dados.cnpj = extrairCNPJ(textoCorrigido);

  const dataExtraida = extrairData(texto);
  if (dataExtraida) {
    dados.data = dataExtraida;
  } else {
    dados.data = "Data não identificada";
    problemasEncontrados.push("Data não pôde ser extraída ou validada");
  }

  dados.hora = extrairHora(textoCorrigido);
  dados.formaPagamento = extrairFormaPagamento(textoCorrigido);

  dados.valorAproximado = detectarValorAproximado(textoCorrigido);
  dados.subtotal = extrairSubtotal(textoCorrigido);
  dados.observacoes = extrairObservacoes(textoCorrigido);

  dados.itens = extrairItens(linhas);

  dados.valorTotal = determinarValorTotal(
    textoCorrigido,
    dados.itens,
    dados.subtotal,
  );

  // === VALIDAÇÃO COM ZOD ===
  try {
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
  // Regex para CNPJ com ou sem formatação
  const regexCNPJ = /CNPJ[:\s]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/i;
  const match = texto.match(regexCNPJ);

  if (match) {
    // Remove caracteres não numéricos
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
    let [_, dia, mes, ano] = match;

    if (ano.length === 2) {
      ano = "20" + ano;
    }
    dia = dia.padStart(2, "0");
    mes = mes.padStart(2, "0");

    const dataStr = `${dia}/${mes}/${ano}`;

    const dataObj = parse(dataStr, "dd/MM/yyyy", new Date(), { locale: ptBR });
    if (isValid(dataObj)) {
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
    if (/total/i.test(linha)) {
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
  const palavrasIgnorar =
    /^(?:vol|preco|taxa|tx|sub|dinheiro|troco|rest|pago|recebido|desc|qt|vl|total|pagamento|forma|mesa|comanda|data|hora|cnpj)/i;

  for (const linha of linhas) {
    if (linha.length < 3) continue;

    if (palavrasIgnorar.test(linha)) {
      // Cabeçalho da tabela de itens
      if (/DESC|QT|VL UNIT|VL TOTAL/i.test(linha)) {
        dentroSecaoItens = true;
        continue;
      }
      // Para quando encontrar TOTAL
      if (/^(?:to\s*al|total)/i.test(linha)) {
        break;
      }
      continue;
    }

    const item = extrairItemDaLinha(linha);
    if (item) {
      itens.push(item);
    }
  }

  return itens;
}

function extrairItemDaLinha(linha: string): ItemNota | null {
  linha = linha.trim();

  const partesEspacos = linha.split(/\s{2,}/).filter(Boolean);

  if (partesEspacos.length >= 2) {
    const descricao = partesEspacos[0].trim();
    const numeros = partesEspacos
      .slice(1)
      .map((p) => parseFloat(p.replace(",", ".")))
      .filter((n) => !isNaN(n) && n > 0);

    if (numeros.length >= 3) {
      return {
        descricao,
        quantidade: numeros[0],
        valorUnitario: numeros[1],
        valorTotal: numeros[2],
      };
    }

    if (numeros.length === 2 && numeros[0] <= 100) {
      return {
        descricao,
        quantidade: numeros[0],
        valorUnitario: numeros[1] / numeros[0],
        valorTotal: numeros[1],
      };
    }
  }

  const matchX = linha.match(/^(.+?)\s+(\d{1,3})\s*[xX]\s*(\d+[,.]?\d*)/);
  if (matchX) {
    const descricao = matchX[1].trim();
    const quantidade = parseFloat(matchX[2]);
    const valorUnitario = parseFloat(matchX[3].replace(",", "."));

    return {
      descricao,
      quantidade,
      valorUnitario,
      valorTotal: quantidade * valorUnitario,
    };
  }

  const matchXCompacto = linha.match(/^(.+?)\s+(\d{1,3})x(\d+[,.]?\d*)/i);
  if (matchXCompacto) {
    const descricao = matchXCompacto[1].trim();
    const quantidade = parseFloat(matchXCompacto[2]);
    const valorUnitario = parseFloat(matchXCompacto[3].replace(",", "."));

    return {
      descricao,
      quantidade,
      valorUnitario,
      valorTotal: quantidade * valorUnitario,
    };
  }

  const matchSimples = linha.match(/^(\d{1,2})\s+(.+?)\s+(\d+[,.]?\d*)$/);
  if (matchSimples) {
    const quantidade = parseFloat(matchSimples[1]);
    const descricao = matchSimples[2].trim();
    const valorTotal = parseFloat(matchSimples[3].replace(",", "."));

    if (quantidade > 0 && quantidade <= 100 && valorTotal > 0) {
      return {
        descricao,
        quantidade,
        valorUnitario: valorTotal / quantidade,
        valorTotal,
      };
    }
  }

  const matchValorUnico = linha.match(/^([a-zA-Z].+?)\s+(\d+[,.]?\d{2})$/);
  if (matchValorUnico) {
    const descricao = matchValorUnico[1].trim();
    const valor = parseFloat(matchValorUnico[2].replace(",", "."));

    if (valor > 0 && valor < 10000) {
      return {
        descricao,
        quantidade: 1,
        valorUnitario: valor,
        valorTotal: valor,
      };
    }
  }

  return null;
}

function extrairFormaPagamento(texto: string): string | undefined {
  const formas = [
    { regex: /d[eé]bito/i, nome: "Débito" },
    { regex: /cr[eé]dito/i, nome: "Crédito" },
    { regex: /cart[aã]o|cart\b/i, nome: "Cartão" },
    { regex: /dinheiro/i, nome: "Dinheiro" },
    { regex: /pix/i, nome: "PIX" },
  ];

  for (const forma of formas) {
    if (forma.regex.test(texto)) {
      return forma.nome;
    }
  }
  return undefined;
}

function calcularConfianca(
  dados: DadosEstruturados,
  problemas: string[],
): { score: number; nivel: "Alta" | "Média" | "Baixa"; detalhes: string[] } {
  // Começa com score perfeito
  let score = 1.0;

  const detalhes: string[] = [...problemas];

  // PENALIDADES

  // Estabelecimento não identificado
  if (dados.estabelecimento === "Estabelecimento não identificado") {
    score -= 0.2;
    detalhes.push("Estabelecimento não identificado");
  }

  // CNPJ ausente
  if (!dados.cnpj) {
    score -= 0.15;
    detalhes.push("CNPJ não encontrado");
  }

  if (dados.data === "Data não identificada") {
    score -= 0.2;
    detalhes.push("Data não identificada ou inválida");
  }

  // Valor total ausente ou zero
  if (!dados.valorTotal || dados.valorTotal === 0) {
    score -= 0.3;
    detalhes.push("Valor total não encontrado");
  }

  // Valor aproximado detectado
  if (dados.valorAproximado) {
    score -= 0.15;
    detalhes.push("Valor aproximado detectado - confiança reduzida");
  }

  // Verifica consistência entre soma de itens e total/subtotal
  if (dados.itens && dados.itens.length > 0) {
    const somaItens = dados.itens.reduce(
      (acc, item) => acc + item.valorTotal,
      0,
    );
    const valorReferencia = dados.subtotal || dados.valorTotal;
    const diferenca = Math.abs(somaItens - valorReferencia);

    if (diferenca > 0.5) {
      score -= 0.1;
      detalhes.push(
        `Inconsistência: soma itens (R$ ${somaItens.toFixed(2)}) vs ${dados.subtotal ? "subtotal" : "total"} (R$ ${valorReferencia.toFixed(2)})`,
      );
    }
  }

  // BÔNUS

  if (dados.hora) {
    score += 0.05;
    detalhes.push("Hora identificada");
  }

  if (dados.formaPagamento) {
    score += 0.05;
    detalhes.push("Forma de pagamento identificada");
  }

  if (dados.observacoes) {
    score += 0.05;
    detalhes.push("Informações adicionais extraídas");
  }

  // Limita entre 0 e 1
  score = Math.max(0, Math.min(1, score));

  // Determina nível
  let nivel: "Alta" | "Média" | "Baixa";
  if (score >= 0.8) nivel = "Alta";
  else if (score >= 0.5) nivel = "Média";
  else nivel = "Baixa";

  return { score, nivel, detalhes };
}
