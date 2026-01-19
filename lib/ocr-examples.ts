// OCR example texts ordered by difficulty level

export interface OCRExample {
  name: string
  difficulty: string
  description: string
  text: string
}

export const OCR_EXAMPLES: OCRExample[] = [
  {
    name: "Exemplo 1",
    difficulty: "Fácil",
    description: "Cupom fiscal de supermercado com estrutura clara",
    text: `SUPERMERCADO IDEAL LTDA
CNPJ: 23.456.789/0001-10

CUPOM FISCAL
15/01/2026  16:41

DESC              QT  VL UNIT   VL TOTAL
Leite Integral     2   4,79      9,58
Pao Forma          1   7,90      7,90

TOTAL R$ 17,48
Pagamento: Débito`,
  },
  {
    name: "Exemplo 2",
    difficulty: "Médio-Baixo",
    description: "Farmácia com estrutura quebrada e formatos mistos",
    text: `FARMACIA SAUDE MAIS
CNPJ 44.111.222/0001-33

Data:16-01-26 Hora:21.07

Dipirona sod 500mg
02 x 6.5O

Vitamina C
1x12,00

TOTAL=25.00
Pgto Cart`,
  },
  {
    name: "Exemplo 3",
    difficulty: "Médio",
    description: "Posto de gasolina com valor aproximado",
    text: `AUTO POSTO BR 101
CNPJ: 77.888.999/0001-66

17/01/26   09:18

Etanol Hid
Vol: 28,364 L
Preco/L: 3.79

Valor a pagar
R$ 107,50 aprox`,
  },
  {
    name: "Exemplo 4",
    difficulty: "Médio-Alto",
    description: "Bar com múltiplos valores e taxa de serviço",
    text: `BAR E LANCHES CENTRAL
CNPJ 10.999.888/0001-77

Mesa 07
18/01/26

02 X-TUDO     18,9
01 Cerveja    9,50
Tx serv 10%   4.65

Sub t  46,95
Dinheiro 30,00
Rest   16,95`,
  },
  {
    name: "Exemplo 5",
    difficulty: "Difícil",
    description: "OCR altamente degradado com palavras quebradas",
    text: `*** MERC DO BAIRRO ***
CNPJ: 3322 1100 001 8

Da a: 19/01/26

ar oz t1     2k    1 ,80
fe jao pr    1k     8,9
ole so a     1un    7.2

to al        27,9

pg o d nh`,
  },
]
