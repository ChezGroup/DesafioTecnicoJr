"use client";

import { JSX, useState } from "react";
import { processarTextoOCR } from "@/lib/ocr-processor";
import { todosExemplos } from "@/data/sample-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  FileText,
  Pencil,
} from "lucide-react";

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
}

interface ResultadoErro {
  erro: true;
  mensagem: Error;
}

export default function Home() {
  // ============================================
  // ESTADOS
  // ============================================

  const [textoOCR, setTextoOCR] = useState<string>("");
  const [textoCustomizado, setTextoCustomizado] = useState<string>("");
  const [resultado, setResultado] = useState<
    ResultadoProcessado | ResultadoErro | null
  >(null);
  const [exemploAtual, setExemploAtual] = useState<string>("");
  const [processando, setProcessando] = useState(false);
  const [modoAtual, setModoAtual] = useState<"exemplos" | "custom">("exemplos");

  // ============================================
  // FUNÇÕES
  // ============================================

  /**
   * Carrega o exemplo selecionado
   */
  const carregarExemplo = (texto: string, nome: string) => {
    setTextoOCR(texto);
    setExemploAtual(nome);
    setResultado(null);
    setModoAtual("exemplos");
  };

  /**
   * Usa o texto customizado
   */
  const usarTextoCustomizado = () => {
    setTextoOCR(textoCustomizado);
    setExemploAtual("Texto Customizado");
    setResultado(null);
    setModoAtual("custom");
  };

  /**
   * Limpa o texto customizado
   */
  const limparTextoCustomizado = () => {
    setTextoCustomizado("");
    setTextoOCR("");
    setResultado(null);
  };

  /**
   * Processa o texto OCR
   */
  const processar = () => {
    if (!textoOCR.trim()) return;

    setProcessando(true);

    setTimeout(async () => {
      try {
        const res = await processarTextoOCR(textoOCR);
        setResultado(res as ResultadoProcessado);
        console.log(`✅ Processado:`, res);
      } catch (error) {
        console.error(`❌ Erro:`, error);
        setResultado({ erro: true, mensagem: error as Error });
      } finally {
        setProcessando(false);
      }
    }, 300);
  };

  const exemplosAgrupados = todosExemplos.reduce(
    (acc, exemplo) => {
      const nivel = exemplo.nivel;
      if (!acc[nivel]) acc[nivel] = [];
      acc[nivel].push(exemplo);
      return acc;
    },
    {} as Record<string, typeof todosExemplos>,
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

  const getIconeConfianca = (nivel: string) => {
    const icones: Record<string, JSX.Element> = {
      Alta: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      Média: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      Baixa: <XCircle className="w-5 h-5 text-red-600" />,
    };
    return icones[nivel] || <Info className="w-5 h-5 text-gray-600" />;
  };

  const formatarData = (dataISO: string): string => {
    if (dataISO === "Data não identificada") return dataISO;
    try {
      return new Date(dataISO + "T00:00:00").toLocaleDateString("pt-BR");
    } catch {
      return dataISO;
    }
  };

  const calcularSomaItens = (itens: any[]): number => {
    return itens.reduce((acc, item) => acc + item.valorTotal, 0);
  };

  const resultadoValido =
    resultado && !("erro" in resultado) ? resultado : null;
  const resultadoErro = resultado && "erro" in resultado ? resultado : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
        {/* CABEÇALHO */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Processador de OCR
          </h1>
          <p className="text-slate-600 text-lg">
            Transforme textos extraídos via OCR em dados estruturados e
            validados
          </p>
        </header>

        {/* GRID 3 COLUNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ==========================================
              COLUNA 1: Seleção (Tabs: Exemplos ou Custom)
          =========================================== */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selecionar Texto OCR</CardTitle>
                <CardDescription className="text-sm">
                  Escolha um exemplo ou cole seu próprio texto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="exemplos" className="w-full">
                  {/* Abas */}
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="exemplos" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      Exemplos
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="text-xs">
                      <Pencil className="w-3 h-3 mr-1" />
                      Customizado
                    </TabsTrigger>
                  </TabsList>

                  {/* Conteúdo: Exemplos */}
                  <TabsContent
                    value="exemplos"
                    className="space-y-4 max-h-[520px] overflow-y-auto"
                  >
                    {Object.entries(exemplosAgrupados).map(
                      ([nivel, exemplos]) => (
                        <div key={nivel}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={`${getCorNivel(nivel)} text-white text-xs`}
                            >
                              {nivel}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {exemplos.length}
                            </span>
                          </div>

                          <div className="space-y-1 mb-3">
                            {exemplos.map((exemplo, idx) => (
                              <Button
                                key={`${nivel}-${idx}`}
                                variant={
                                  exemploAtual === exemplo.nome &&
                                  modoAtual === "exemplos"
                                    ? "default"
                                    : "ghost"
                                }
                                size="sm"
                                className="w-full justify-start text-left h-auto py-2"
                                onClick={() =>
                                  carregarExemplo(exemplo.texto, exemplo.nome)
                                }
                              >
                                <span className="text-xs truncate">
                                  {exemplo.nome.replace(` (${nivel})`, "")}
                                </span>
                              </Button>
                            ))}
                          </div>
                          <Separator />
                        </div>
                      ),
                    )}
                  </TabsContent>

                  {/* Conteúdo: Customizado */}
                  <TabsContent value="custom" className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Cole seu texto OCR aqui:
                      </label>
                      <Textarea
                        placeholder="Cole o texto extraído do OCR...

Exemplo:
SUPERMERCADO XYZ
CNPJ: 12.345.678/0001-99
Data: 20/01/2026
...
"
                        value={textoCustomizado}
                        onChange={(e) => setTextoCustomizado(e.target.value)}
                        className="min-h-[300px] font-mono text-xs"
                      />
                    </div>

                    {/* Estatísticas do texto customizado */}
                    {textoCustomizado && (
                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                        <div className="bg-slate-100 p-2 rounded text-center">
                          <div className="font-semibold text-slate-800">
                            {
                              textoCustomizado.split("\n").filter(Boolean)
                                .length
                            }
                          </div>
                          <div>linhas</div>
                        </div>
                        <div className="bg-slate-100 p-2 rounded text-center">
                          <div className="font-semibold text-slate-800">
                            {
                              textoCustomizado.split(/\s+/).filter(Boolean)
                                .length
                            }
                          </div>
                          <div>palavras</div>
                        </div>
                        <div className="bg-slate-100 p-2 rounded text-center">
                          <div className="font-semibold text-slate-800">
                            {textoCustomizado.length}
                          </div>
                          <div>chars</div>
                        </div>
                      </div>
                    )}

                    {/* Botões */}
                    <div className="flex gap-2">
                      <Button
                        onClick={usarTextoCustomizado}
                        disabled={!textoCustomizado.trim()}
                        className="flex-1"
                        size="sm"
                      >
                        Usar Texto
                      </Button>
                      <Button
                        onClick={limparTextoCustomizado}
                        variant="outline"
                        size="sm"
                      >
                        Limpar
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* ==========================================
              COLUNA 2: Texto OCR Bruto + Botão
          =========================================== */}
          <div className="space-y-6">
            {/* Card: Texto Bruto do OCR */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-5 h-5" />
                  Texto Bruto do OCR
                </CardTitle>
                <CardDescription className="text-sm">
                  {exemploAtual || "Nenhum texto carregado"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {textoOCR ? (
                  <div className="space-y-4">
                    {/* Área de visualização */}
                    <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm h-[400px] overflow-auto whitespace-pre-wrap">
                      {textoOCR}
                    </div>

                    {/* Botão de processar */}
                    <Button
                      onClick={processar}
                      disabled={processando}
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                    >
                      {processando ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processando...
                        </>
                      ) : (
                        "🔄 Processar Dados"
                      )}
                    </Button>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                      <div className="bg-slate-100 p-2 rounded text-center">
                        <div className="font-semibold text-slate-800">
                          {textoOCR.split("\n").filter(Boolean).length}
                        </div>
                        <div>linhas</div>
                      </div>
                      <div className="bg-slate-100 p-2 rounded text-center">
                        <div className="font-semibold text-slate-800">
                          {textoOCR.split(/\s+/).filter(Boolean).length}
                        </div>
                        <div>palavras</div>
                      </div>
                      <div className="bg-slate-100 p-2 rounded text-center">
                        <div className="font-semibold text-slate-800">
                          {textoOCR.length}
                        </div>
                        <div>caracteres</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm mb-2">Nenhum texto carregado</p>
                    <p className="text-xs text-slate-500">
                      Selecione um exemplo ou cole seu próprio texto
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card: Instruções */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm text-blue-900 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Como Funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-blue-800 space-y-1.5">
                <p>
                  <strong>1.</strong> Escolha um exemplo ou cole texto
                  customizado
                </p>
                <p>
                  <strong>2.</strong> Visualize o texto bruto no centro
                </p>
                <p>
                  <strong>3.</strong> Clique em "Processar Dados"
                </p>
                <p>
                  <strong>4.</strong> Veja o resultado estruturado à direita
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ==========================================
              COLUNA 3: Resultados Estruturados
          =========================================== */}
          <div className="space-y-6">
            {/* ESTADO: Processando */}
            {processando && (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Processando...</p>
                </CardContent>
              </Card>
            )}

            {/* ESTADO: Resultado Válido */}
            {!processando && resultadoValido && (
              <div className="space-y-4">
                {/* Card: Informações Principais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Dados Estruturados</span>
                      {modoAtual === "exemplos" && (
                        <Badge
                          variant="outline"
                          className={`${getCorNivel(todosExemplos.find((e) => e.nome === exemploAtual)?.nivel || "")} text-white text-xs`}
                        >
                          {
                            todosExemplos.find((e) => e.nome === exemploAtual)
                              ?.nivel
                          }
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Estabelecimento
                      </label>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">
                        {resultadoValido.dados.estabelecimento}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-600">
                          CNPJ
                        </label>
                        <p className="text-slate-800 mt-0.5">
                          {resultadoValido.dados.cnpj || (
                            <span className="text-slate-400 italic">N/A</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-600">
                          Data
                        </label>
                        <p className="text-slate-800 mt-0.5">
                          {resultadoValido.dados.data !==
                          "Data não identificada" ? (
                            formatarData(resultadoValido.dados.data)
                          ) : (
                            <span className="text-slate-400 italic">N/A</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-600">
                          Hora
                        </label>
                        <p className="text-slate-800 mt-0.5">
                          {resultadoValido.dados.hora || (
                            <span className="text-slate-400 italic">N/A</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-600">
                          Pagamento
                        </label>
                        <p className="text-slate-800 mt-0.5">
                          {resultadoValido.dados.formaPagamento || (
                            <span className="text-slate-400 italic">N/A</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-green-50 p-3 rounded-lg">
                      <label className="text-xs font-semibold text-green-700">
                        Valor Total
                      </label>
                      <p className="text-2xl font-bold text-green-600 mt-0.5">
                        {resultadoValido.dados.valorTotal > 0 ? (
                          `R$ ${resultadoValido.dados.valorTotal.toFixed(2)}`
                        ) : (
                          <span className="text-slate-400 text-base italic">
                            N/A
                          </span>
                        )}
                      </p>
                    </div>
                    {/* Observações (se existirem) */}
                    {resultadoValido.dados.observacoes && (
                      <>
                        <Separator />
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Informações Adicionais
                          </label>
                          <p className="text-xs text-blue-900 mt-1">
                            {resultadoValido.dados.observacoes}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Subtotal (se existir e for diferente do total) */}
                    {resultadoValido.dados.subtotal &&
                      resultadoValido.dados.subtotal !==
                        resultadoValido.dados.valorTotal && (
                        <>
                          <Separator />
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="font-semibold text-slate-600">
                                Subtotal
                              </label>
                              <p className="text-slate-800 mt-0.5">
                                R$ {resultadoValido.dados.subtotal.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <label className="font-semibold text-slate-600">
                                Com Taxas
                              </label>
                              <p className="text-slate-800 mt-0.5">
                                R$ {resultadoValido.dados.valorTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                    {/* Alerta se valor aproximado */}
                    {resultadoValido.dados.valorAproximado && (
                      <>
                        <Separator />
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-yellow-800">
                            <strong>Valor Aproximado:</strong> O cupom indica
                            que o valor pode não ser exato.
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Card: Itens */}
                {resultadoValido.dados.itens &&
                  resultadoValido.dados.itens.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Itens ({resultadoValido.dados.itens.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {resultadoValido.dados.itens.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-start p-2 bg-slate-50 rounded text-xs"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-slate-800">
                                  {item.descricao}
                                </p>
                                <p className="text-slate-500 text-xs mt-0.5">
                                  {item.quantidade}x R${" "}
                                  {item.valorUnitario.toFixed(2)}
                                </p>
                              </div>
                              <div className="text-right font-semibold text-slate-800">
                                R$ {item.valorTotal.toFixed(2)}
                              </div>
                            </div>
                          ))}

                          <Separator />
                          <div className="flex justify-between items-center font-semibold bg-slate-100 p-2 rounded text-xs">
                            <span>Soma:</span>
                            <span>
                              R${" "}
                              {calcularSomaItens(
                                resultadoValido.dados.itens,
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Card: Confiança */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getIconeConfianca(resultadoValido.confianca.nivel)}
                      Confiança: {resultadoValido.confianca.nivel}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Badge de Confiança - SEM PORCENTAGEM */}
                    <div className="flex items-center justify-center p-4">
                      <Badge
                        className={`text-lg px-6 py-2 ${
                          resultadoValido.confianca.nivel === "Alta"
                            ? "bg-green-500"
                            : resultadoValido.confianca.nivel === "Média"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        } text-white`}
                      >
                        {resultadoValido.confianca.nivel}
                      </Badge>
                    </div>

                    {/* Detalhes */}
                    {resultadoValido.confianca.detalhes.length > 0 && (
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                          Detalhes da Análise
                        </label>
                        <ul className="space-y-1.5 max-h-[150px] overflow-y-auto">
                          {resultadoValido.confianca.detalhes.map(
                            (detalhe, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-1.5 text-xs text-slate-700 bg-slate-50 p-1.5 rounded"
                              >
                                <span className="text-slate-400">•</span>
                                <span>{detalhe}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-2 border-slate-300">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Dados Estruturados (JSON)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Objeto retornado pelo processador
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Botão de copiar */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 z-10"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            JSON.stringify(resultadoValido, null, 2),
                          );
                          alert("JSON copiado!");
                        }}
                      >
                        📋 Copiar
                      </Button>

                      {/* JSON */}
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
                        {JSON.stringify(resultadoValido, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ESTADO: Sem Resultado */}
            {!processando && !resultado && (
              <Card className="border-2 border-dashed">
                <CardContent className="py-12 text-center">
                  <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium text-sm mb-1">
                    Aguardando processamento
                  </p>
                  <p className="text-slate-500 text-xs">
                    Carregue um texto e clique em "Processar Dados"
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ESTADO: Erro */}
            {!processando && resultadoErro && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Erro ao Processar
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs">
                  <p className="text-red-600">
                    {resultadoErro.mensagem?.message || "Erro desconhecido"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* RODAPÉ */}
        <footer className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>Desafio Técnico - Desenvolvedor Júnior</p>
          <p className="mt-1">
            Processador de OCR com <strong>Zod</strong> +{" "}
            <strong>date-fns</strong> + <strong>Next.js</strong>
          </p>
        </footer>
      </div>
    </div>
  );
}
