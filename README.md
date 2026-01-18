 Desafio Técnico — Desenvolvedor Júnior

## 📋 Sobre o Desafio

Bem-vindo ao desafio técnico para a vaga de **Desenvolvedor Júnior**!

Este exercício foi projetado para simular um cenário realista de desenvolvimento: **trabalhar com dados imperfeitos e transformá-los em algo estruturado, confiável e validado**.

Não existe uma resposta perfeita. O que importa são as **decisões técnicas** que você toma e como você as justifica.

---

## 🎯 Contexto do Problema

Imagine que você está trabalhando em um sistema que processa documentos digitalizados. O sistema recebe textos extraídos via **OCR (Optical Character Recognition)**, que nem sempre são perfeitos:

- Podem conter erros de leitura
- Formatação inconsistente
- Dados incompletos ou ambíguos
- Caracteres especiais mal interpretados

Seu desafio é criar uma pequena aplicação que receba esse texto bruto e o transforme em dados estruturados e validados, apresentando o resultado de forma clara para o usuário.

---

## 💻 O Desafio

### Parte 1 — Interface (Next.js + shadcn/ui)

Desenvolva uma tela simples construída em **Next.js** usando **[shadcn/ui](https://ui.shadcn.com/)** com os seguintes requisitos:

#### Requisitos da Interface:

1. **Exibir o texto bruto do OCR**
   - O texto **NÃO** deve ser digitado pelo usuário
   - Forneça o texto previamente (hardcoded ou carregado de um arquivo)
   - **Escolha UM dos exemplos abaixo** (ou use todos se quiser demonstrar versatilidade)
   
   Os exemplos estão ordenados por **nível de dificuldade crescente**:

   #### **Exemplo 1 — Nível Fácil (estrutura existe, mas não está mastigada)**
   ```
   SUPERMERCADO IDEAL LTDA
   CNPJ: 23.456.789/0001-10

   CUPOM FISCAL
   15/01/2026  16:41

   DESC              QT  VL UNIT   VL TOTAL
   Leite Integral     2   4,79      9,58
   Pao Forma          1   7,90      7,90

   TOTAL R$ 17,48
   Pagamento: Débito
   ```
   *Desafio: múltiplos valores por item, necessário escolher qual é o valor final relevante*

   #### **Exemplo 2 — Nível Médio-Baixo (estrutura quebrada + formatos mistos)**
   ```
   FARMACIA SAUDE MAIS
   CNPJ 44.111.222/0001-33

   Data:16-01-26 Hora:21.07

   Dipirona sod 500mg
   02 x 6.5O

   Vitamina C
   1x12,00

   TOTAL=25.00
   Pgto Cart
   ```
   *Desafio: `6.5O` (O no lugar de zero), multiplicação implícita, separadores inconsistentes*

   #### **Exemplo 3 — Nível Médio (semântica implícita + dados aproximados)**
   ```
   AUTO POSTO BR 101
   CNPJ: 77.888.999/0001-66

   17/01/26   09:18

   Etanol Hid
   Vol: 28,364 L
   Preco/L: 3.79

   Valor a pagar
   R$ 107,50 aprox
   ```
   *Desafio: valor aproximado, cálculo implícito de volume × preço, confiança reduzida*

   #### **Exemplo 4 — Nível Médio-Alto (múltiplos valores, taxa adicional)**
   ```
   BAR E LANCHES CENTRAL
   CNPJ 10.999.888/0001-77

   Mesa 07
   18/01/26

   02 X-TUDO     18,9
   01 Cerveja    9,50
   Tx serv 10%   4.65

   Sub t  46,95
   Dinheiro 30,00
   Rest   16,95
   ```
   *Desafio: subtotal vs total, troco/restante, taxa de serviço, precisa decidir qual valor armazenar*

   #### **Exemplo 5 — Nível Difícil (OCR altamente degradado)**
   ```
   *** MERC DO BAIRRO ***
   CNPJ: 3322 1100 001 8

   Da a: 19/01/26

   ar oz t1     2k    1 ,80
   fe jao pr    1k     8,9
   ole so a     1un    7.2

   to al        27,9

   pg o d nh
   ```
   *Desafio: palavras quebradas (ar oz = arroz, fe jao = feijão, ole so a = óleo soja), espaços aleatórios, CNPJ sem formatação correta*

2. **Botão para processar os dados**
   - Um botão claro com ação de "Processar" ou "Estruturar Dados"
   - Ao clicar, deve executar o processamento do texto

3. **Visualização do resultado estruturado**
   - Mostrar o JSON estruturado de forma legível
   - Exibir um indicador de confiança dos dados processados
   - Destacar campos que foram validados com sucesso ou que falharam

**Importante:** A interface não precisa ser bonita, mas precisa ser **legível, organizada e honesta** sobre o que está mostrando.

---

### Parte 2 — Processamento dos Dados

Implemente a lógica de processamento que deve:

#### 1. **Extrair campos relevantes do texto**
   
   Dependendo do exemplo escolhido, extraia campos como:
   - **Estabelecimento**: nome da empresa/estabelecimento
   - **CNPJ**: identificador fiscal (com ou sem formatação)
   - **Data e hora**: quando a transação ocorreu
   - **Valor total**: valor final da transação
   - **Itens**: produtos/serviços (quando aplicável)
     - Descrição
     - Quantidade
     - Valor unitário
     - Valor total
   - **Forma de pagamento**: débito, crédito, dinheiro, etc.
   - **Informações adicionais**: taxa de serviço, troco, observações, etc.
   
   **Importante:** Nem todos os exemplos terão todos os campos. Parte do desafio é decidir o que é essencial extrair.

#### 2. **Aplicar validações**
   
   Exemplos de validações que podem ser implementadas:
   - **Formato de data válido**: aceitar múltiplos formatos (DD/MM/YYYY, DD/MM/YY, DD-MM-YY)
   - **Valores numéricos positivos**: converter valores monetários para float
   - **Normalização de caracteres OCR**: correção de erros comuns (0 → O, O → 0, l → 1, etc.)
   - **CNPJ válido**: verificar formato e dígitos verificadores (quando aplicável)
   - **Reconstrução de palavras**: juntar palavras quebradas pelo OCR (ar oz → arroz)
   - **Campos obrigatórios**: identificar se estabelecimento, data e valor total estão presentes
   - **Consistência de valores**: verificar se soma dos itens confere com total (quando aplicável)
   - **Valores aproximados**: sinalizar quando o valor é aproximado ou calculado

#### 3. **Gerar o resultado**

   Seu processamento deve retornar:
   
   a) **Um objeto JSON estruturado** com os dados extraídos.
   
   Exemplo para o Exemplo 1 (Supermercado):
   ```json
   {
     "estabelecimento": "SUPERMERCADO IDEAL LTDA",
     "cnpj": "23.456.789/0001-10",
     "data": "2026-01-15",
     "hora": "16:41",
     "itens": [
       {
         "descricao": "Leite Integral",
         "quantidade": 2,
         "valorUnitario": 4.79,
         "valorTotal": 9.58
       },
       {
         "descricao": "Pão Forma",
         "quantidade": 1,
         "valorUnitario": 7.90,
         "valorTotal": 7.90
       }
     ],
     "valorTotal": 17.48,
     "formaPagamento": "Débito"
   }
   ```
   
   **Nota:** A estrutura do JSON pode variar dependendo do exemplo escolhido. O importante é que seja **coerente, legível e justificado**.

   b) **Um indicador de confiança**:
   - Pode ser um score numérico (0.0 a 1.0)
   - Ou categorias: "Alta", "Média", "Baixa"
   - Justifique sua escolha de como calcular essa confiança
   
   Exemplo de cálculo de confiança:
   - **Alta (0.8-1.0)**: Todos os campos obrigatórios presentes, formatos válidos, sem correções necessárias
   - **Média (0.5-0.79)**: Campos principais presentes, mas necessitou correções (ex: 6.5O → 6.50)
   - **Baixa (0.0-0.49)**: Muitas correções, campos faltando ou valor aproximado

