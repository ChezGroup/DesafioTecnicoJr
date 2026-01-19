import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ItensCardProps {
  itens: Array<{
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
}

export function ItensCard({ itens }: ItensCardProps) {
  const calcularSomaItens = (itens: any[]): number => {
    return itens.reduce((acc, item) => acc + item.valorTotal, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Itens ({itens.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {itens.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-start p-2 bg-slate-50 rounded text-xs"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-800">{item.descricao}</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {item.quantidade}x R$ {item.valorUnitario.toFixed(2)}
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
            <span>R$ {calcularSomaItens(itens).toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
