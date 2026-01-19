import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface JsonCardProps {
  resultado: any; // ou use o tipo ResultadoProcessado
}

export function JsonCard({ resultado }: JsonCardProps) {
  const copiarJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(resultado, null, 2));
    // Você pode adicionar um toast/notificação aqui
    alert("JSON copiado para a área de transferência!");
  };

  return (
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
            onClick={copiarJSON}
          >
            📋 Copiar
          </Button>

          {/* JSON formatado */}
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
