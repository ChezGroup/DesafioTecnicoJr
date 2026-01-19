import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, AlertCircle } from "lucide-react";

interface ResultadoCardProps {
  resultado: any; // Tipo ResultadoProcessado
  exemploAtual: string;
  modoAtual: "exemplos" | "custom";
  todosExemplos: any[];
  getCorNivel: (nivel: string) => string;
}

export function ResultadoCard({
  resultado,
  exemploAtual,
  modoAtual,
  todosExemplos,
  getCorNivel,
}: ResultadoCardProps) {
  const formatarData = (dataISO: string): string => {
    if (dataISO === "Data não identificada") return dataISO;
    try {
      return new Date(dataISO + "T00:00:00").toLocaleDateString("pt-BR");
    } catch {
      return dataISO;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Dados Estruturados</span>
          {modoAtual === "exemplos" && (
            <Badge
              variant="outline"
              className={`${getCorNivel(todosExemplos.find((e) => e.nome === exemploAtual)?.nivel || "")} text-white text-xs`}
            >
              {todosExemplos.find((e) => e.nome === exemploAtual)?.nivel}
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
            {resultado.dados.estabelecimento}
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-600">CNPJ</label>
            <p className="text-slate-800 mt-0.5">
              {resultado.dados.cnpj || (
                <span className="text-slate-400 italic">N/A</span>
              )}
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-600">Data</label>
            <p className="text-slate-800 mt-0.5">
              {resultado.dados.data !== "Data não identificada" ? (
                formatarData(resultado.dados.data)
              ) : (
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
            {resultado.dados.valorTotal > 0 ? (
              `R$ ${resultado.dados.valorTotal.toFixed(2)}`
            ) : (
              <span className="text-slate-400 text-base italic">N/A</span>
            )}
          </p>
        </div>

        {resultado.dados.valorAproximado && (
          <>
            <Separator />
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <strong>Valor Aproximado:</strong> O cupom indica que o valor
                pode não ser exato.
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
