# Documentação Técnica & Reflexões - Desafio OCR

Este documento serve como guia da solução implementada e responde aos questionamentos propostos no desafio técnico.

---

##  PARTE 1: Detalhamento da Implementação (O que foi feito)

### Arquitetura e Decisões Técnicas
Optei por uma arquitetura limpa usando **Next.js (App Router)** com **TypeScript**, focando na separação de responsabilidades (Separation of Concerns):

1.  **Interface "Burra" (`app/page.tsx`)**: A camada visual apenas exibe os dados. Ela não contém lógica de negócios, apenas gerencia estados de carregamento e seleção.
2.  **Motor de Processamento (`lib/ocr-processor.ts`)**: Criei uma *função pura* que centraliza toda a inteligência do projeto. Ela recebe o texto bruto e retorna um objeto JSON estruturado e validado.
3.  **Dados Mockados (`lib/ocr-examples.ts`)**: Mantive os dados de exemplo fixos para simular a API, conforme solicitado.

### Engenharia da Solução (Regex e Lógica)
Ao invés de usar IA (que seria uma "caixa preta"), desenvolvi um **algoritmo determinístico** baseado em Expressões Regulares. Isso me deu controle total sobre o output.

#### 1. Sanitização Contextual
Um dos maiores desafios foi o erro de OCR onde a letra 'O' é confundida com o número '0'.
* **Solução:** Implementei uma camada de sanitização que analisa o contexto. Se o caractere está dentro de um padrão numérico (preço ou quantidade), o código força a substituição de 'O' por '0' antes da conversão.

#### 2. Extração de Itens (Tabelas Desalinhadas)
Como o OCR perde a formatação de colunas, criei um varredor de linhas que busca por "assinaturas de produtos".
* **Lógica:** O código ignora cabeçalhos e busca linhas que terminam com padrões monetários (ex: `R$ 10,00` ou `10,00`). Ao encontrar, ele tenta extrair a descrição e quantidade usando grupos de captura de Regex.

#### 3. Algoritmo de Confiança (Confidence Score)
Para dar segurança ao usuário, criei um cálculo heurístico de confiança que começa em 100% e penaliza o documento baseando-se em falhas:
* **-30%**: Se o Valor Total não for encontrado.
* **-15%**: Se o CNPJ for inválido/ausente.
* **-5%**: Para cada correção ortográfica necessária.

---

##  PARTE 2: Respostas aos Questionamentos do Desafio

Abaixo respondo às perguntas específicas sobre limitações e futuro do projeto.

### 1. Onde esse código pode quebrar?
**Quais situações ou inputs podem causar falhas?**
Como a solução é baseada em padrões visuais (Regex), ela pode falhar se:
* **Layouts não convencionais:** Notas fiscais horizontais ou com tabelas lado a lado quebrariam a lógica de leitura linha-a-linha.
* **Ruído excessivo:** Se o OCR destruir palavras-chave âncora (como transformar "TOTAL" em "7_X4L"), o parser perde a referência.
* **Formatos exóticos:** Datas escritas por extenso ou moedas estrangeiras não estão mapeadas nas regras atuais.

### 2. O que você faria se o input piorasse?
**Como lidaria com dados ainda mais inconsistentes?**
Se os dados ficassem muito "sujos", Regex simples não bastaria. Minha estratégia seria:
* **Fuzzy Matching (Similaridade):** Usaria algoritmos como *Distância de Levenshtein* para encontrar palavras-chave (ex: "TOTAL") mesmo que escritas erradas ("T0TAL", "TOTL").
***Validação Cruzada Matemática:** Se o total estiver ilegível, somaria todos os valores numéricos soltos no texto para tentar deduzir qual combinação resulta em um valor lógico de fechamento.

### 3. O que você deixaria para uma próxima versão?
**Quais melhorias ou funcionalidades ficaram fora do escopo?**
Focando na entrega do MVP, priorizei a lógica central e deixei para a V2.0:
* **Upload Real:** Integração com APIs de OCR (Tesseract.js ou Google Vision) para processar imagens reais.
* **Testes Automatizados:** Implementação de testes unitários (Jest) para garantir que novas regras de Regex não quebrem leituras anteriores.
* **Validação Externa:** Validação real do CNPJ na API da Receita Federal.