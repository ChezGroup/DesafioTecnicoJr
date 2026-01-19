"use client";

import { useState } from "react";
import { processarTextoOCR } from "@/lib/ocr-processor";
import { todosExemplos } from "@/data/sample-data";
import { SeletorTextoCard } from "@/components/ocr/SeletorTextoCard";
import { TextoOCRCard } from "@/components/ocr/TextoOCRCard";
import { ResultadoCard } from "@/components/ocr/ResultadoCard";
import { ItensCard } from "@/components/ocr/ItensCard";
import { ConfiancaCard } from "@/components/ocr/ConfiancaCard";

export default function Home() {
  const [textoOCR, setTextoOCR] = useState("");
  const [resultado, setResultado] = useState(null);
  const [exemploAtual, setExemploAtual] = useState("");
  const [processando, setProcessando] = useState(false);
  const [modoAtual, setModoAtual] = useState("exemplos");

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
      setResultado(res);
    } catch (error) {
      setResultado({ erro: true, mensagem: error });
    } finally {
      setProcessando(false);
    }
  };

  const exemplosAgrupados = todosExemplos.reduce((acc, exemplo) => {
    const nivel = exemplo.nivel;
    if (!acc[nivel]) acc[nivel] = [];
    acc[nivel].push(exemplo);
    return acc;
  }, {});

  const getCorNivel = (nivel: string) => {
    const cores = {
      Fácil: "bg-green-500",
      "Médio-Baixo": "bg-blue-500",
      Médio: "bg-yellow-500",
      "Médio-Alto": "bg-orange-500",
      Difícil: "bg-red-500",
      Extremo: "bg-purple-500",
    };
    return cores[nivel] || "bg-gray-400";
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
            {resultado && !resultado.erro && (
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
