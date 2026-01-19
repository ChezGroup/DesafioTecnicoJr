"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Sparkles,
} from "lucide-react";
import { ResultadoProcessamento } from "@/lib/types";

export default function OCRProcessor() {
  const [resultado, setResultado] = useState<ResultadoProcessamento | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const textoOCR = `*** MERC DO BAIRRO ***
CNPJ: 3322 1100 001 8
Da a: 19/01/26
ar oz t1     2k    1 ,80
fe jao pr    1k     8,9
ole so a     1un    7.2
to al        27,9
pg o d nh`;

  const handleProcessar = async () => {
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/processar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: textoOCR }),
      });

      if (!res.ok) throw new Error("Erro ao processar");

      const data = await res.json();
      setResultado(data);
    } catch (error) {
      setErro("Erro ao processar o texto. Tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadgeVariant = (nivel: string) => {
    if (nivel === "Alta") return "default";
    if (nivel === "Média") return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Processador de Notas Fiscais OCR
          </h1>
          <p className="text-slate-600">
            Transformando texto imperfeito em dados estruturados
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* ANTES - Texto Original */}
          <Card className="border-2 border-slate-200">
            <CardHeader className="bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-lg">
                  📄 ANTES - Texto OCR Original
                </CardTitle>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Texto extraído com erros de leitura óptica
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative">
                <pre className="bg-red-50 border-2 border-red-200 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm text-slate-800 leading-relaxed">
                  {textoOCR}
                </pre>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-red-600 border-red-300"
                  >
                    ⚠️ Palavras quebradas
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-red-600 border-red-300"
                  >
                    ⚠️ CNPJ malformado
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-red-600 border-red-300"
                  >
                    ⚠️ Espaços errados
                  </Badge>
                </div>
              </div>

              <Button
                onClick={handleProcessar}
                disabled={loading}
                className="w-full mt-6"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Processar e Corrigir
                  </>
                )}
              </Button>

              {erro && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{erro}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* DEPOIS - Dados Processados */}
          <Card
            className={`border-2 transition-all ${resultado ? "border-green-300 bg-green-50/30" : "border-slate-200 opacity-50"}`}
          >
            <CardHeader className={resultado ? "bg-green-50" : "bg-slate-50"}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">
                  ✨ DEPOIS - Dados Estruturados
                </CardTitle>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Dados corrigidos e validados
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {!resultado ? (
                <div className="text-center py-12 text-slate-400">
                  <ArrowRight className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Clique em "Processar" para ver os resultados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Indicador de Confiança */}
                  <div className="bg-white p-4 rounded-lg border-2 border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        Confiança da Extração
                      </span>
                      <Badge
                        variant={getConfidenceBadgeVariant(
                          resultado.confianca.nivel,
                        )}
                      >
                        {resultado.confianca.nivel} •{" "}
                        {(resultado.confianca.score * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <Progress
                      value={resultado.confianca.score * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Dados Principais */}
                  <div className="bg-white p-4 rounded-lg border-2 border-green-200 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Estabelecimento
                      </p>
                      <p className="font-semibold text-lg">
                        {resultado.dados.estabelecimento}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      {resultado.dados.cnpj && (
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            CNPJ
                          </p>
                          <p className="font-mono text-sm">
                            {resultado.dados.cnpj}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Data
                        </p>
                        <p className="font-mono text-sm">
                          {new Date(
                            resultado.dados.data + "T00:00:00",
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {resultado.dados.formaPagamento && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Pagamento
                          </p>
                          <p className="font-medium">
                            {resultado.dados.formaPagamento}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Itens */}
                  {resultado.dados.itens &&
                    resultado.dados.itens.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border-2 border-slate-200">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                          Itens Extraídos
                        </p>
                        <div className="space-y-2">
                          {resultado.dados.itens.map((item, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-start py-2 border-b last:border-0"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {item.descricao}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {item.quantidade} × R${" "}
                                  {item.valorUnitario.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-semibold text-sm">
                                R$ {item.valorTotal.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Total */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-lg text-white">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium opacity-90">
                        Valor Total
                      </p>
                      <p className="text-3xl font-bold">
                        R$ {resultado.dados.valorTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Análise Detalhada */}
        {resultado && (
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Análise de Confiança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="detalhes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="detalhes">
                    Detalhes da Análise
                  </TabsTrigger>
                  <TabsTrigger value="json">JSON Completo</TabsTrigger>
                </TabsList>

                <TabsContent value="detalhes" className="space-y-3 mt-4">
                  {resultado.confianca.detalhes.map((detalhe, i) => {
                    const isError =
                      detalhe.includes("⚠️") || detalhe.includes("🚨");
                    const isSuccess =
                      detalhe.includes("✅") || detalhe.includes("✨");

                    return (
                      <div
                        key={i}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          isError
                            ? "bg-red-50 border border-red-200"
                            : isSuccess
                              ? "bg-green-50 border border-green-200"
                              : "bg-slate-50 border border-slate-200"
                        }`}
                      >
                        <span className="text-lg mt-0.5">
                          {isError ? "⚠️" : isSuccess ? "✅" : "ℹ️"}
                        </span>
                        <p className="text-sm flex-1">{detalhe}</p>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="json" className="mt-4">
                  <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto text-xs font-mono">
                    {JSON.stringify(resultado, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
