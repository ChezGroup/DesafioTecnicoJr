// data/sample-data.ts

// ============================================
// NÍVEL 1 - FÁCIL (Estrutura Clara)
// ============================================

export const exemploSupermercado = `
SUPERMERCADO IDEAL LTDA
CNPJ: 23.456.789/0001-10

CUPOM FISCAL
15/01/2026  16:41

DESC              QT  VL UNIT   VL TOTAL
Leite Integral     2   4,79      9,58
Pao Forma          1   7,90      7,90

TOTAL R$ 17,48
Pagamento: Débito
`;

export const exemploRestaurante = `
RESTAURANTE BOM SABOR
CNPJ: 12.345.678/0001-99

Mesa 15
18/01/2026 14:30

Prato Feito        1   25,00     25,00
Refrigerante       2    5,00     10,00
Sobremesa          1    8,00      8,00

TOTAL: R$ 43,00
Forma: Dinheiro
`;

// ============================================
// NÍVEL 2 - MÉDIO-BAIXO (Formatação Inconsistente)
// ============================================

export const exemploFarmacia = `
FARMACIA SAUDE MAIS
CNPJ 44.111.222/0001-33

Data:16-01-26 Hora:21.07

Dipirona sod 500mg
02 x 6.50

Vitamina C
1x12,00

TOTAL=25.00
Pgto Cart
`;

export const exemploPadaria = `
PADARIA DOCE PÃO
CNPJ: 55 666 777/0001-88

17/01/26

Pao Frances 10un   3,50
Cafe com leite     4.50
Bolo fatia         6,00

Total 14,00
PIX
`;

// ============================================
// NÍVEL 3 - MÉDIO (Erros de OCR Leves)
// ============================================

export const exemploPostoGasolina = `
AUTO POSTO BR 101
CNPJ: 77.888.999/0001-66

17/01/26   09:18

Etanol Hid
Vol: 28,364 L
Preco/L: 3.79

Valor a pagar
R$ 107,50 aprox
`;

export const exemploLivraria = `
LIVRARIA SABER LTDA
CNPJ 88.999.000/OOO1-44

Data: 18-O1-2026
Horario: 1O:45

Livro Python       1x   45,9O
Revista Tech       2x    9,5O

Total R$ 64,90
Cartao Credito
`;

// ============================================
// NÍVEL 4 - MÉDIO-ALTO (Múltiplos Problemas)
// ============================================

export const exemploBar = `
BAR E LANCHES CENTRAL
CNPJ 10.999.888/0001-77

Mesa 07
18/01/26

02 X-TUDO     18,90
01 Cerveja     9,50
Tx serv 10%    2,84

Sub t  31,24
Dinheiro 50,00
Troco    18,76
`;

export const exemploConveniencia = `
LOJA CONVENIENCIA 24H
CNPJ: 22 333 444/0001 55

19/O1/2O26  23.47

Agua mineral 5OOml
3 uni x 2,5O        7,5O

Chocolate
2x 4,OO              8,OO

Cigarro
1 x 12,00          12,OO

TOTAL= 27,50
Debito
`;

// ============================================
// NÍVEL 5 - DIFÍCIL (OCR Muito Degradado)
// ============================================

export const exemploMercadinho = `
*** MERC DO BAIRRO ***
CNPJ: 3322 1100 001 88

Da a: 19/01/26

ar oz t1     2k    11,80
fe jao pr    1k     8,90
ole so a     1un    7,20

to al        27,90

pg o d nh
`;

export const exemploTicketEstacionamento = `
ESTACI0NAMENT0 CENTER
CNPJ 99 888 777/OOO1 11

Entrada: 2O/O1/26 O8:3O
Saida:   2O/O1/26 12:15

Tempo: 3h 45min
Valor/h: R$ 8,OO

T0TAL: R$ 3O,OO
Cartao Deb
`;

// ============================================
// CASOS EXTREMOS (Testes de Robustez)
// ============================================

export const exemploSemCNPJ = `
LANCHONETE DA PRACA

20/01/2026  15:20

Hamburguer         15,00
Batata Frita        8,00
Suco                6,00

TOTAL: R$ 29,00
Dinheiro
`;

export const exemploSemItens = `
CLINICA MEDICA SAUDE
CNPJ: 11.222.333/0001-44

Consulta Medica
Data: 20/01/2026
Hora: 10:00

VALOR: R$ 200,00
Pagamento: Cartao Credito
`;

export const exemploFormatoEstranho = `
╔════════════════════════╗
║  CAFETERIA MODERNA     ║
║  CNPJ: 66.777.888/0001-99 ║
╚════════════════════════╝

*** NOTA FISCAL ***

Data/Hora: 21/01/2026 16:00

─────────────────────────
Item                  Valor
─────────────────────────
Cappuccino            12,00
Croissant              8,50
─────────────────────────

TOTAL................20,50
Forma: PIX
`;

export const exemploValoresEstranhos = `
FARMACIA POPULAR
CNPJ: 44.555.666/0001-77

22/01/2026

Remedio A    R$ 12,345
Remedio B    R$  7,8
Remedio C    R$ 15

Desconto     -R$ 5,00

TOTAL FINAL: R$ 30,15
Dinheiro
`;

