import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
} from "lucide-react";
import { ReactElement } from "react";

interface ConfiancaCardProps {
  confianca: {
    score: number;
    nivel: "Alta" | "Média" | "Baixa";
    detalhes: string[];
  };
  confiancaInicial?: {
    score: number;
    nivel: "Alta" | "Média" | "Baixa";
    detalhes: string[];
  };
}

export function ConfiancaCard({
  confianca,
  confiancaInicial,
}: ConfiancaCardProps) {
  const getIconeConfianca = (nivel: string) => {
    const icones: Record<string, ReactElement> = {
      Alta: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      Média: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      Baixa: <XCircle className="w-5 h-5 text-red-600" />,
    };
    return icones[nivel] || <Info className="w-5 h-5 text-gray-600" />;
  };

  const getCorBadge = (nivel: string) => {
    const cores: Record<string, string> = {
      Alta: "bg-green-500",
      Média: "bg-yellow-500",
      Baixa: "bg-red-500",
    };
    return cores[nivel] || "bg-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          {getIconeConfianca(confianca.nivel)}
          Análise de Confiança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Se HOUVE correção por IA */}
        {confiancaInicial ? (
          <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-2 text-center">
              Evolução do Processamento
            </p>
            <div className="flex items-center justify-between px-2">
              {/* ANTES (Regex) */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-400 mb-1">Regex</span>
                <Badge
                  variant="outline"
                  className={`${getCorBadge(confiancaInicial.nivel)} text-white border-transparent`}
                >
                  {confiancaInicial.nivel}
                </Badge>
                <span className="text-[10px] text-slate-400 mt-1">
                  {(confiancaInicial.score * 100).toFixed(0)}%
                </span>
              </div>

              {/* Seta com IA Fix */}
              <div className="flex flex-col items-center text-blue-500">
                <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                  IA Fix
                </span>
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* DEPOIS (Final) */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-400 mb-1">Final</span>
                <Badge
                  className={`${getCorBadge(confianca.nivel)} text-white shadow-sm`}
                >
                  {confianca.nivel}
                </Badge>
                <span className="text-[10px] text-slate-400 mt-1">
                  {(confianca.score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Se NÃO houve IA (processamento direto) */
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-3 text-center">
              Resultado do Processamento
            </p>
            <div className="flex flex-col items-center">
              <Badge
                className={`text-lg px-8 py-2 ${getCorBadge(confianca.nivel)} text-white shadow-lg`}
              >
                {confianca.nivel}
              </Badge>
              <div className="mt-3 text-center">
                <span className="text-2xl font-bold text-slate-700">
                  {(confianca.score * 100).toFixed(0)}%
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Score de Confiança
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Detalhes da Análise */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
            Detalhes da Análise
          </label>
          <ul className="space-y-1.5 max-h-[150px] overflow-y-auto">
            {/* Erros corrigidos pela IA (se houver) */}
            {confiancaInicial?.detalhes.map((detalhe, idx) => (
              <li
                key={`antigo-${idx}`}
                className="flex items-start gap-1.5 text-xs text-slate-400 line-through decoration-slate-400 bg-slate-50 p-1.5 rounded opacity-70"
              >
                <span className="text-slate-300">•</span>
                <span>{detalhe} (Corrigido)</span>
              </li>
            ))}

            {/* Detalhes atuais */}
            {confianca.detalhes.map((detalhe, idx) => (
              <li
                key={idx}
                className="flex items-start gap-1.5 text-xs text-slate-700 bg-blue-50/50 p-1.5 rounded"
              >
                <span className="text-blue-400">•</span>
                <span>{detalhe}</span>
              </li>
            ))}

            {/* Caso não haja detalhes */}
            {confianca.detalhes.length === 0 && !confiancaInicial && (
              <li className="text-xs text-slate-500 italic text-center py-2 bg-green-50 rounded">
                ✓ Todos os campos foram extraídos com sucesso
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
