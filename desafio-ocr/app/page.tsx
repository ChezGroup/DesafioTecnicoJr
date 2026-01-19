"use client";

import { useState } from "react";
import { processarTextoOCR } from "@/lib/ocr-processor";
import { todosExemplos } from "@/data/sample-data";
import { SeletorTextoCard } from "@/components/ocr/SeletorTextoCard";
import { TextoOCRCard } from "@/components/ocr/TextoOCRCard";
import { ResultadoCard } from "@/components/ocr/ResultadoCard";
import { ItensCard } from "@/components/ocr/ItensCard";
import { ConfiancaCard } from "@/components/ocr/ConfiancaCard";
import { JsonCard } from "@/components/ocr/JsonCard";

// ============================================
// TIPOS
// ============================================

interface ResultadoProcessado {
  dados: {
    estabelecimento: string;
    cnpj?: string;
    data: string;
    hora?: string;
    itens?: Array<{
      descricao: string;
      quantidade: number;
      valorUnitario: number;
      valorTotal: number;
    }>;
    subtotal?: number;
    valorTotal: number;
    valorAproximado?: boolean;
    observacoes?: string;
    formaPagamento?: string;
  };
  confianca: {
    score: number;
    nivel: "Alta" | "Média" | "Baixa";
    detalhes: string[];
  };
  confiancaInicial?: Confianca;
}

interface Confianca {
  score: number;
  nivel: "Alta" | "Média" | "Baixa";
  detalhes: string[];
}

interface ResultadoErro {
  erro: true;
  mensagem: Error | unknown;
}

type Resultado = ResultadoProcessado | ResultadoErro | null;

type ExemplosAgrupados = Record<string, typeof todosExemplos>;

// ============================================
// COMPONENTE
// ============================================

export default function Home() {
  const [textoOCR, setTextoOCR] = useState("");
  const [resultado, setResultado] = useState<
    ResultadoProcessado | ResultadoErro | null
  >(null);
  const [exemploAtual, setExemploAtual] = useState("");
  const [processando, setProcessando] = useState(false);
  const [modoAtual, setModoAtual] = useState<"exemplos" | "custom">("exemplos");

  const carregarExemplo = (texto: string, nome: string) => {
    setTextoOCR(texto);
    setExemploAtual(nome);
    setResultado(null);
    setModoAtual("exemplos");
  };

  const usarTextoCustomizado = (texto: string) => {
    setTextoOCR(texto);
    setExemploAtual("Texto Customizado");
    setResultado(null);
    setModoAtual("custom");
  };

  const processar = async () => {
    if (!textoOCR.trim()) return;
    setProcessando(true);
    try {
      const res = await processarTextoOCR(textoOCR);
      setResultado(res as ResultadoProcessado);
    } catch (error) {
      setResultado({ erro: true, mensagem: error });
    } finally {
      setProcessando(false);
    }
  };

  const exemplosAgrupados: ExemplosAgrupados = todosExemplos.reduce(
    (acc, exemplo) => {
      const nivel = exemplo.nivel;
      if (!acc[nivel]) acc[nivel] = [];
      acc[nivel].push(exemplo);
      return acc;
    },
    {} as ExemplosAgrupados,
  );

  const getCorNivel = (nivel: string): string => {
    const cores: Record<string, string> = {
      Fácil: "bg-green-500",
      "Médio-Baixo": "bg-blue-500",
      Médio: "bg-yellow-500",
      "Médio-Alto": "bg-orange-500",
      Difícil: "bg-red-500",
      Extremo: "bg-purple-500",
      Borda: "bg-gray-500",
    };
    return cores[nivel] || "bg-gray-400";
  };

  // Type guard para verificar se é erro
  const isErro = (res: Resultado): res is ResultadoErro => {
    return res !== null && "erro" in res;
  };

  // Type guard para verificar se é resultado válido
  const isResultadoValido = (res: Resultado): res is ResultadoProcessado => {
    return res !== null && !("erro" in res);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Processador de OCR
          </h1>
          <p className="text-slate-600 text-lg">
            Transforme textos extraídos via OCR em dados estruturados e
            validados
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUNA 1: Seletor */}
          <SeletorTextoCard
            onCarregarExemplo={carregarExemplo}
            onUsarCustomizado={usarTextoCustomizado}
            exemploAtual={exemploAtual}
            modoAtual={modoAtual}
            exemplosAgrupados={exemplosAgrupados}
            getCorNivel={getCorNivel}
          />

          {/* COLUNA 2: Texto OCR */}
          <TextoOCRCard
            textoOCR={textoOCR}
            exemploAtual={exemploAtual}
            processando={processando}
            onProcessar={processar}
          />

          {/* COLUNA 3: Resultados */}
          <div className="space-y-4">
            {isResultadoValido(resultado) && (
              <>
                <ResultadoCard
                  resultado={resultado}
                  exemploAtual={exemploAtual}
                  modoAtual={modoAtual}
                  todosExemplos={todosExemplos}
                  getCorNivel={getCorNivel}
                />
                {resultado.dados.itens && (
                  <ItensCard itens={resultado.dados.itens} />
                )}
                <ConfiancaCard
                  confianca={resultado.confianca}
                  confiancaInicial={resultado.confiancaInicial}
                />
                <JsonCard resultado={resultado} />
              </>
            )}

            {isErro(resultado) && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="text-red-800 font-semibold mb-2">
                  Erro ao processar
                </h3>
                <p className="text-red-600 text-sm">
                  {resultado.mensagem instanceof Error
                    ? resultado.mensagem.message
                    : "Erro desconhecido"}
                </p>
              </div>
            )}

            {!resultado && !processando && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-12 rounded-lg text-center">
                <p className="text-slate-500">
                  Selecione um exemplo ou cole um texto para começar
                </p>
              </div>
            )}

            {processando && (
              <div className="bg-white border border-slate-200 p-12 rounded-lg text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
                <p className="text-slate-600">Processando...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