**Nota sobre IA:** Não é obrigatório usar Inteligência Artificial neste desafio. Se você optar por usar, explique **por que** escolheu essa abordagem e **como** ela melhora a solução.

---

## ✅ Critérios de Avaliação

### O que **É** avaliado:

✅ **Clareza do raciocínio**
- Seu código é fácil de entender?
- As decisões técnicas estão claras?

✅ **Capacidade de lidar com erros**
- Como seu código se comporta com dados inválidos?
- Há tratamento de exceções?

✅ **Decisões explícitas**
- Por que você validou de determinada forma?
- Por que escolheu NÃO validar algo?
- Documente suas decisões (comentários ou README)

✅ **Leitura de código fácil**
- Nomenclatura clara de variáveis e funções
- Estrutura organizada
- Comentários nos pontos importantes

### O que **NÃO** é avaliado:

❌ Uso do framework mais moderno da moda  
❌ Arquitetura enterprise complexa  
❌ Performance extrema ou otimizações prematuras  
❌ Design visual elaborado  

---

## 🤔 Perguntas para Reflexão

Ao finalizar o desafio, responda as seguintes perguntas no **Pull Request** ou em um arquivo separado (`REFLEXOES.md`):

1. **Onde esse código pode quebrar?**
   - Quais situações ou inputs podem causar falhas?

