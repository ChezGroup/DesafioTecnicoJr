"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { processOCRText, type ProcessedResult } from "@/lib/ocr-processor"
import { OCR_EXAMPLES } from "@/lib/ocr-examples"
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react"

export default function PaginaProcessadorOCR() {
  const [exemploSelecionado, setExemploSelecionado] = useState(0)
  const [resultado, setResultado] = useState<ProcessedResult | null>(null)
  const [estaProcessando, setEstaProcessando] = useState(false)

  const exemploAtual = OCR_EXAMPLES[exemploSelecionado]

  const handleProcessar = () => {
    setEstaProcessando(true)
    setTimeout(() => {
      const processado = processOCRText(exemploAtual.text)
      setResultado(processado)
      setEstaProcessando(false)
    }, 800)
  }

  const obterCorConfianca = (confianca: number) => {
    if (confianca >= 0.8) return "text-emerald-500"
    if (confianca >= 0.5) return "text-amber-500"
    return "text-red-500"
  }

  const obterRotuloConfianca = (confianca: number) => {
    if (confianca >= 0.8) return "Alta"
    if (confianca >= 0.5) return "Média"
    return "Baixa"
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Cabeçalho */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Processador de Texto OCR</h1>
          </div>
          <p className="text-muted-foreground text-pretty max-w-2xl">
            Sistema de processamento de documentos digitalizados que transforma textos extraídos via OCR em dados
            estruturados e validados.
          </p>
        </div>

        {/* Seletor de Exemplos */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione um Exemplo</CardTitle>
            <CardDescription>Escolha um dos exemplos ordenados por nível de dificuldade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {OCR_EXAMPLES.map((exemplo, indice) => (
                <Button
                  key={indice}
                  variant={exemploSelecionado === indice ? "default" : "outline"}
                  onClick={() => {
                    setExemploSelecionado(indice)
                    setResultado(null)
                  }}
                  className="h-auto flex-col items-start gap-1 p-4"
                >
             
                  <span className="font-semibold">{exemplo.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {exemplo.difficulty}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Texto Bruto do OCR */}
          <Card>
            <CardHeader>
              <CardTitle>Texto Bruto do OCR</CardTitle>
              <CardDescription>{exemploAtual.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="rounded-lg bg-muted p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-words">
                {exemploAtual.text}
              </pre>
              <Button onClick={handleProcessar} className="w-full" disabled={estaProcessando}>
                {estaProcessando ? "Processando..." : "Processar Dados"}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado Processado */}
          <Card>
            <CardHeader>
              <CardTitle>Resultado Estruturado</CardTitle>
              <CardDescription>Dados extraídos e validados do texto OCR</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!resultado ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed">
                  <p className="text-sm text-muted-foreground">Clique em "Processar Dados" para ver o resultado</p>
                </div>
              ) : (
                <>
                  {/* Pontuação de Confiança */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Confiança dos Dados:</span>
                      <span className={`font-bold ${obterCorConfianca(resultado.confidence)}`}>
                        {obterRotuloConfianca(resultado.confidence)} ({(resultado.confidence * 100).toFixed(0)}%)
                      </span>
                    </AlertDescription>
                  </Alert>

                  {/* Resultados da Validação */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Status de Validação:</h4>
                    <div className="space-y-1">
                      {resultado.validations.map((validacao, indice) => (
                        <div key={indice} className="flex items-start gap-2 text-sm rounded-lg bg-muted p-2">
                          {validacao.success ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          )}
                          <span className="flex-1">{validacao.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Saída JSON */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Dados Estruturados (JSON):</h4>
                    <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto max-h-[400px] overflow-y-auto">
                      {JSON.stringify(resultado.data, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}