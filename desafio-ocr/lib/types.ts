import { z } from "zod";

export const ItemNotaSchema = z.object({
  descricao: z.string().min(1, "Descrição não pode ser vazia"),
  quantidade: z.number().positive("Quantidade deve ser positiva"),
  valorUnitario: z.number().positive("Valor unitário deve ser positivo"),
  valorTotal: z.number().positive("Valor total deve ser positivo"),
});

export const DadosEstruturadosSchema = z.object({
  estabelecimento: z.string().min(1, "Estabelecimento é obrigatório"),
  cnpj: z
    .string()
    .regex(
      /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      "CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX"
    )
    .optional(), // optional = pode não existir
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  hora: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Hora deve estar no formato HH:MM")
    .optional(),
  itens: z.array(ItemNotaSchema).optional(),
  valorTotal: z.number().positive("Valor total deve ser positivo"),
  formaPagamento: z.string().optional(),
});

export const ConfiancaSchema = z.object({
  score: z.number().min(0).max(1), // de 0.0 a 1.0
  nivel: z.enum(["Alta", "Média", "Baixa"]),
  detalhes: z.array(z.string()),
});

export const ResultadoProcessamentoSchema = z.object({
  dados: DadosEstruturadosSchema,
  confianca: ConfiancaSchema,
});

export type ItemNota = z.infer<typeof ItemNotaSchema>;
export type DadosEstruturados = z.infer<typeof DadosEstruturadosSchema>;
export type Confianca = z.infer<typeof ConfiancaSchema>;
export type ResultadoProcessamento = z.infer<
  typeof ResultadoProcessamentoSchema
>;