2. **O que você faria se o input piorasse?**
   - Como lidaria com dados ainda mais inconsistentes?

3. **O que você deixaria para uma próxima versão?**
   - Quais melhorias ou funcionalidades ficaram fora do escopo?

---

## 📦 Instruções de Entrega

### Passo 1: Fork do Repositório

1. Faça um **fork** deste repositório para sua conta pessoal do GitHub
2. Clone o fork para sua máquina local
3. Crie uma branch para o desenvolvimento (ex: `feature/meu-nome`)

### Passo 2: Desenvolvimento

1. Desenvolva sua solução seguindo os requisitos acima
2. Commit suas alterações com mensagens claras e descritivas
3. Certifique-se de incluir um `README.md` com:
   - Instruções de como rodar o projeto localmente
   - Tecnologias utilizadas
   - Decisões técnicas importantes

### Passo 3: Deploy na Vercel

1. Crie uma conta gratuita na [Vercel](https://vercel.com) (se ainda não tiver)
2. Faça o deploy do seu projeto
3. Obtenha o link público do deploy

### Passo 4: Pull Request

1. Push sua branch para o seu fork
2. Abra um **Pull Request** deste repositório (ChezGroup/DesafioTecnicoJr) a partir do seu fork
3. No Pull Request, inclua:
   - **Link do deploy na Vercel**
   - Breve descrição da sua solução
   - Respostas para as perguntas de reflexão
   - Qualquer observação que julgar relevante

**Exemplo de descrição do PR:**
```markdown
## Deploy
🔗 https://meu-projeto.vercel.app

## Sobre a Solução
Implementei a solução usando Next.js 14 com shadcn/ui...

## Reflexões
### 1. Onde esse código pode quebrar?
...

### 2. O que você faria se o input piorasse?
...

### 3. O que você deixaria para uma próxima versão?
...
```

---

## 🛠️ Tecnologias Sugeridas

- **Framework:** Next.js (App Router ou Pages Router)
- **UI Components:** shadcn/ui
- **Linguagem:** TypeScript (recomendado) ou JavaScript
- **Estilização:** Tailwind CSS (já vem com shadcn/ui)

Você está livre para adicionar outras bibliotecas que julgar necessárias, mas lembre-se: **simplicidade é valorizada**.

---

## ⏱️ Tempo Estimado

Este desafio foi projetado para ser concluído em **4 a 8 horas** de trabalho.

Não há prazo rígido, mas recomendamos não gastar mais que isso. Lembre-se: não precisamos de uma solução perfeita, queremos ver **como você pensa e resolve problemas**.

---

## 📞 Dúvidas?

Se tiver dúvidas sobre o desafio, abra uma **Issue** neste repositório ou entre em contato conosco.

---

## 🎓 Recursos Úteis

- [Documentação Next.js](https://nextjs.org/docs)
- [shadcn/ui Documentação](https://ui.shadcn.com/)
- [Vercel Deployment](https://vercel.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Boa sorte! Estamos ansiosos para ver sua solução! 🚀**