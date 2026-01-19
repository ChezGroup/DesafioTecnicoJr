import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Pencil } from "lucide-react";

interface SeletorTextoCardProps {
  onCarregarExemplo: (texto: string, nome: string) => void;
  onUsarCustomizado: (texto: string) => void;
  exemploAtual: string;
  modoAtual: "exemplos" | "custom";
  exemplosAgrupados: Record<string, any[]>;
  getCorNivel: (nivel: string) => string;
}

export function SeletorTextoCard({
  onCarregarExemplo,
  onUsarCustomizado,
  exemploAtual,
  modoAtual,
  exemplosAgrupados,
  getCorNivel,
}: SeletorTextoCardProps) {
  const [textoCustomizado, setTextoCustomizado] = useState("");

  const usarTexto = () => {
    onUsarCustomizado(textoCustomizado);
  };

  const limpar = () => {
    setTextoCustomizado("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Selecionar Texto OCR</CardTitle>
        <CardDescription className="text-sm">
          Escolha um exemplo ou cole seu próprio texto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="exemplos" className="w-full">
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

          {/* Exemplos */}
          <TabsContent
            value="exemplos"
            className="space-y-4 max-h-[520px] overflow-y-auto"
          >
            {Object.entries(exemplosAgrupados).map(([nivel, exemplos]) => (
              <div key={nivel}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getCorNivel(nivel)} text-white text-xs`}>
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
                        onCarregarExemplo(exemplo.texto, exemplo.nome)
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
            ))}
          </TabsContent>

          {/* Customizado */}
          <TabsContent value="custom" className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Cole seu texto OCR aqui:
              </label>
              <Textarea
                placeholder="Cole o texto extraído do OCR..."
                value={textoCustomizado}
                onChange={(e) => setTextoCustomizado(e.target.value)}
                className="min-h-[300px] font-mono text-xs"
              />
            </div>

            {textoCustomizado && (
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                <div className="bg-slate-100 p-2 rounded text-center">
                  <div className="font-semibold text-slate-800">
                    {textoCustomizado.split("\n").filter(Boolean).length}
                  </div>
                  <div>linhas</div>
                </div>
                <div className="bg-slate-100 p-2 rounded text-center">
                  <div className="font-semibold text-slate-800">
                    {textoCustomizado.split(/\s+/).filter(Boolean).length}
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

            <div className="flex gap-2">
              <Button
                onClick={usarTexto}
                disabled={!textoCustomizado.trim()}
                className="flex-1"
                size="sm"
              >
                Usar Texto
              </Button>
              <Button onClick={limpar} variant="outline" size="sm">
                Limpar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
