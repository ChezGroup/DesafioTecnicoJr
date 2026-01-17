export interface ItemNota {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface DadosEstruturados {
  estabelecimento: string;
  cnpj?: string;
  data: string;
  hora?: string;
  itens?: ItemNota[];
  valorTotal: number;
  formaPagamento?: string;
}

export interface ResultadoProcessamento {
  dados: DadosEstruturados;
  confianca: {
    score: number;
    nivel: "Alta" | "Media" | "Baixa";
    detalhes: string[];
  };
}
