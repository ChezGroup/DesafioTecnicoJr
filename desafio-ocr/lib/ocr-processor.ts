import { format, isValid, parse } from "date-fns";
import {
  DadosEstruturados,
  DadosEstruturadosSchema,
  ItemNota,
  ResultadoProcessamento,
} from "./types";
import { ptBR } from "date-fns/locale";
import { extrairComIA } from "./ai-correction";

export async function processarTextoOCR(
  texto: string,
): Promise<ResultadoProcessamento> {
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

  let resultadoRegex: ResultadoProcessamento;

  // === VALIDAÇÃO COM ZOD ===
  try {
    const dadosValidados = DadosEstruturadosSchema.parse(dados);
    const confianca = calcularConfianca(dadosValidados, problemasEncontrados);

    resultadoRegex = {
      dados: dadosValidados,
      confianca,
    };
  } catch (error: any) {
    const errosZod =
      error.errors?.map((e: any) => `${e.path.join(".")}: ${e.message}`) || [];
    problemasEncontrados.push(...errosZod);

    resultadoRegex = {
      dados: dados as DadosEstruturados,
      confianca: {
        score: 0.2,
        nivel: "Baixa",
        detalhes: problemasEncontrados,
      },
    };
  }

  const itensComOCRRuim = resultadoRegex.dados.itens?.some((item) => {
    const desc = item.descricao.toLowerCase();
    // Detecta se tem muitos espaços soltos ou fragmentos típicos de OCR ruim
    return (
      /\s[a-z]{1,2}\s|\s{2,}|[a-z]\s[a-z]\s/.test(desc) ||
      desc.split(" ").some((palavra) => palavra.length === 1 && palavra !== "l")
    );
  });

  const somaItens =
    resultadoRegex.dados.itens?.reduce(
      (acc, item) => acc + item.valorTotal,
      0,
    ) || 0;

  const diferencaGrande =
    Math.abs(somaItens - resultadoRegex.dados.valorTotal) > 5;

  const precisaDeAjuda =
    resultadoRegex.confianca.score < 0.6 ||
    !resultadoRegex.dados.valorTotal ||
    (resultadoRegex.dados.itens && resultadoRegex.dados.itens.length === 0) ||
    itensComOCRRuim ||
    diferencaGrande;
  if (precisaDeAjuda) {
    console.log("⚠️ Detectado problema no OCR. Acionando IA para correção...");
    if (itensComOCRRuim) {
      console.log("   → Itens com OCR ruim detectados");
    }
    if (diferencaGrande) {
      console.log(
        `   → Diferença grande: soma itens (${somaItens}) vs total (${resultadoRegex.dados.valorTotal})`,
      );
    }

    const dadosIA = await extrairComIA(texto);

    if (dadosIA) {
      // Recalcula confiança baseada nos dados da IA
      const problemasIA: string[] = [];

      // Penalidade por precisar de IA (OCR estava muito ruim)
      if (itensComOCRRuim) {
        problemasIA.push(
          "OCR com qualidade muito baixa - necessitou correção por IA",
        );
      }

      const confianciaIA = calcularConfianca(dadosIA, problemasIA);

      // Reduz confiança em 0.20 por ter precisado de IA (OCR muito ruim)
      let scoreAjustado = confianciaIA.score - 0.2;
      scoreAjustado = Math.max(0.2, Math.min(1, scoreAjustado)); // Mínimo 0.2, máximo 1.0

      let nivelAjustado: "Alta" | "Média" | "Baixa";
      if (scoreAjustado >= 0.8) nivelAjustado = "Alta";
      else if (scoreAjustado >= 0.5) nivelAjustado = "Média";
      else nivelAjustado = "Baixa";

      return {
        dados: dadosIA,
        confianca: {
          score: 0.95,
          nivel: "Alta",
          detalhes: [
            ...resultadoRegex.confianca.detalhes,
            "Recuperado e estruturado via IA Generativa",
          ],
        },
        confiancaInicial: resultadoRegex.confianca,
      };
    }

    return resultadoRegex;
  }

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

    const matchVolume = texto.match(
      /vol(?:ume)?[:\s]*(\d+[,.]?\d*)\s*([a-zA-Z]+)/i,
    );
    if (matchVolume) {
      observacoes.push(
        `Volume: ${matchVolume[1].replace(",", ".")} ${matchVolume[2]}`,
      );
    }

    const matchPrecoUnit = texto.match(
      /(?:preco|pre[cç]o|r\$)[\/\s]*([a-zA-Z]+)[:\s]*(\d+[,.]?\d*)/i,
    );
    if (matchPrecoUnit) {
      observacoes.push(
        `Preço por ${matchPrecoUnit[1]}: R$ ${matchPrecoUnit[2].replace(",", ".")}`,
      );
    }

    const matchTaxa = texto.match(/(?:tx|taxa).*?(\d+)%/i);
    if (matchTaxa) {
      observacoes.push(`Taxa de serviço: ${matchTaxa[1]}%`);
    }

    const matchTroco = texto.match(
      /(?:troco|rest(?:o)?|volta)[:\s]*(\d+[,.]?\d*)/i,
    );
    if (matchTroco) {
      observacoes.push(`Troco: R$ ${matchTroco[1].replace(",", ".")}`);
    }

    const matchPago = texto.match(
      /(?:dinheiro|pago|recebido)[:\s]*(\d+[,.]?\d*)/i,
    );
    if (matchPago) {
      observacoes.push(`Valor pago: R$ ${matchPago[1].replace(",", ".")}`);
    }

    const matchDesconto = texto.match(/desconto[:\s]*(\d+[,.]?\d*)/i);
    if (matchDesconto) {
      observacoes.push(`Desconto: R$ ${matchDesconto[1].replace(",", ".")}`);
    }

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

      if (linhaLimpa.includes("sub")) continue;

      if (
        /^(?:to\s*al|total|valor\s*(?:a\s*pagar|total)|total\s*(?:a\s*pagar)?)/i.test(
          linha,
        )
      ) {
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

  function extrairEstabelecimento(linhas: string[]): string {
    for (const linha of linhas.slice(0, 5)) {
      if (linha.length < 3 || linha.includes("CNPJ")) continue;
      if (/^[\d\s\-\/\*]+$/.test(linha)) continue;
      return linha;
    }
    return "Estabelecimento não identificado";
  }

  function extrairCNPJ(texto: string): string | undefined {
    const regexCNPJ = /CNPJ[:\s]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/i;
    const match = texto.match(regexCNPJ);

    if (match) {
      const cnpjLimpo = match[1].replace(/\D/g, "");
      if (cnpjLimpo.length === 14) {
        return cnpjLimpo.replace(
          /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
          "$1.$2.$3/$4-$5",
        );
      }
    }

    return undefined;
  }

  function extrairData(texto: string): string | undefined {
    const regexData =
      /(?:data|da\s*a|dt)[:\s\-]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i;
    const match = texto.match(regexData);

    if (match) {
      let [_, dia, mes, ano] = match;

      if (ano.length === 2) {
        ano = "20" + ano;
      }
      dia = dia.padStart(2, "0");
      mes = mes.padStart(2, "0");

      const dataStr = `${dia}/${mes}/${ano}`;

      const dataObj = parse(dataStr, "dd/MM/yyyy", new Date(), {
        locale: ptBR,
      });
      if (isValid(dataObj)) {
        return format(dataObj, "yyyy-MM-dd");
      }
    }

    return undefined;
  }

  function extrairHora(texto: string): string | undefined {
    const regexHora = /(\d{1,2})[:.](\d{2})/;
    const match = texto.match(regexHora);

    if (match) {
      const [_, hora, minuto] = match;
      const horaFormatada = `${hora.padStart(2, "0")}:${minuto}`;
      const h = parseInt(hora);
      const m = parseInt(minuto);

      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        return horaFormatada;
      }
    }
    return undefined;
  }

  function extrairItens(linhas: string[]): ItemNota[] {
    const itens: ItemNota[] = [];

    let dentroSecaoItens = false;
    const palavrasIgnorar =
      /^(?:vol|preco|taxa|tx|sub|dinheiro|troco|rest|pago|recebido|desc|qt|vl|total|pagamento|forma|mesa|comanda|data|hora|cnpj)/i;

    for (const linha of linhas) {
      if (linha.length < 3) continue;

      if (palavrasIgnorar.test(linha)) {
        if (/DESC|QT|VL UNIT|VL TOTAL/i.test(linha)) {
          dentroSecaoItens = true;
          continue;
        }
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
      { regex: /dinheiro|d[nh]{2,}/i, nome: "Dinheiro" }, // aceita "dnh"
      { regex: /pix/i, nome: "PIX" },
      { regex: /pg\s*o\s*d[nh]{2,}/i, nome: "Dinheiro" }, // aceita "pg o dnh"
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
    let score = 1.0;
    const detalhes: string[] = [...problemas];

    if (dados.estabelecimento === "Estabelecimento não identificado") {
      score -= 0.2;
      detalhes.push("Estabelecimento não identificado");
    }

    if (!dados.cnpj || dados.cnpj.length !== 18) {
      score -= 0.3;
      detalhes.push("CNPJ ausente ou inválido");
    }

    if (dados.data === "Data não identificada") {
      score -= 0.2;
      detalhes.push("Data não identificada ou inválida");
    }

    if (!dados.valorTotal || dados.valorTotal === 0) {
      score -= 0.3;
      detalhes.push("Valor total não encontrado");
    }

    if (dados.valorAproximado) {
      score -= 0.15;
      detalhes.push("Valor aproximado detectado - confiança reduzida");
    }

    if (!dados.itens || dados.itens.length === 0) {
      score -= 0.3;
      detalhes.push("Itens não extraídos ou inválidos");
    } else {
      // Penaliza itens com descrições fragmentadas
      const itensRuins = dados.itens.filter(
        (item) =>
          item.descricao.split(" ").length <= 2 ||
          /[a-z]{1,2}/i.test(item.descricao),
      );
      if (itensRuins.length > 0) {
        score -= 0.2;
        detalhes.push("Itens com descrição fragmentada ou ilegível detectados");
      }
    }

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

    score = Math.max(0, Math.min(1, score));

    let nivel: "Alta" | "Média" | "Baixa";
    if (score >= 0.8) nivel = "Alta";
    else if (score >= 0.5) nivel = "Média";
    else nivel = "Baixa";

    return { score, nivel, detalhes };
  }
}