export const exemploDatasVariadas = `
LOJA ELETRONICOS
CNPJ: 33.444.555/0001-22

Emissão: 23-jan-2026
Horário: 18h30

Mouse Gamer           89,90
Teclado Mecânico     245,00

TOTAL.........334,90
Crédito 3x
`;

// ============================================
// CASOS DE BORDA (Edge Cases)
// ============================================

export const exemploTextoVazio = ``;

export const exemploSomenteNumeros = `
123.456.789/0001-10
25/01/2026
100,00
`;

export const exemploSomenteTexto = `
ESTABELECIMENTO QUALQUER
Algum texto aleatório
Sem estrutura definida
Apenas palavras soltas
`;

export const exemploMuitoGrande = `
SUPERMERCADO MEGA ATACADO LTDA
CNPJ: 11.222.333/0001-44

CUPOM FISCAL ELETRÔNICO
Data: 26/01/2026  Hora: 19:45
Operador: João Silva - Caixa 03

════════════════════════════════
ITEM  DESCRIÇÃO           VALOR
════════════════════════════════
001   Arroz 5kg           25,90
002   Feijão 1kg           8,50
003   Óleo Soja 900ml      7,20
004   Açúcar 1kg           4,30
005   Café 500g           12,80
006   Leite Integral       4,79
007   Pão Forma            7,90
008   Manteiga 200g        9,50
009   Queijo kg           45,90
010   Presunto kg         38,50
011   Tomate kg            6,80
012   Banana kg            5,20
013   Maçã kg              8,90
014   Detergente           2,30
015   Sabão em Pó         12,50
════════════════════════════════

SUBTOTAL............... 201,79
DESCONTO 5%............  10,09
════════════════════════════════
TOTAL R$............... 191,70

Forma: Cartão Débito
Bandeira: Visa

Obrigado pela preferência!
Volte sempre!
`;

// ============================================
// ARRAY COM TODOS OS EXEMPLOS
// ============================================

export const todosExemplos = [
  { nome: "Supermercado (Fácil)", texto: exemploSupermercado, nivel: "Fácil" },
  { nome: "Restaurante (Fácil)", texto: exemploRestaurante, nivel: "Fácil" },
  {
    nome: "Farmácia (Médio-Baixo)",
    texto: exemploFarmacia,
    nivel: "Médio-Baixo",
  },
  {
    nome: "Padaria (Médio-Baixo)",
    texto: exemploPadaria,
    nivel: "Médio-Baixo",
  },
  {
    nome: "Posto Gasolina (Médio)",
    texto: exemploPostoGasolina,
    nivel: "Médio",
  },
  { nome: "Livraria (Médio)", texto: exemploLivraria, nivel: "Médio" },
  { nome: "Bar (Médio-Alto)", texto: exemploBar, nivel: "Médio-Alto" },
  {
    nome: "Conveniência (Médio-Alto)",
    texto: exemploConveniencia,
    nivel: "Médio-Alto",
  },
  { nome: "Mercadinho (Difícil)", texto: exemploMercadinho, nivel: "Difícil" },
  {
    nome: "Estacionamento (Difícil)",
    texto: exemploTicketEstacionamento,
    nivel: "Difícil",
  },
  { nome: "Sem CNPJ (Extremo)", texto: exemploSemCNPJ, nivel: "Extremo" },
  { nome: "Sem Itens (Extremo)", texto: exemploSemItens, nivel: "Extremo" },
  {
    nome: "Formato Estranho (Extremo)",
    texto: exemploFormatoEstranho,
    nivel: "Extremo",
  },
  {
    nome: "Valores Decimais (Borda)",
    texto: exemploValoresEstranhos,
    nivel: "Borda",
  },
  {
    nome: "Datas Variadas (Borda)",
    texto: exemploDatasVariadas,
    nivel: "Borda",
  },
  { nome: "Muito Grande (Borda)", texto: exemploMuitoGrande, nivel: "Borda" },
];

// ============================================
// RESULTADOS ESPERADOS (Para Validação)
// ============================================

export const resultadosEsperados = {
  exemploSupermercado: {
    estabelecimento: "SUPERMERCADO IDEAL LTDA",
    cnpj: "23.456.789/0001-10",
    data: "2026-01-15",
    valorTotal: 17.48,
    confiancaMinima: 0.8,
  },
  exemploRestaurante: {
    estabelecimento: "RESTAURANTE BOM SABOR",
    cnpj: "12.345.678/0001-99",
    data: "2026-01-18",
    valorTotal: 43.0,
    confiancaMinima: 0.8,
  },
  exemploFarmacia: {
    estabelecimento: "FARMACIA SAUDE MAIS",
    cnpj: "44.111.222/0001-33",
    data: "2026-01-16",
    valorTotal: 25.0,
    confiancaMinima: 0.7,
  },
  exemploMercadinho: {
    estabelecimento: "*** MERC DO BAIRRO ***",
    data: "2026-01-19",
    valorTotal: 27.9,
    confiancaMinima: 0.3, // Baixa devido aos erros de OCR
  },
};
