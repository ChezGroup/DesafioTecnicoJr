import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface TextoOCRCardProps {
  textoOCR: string;
  exemploAtual: string;
  processando: boolean;
  onProcessar: () => void;
}

export function TextoOCRCard({
  textoOCR,
  exemploAtual,
  processando,
  onProcessar,
}: TextoOCRCardProps) {
  return (
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
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm h-[400px] overflow-auto whitespace-pre-wrap">
              {textoOCR}
            </div>

            <Button
              onClick={onProcessar}
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
  );
}
