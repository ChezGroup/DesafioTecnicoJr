# Processador de OCR - Desafio Técnico

## 🚀 Deploy

🔗 [Ver aplicação em produção](https://seu-projeto.vercel.app)

---

## 📋 Sobre o Projeto

Sistema de processamento de textos extraídos via OCR (Optical Character Recognition) que transforma dados brutos e imperfeitos em informações estruturadas e validadas.

A aplicação processa cupons fiscais, notas e documentos digitalizados, lidando com:
- Erros de leitura do OCR
- Formatação inconsistente
- Dados incompletos ou ambíguos
- Caracteres especiais mal interpretados

---

## 🛠️ Tecnologias Utilizadas

### Core
- **[Next.js 15](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[React 19](https://react.dev/)** - Biblioteca de interface

### UI/UX
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes de interface
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização
- **[Lucide React](https://lucide.dev/)** - Ícones

### Validação e Processamento
- **[Zod](https://zod.dev/)** - Validação de schemas e tipos
- **[date-fns](https://date-fns.org/)** - Manipulação de datas

### IA
- **[Google Gemini API](https://ai.google.dev/)** - Correção inteligente de dados com baixa confiança

---

## 🎯 Decisões Técnicas Importantes

### 1. **Arquitetura Híbrida de Processamento**

Implementei uma abordagem em **duas camadas**:

#### **Camada 1 - Regex Pattern Matching** (`lib/ocr-processor.ts`)
- Processamento inicial usando expressões regulares
- Rápido e determinístico
- Gera um score de confiança baseado em:
  - Campos obrigatórios presentes
  - Validações de formato
  - Consistência de dados

#### **Camada 2 - IA para Correção** (acionada condicionalmente)
- **Trigger:** Apenas quando confiança < 0.7
- **Objetivo:** Corrigir erros de OCR (ex: `6.5O` → `6.50`, `ar oz` → `arroz`)
- **Vantagem:** Não desperdiça recursos da API em dados já confiáveis

**Por que essa abordagem?**
- ✅ Eficiência: 70%+ dos casos são resolvidos com regex (sem custo de API)
- ✅ Inteligência sob demanda: IA só atua quando realmente necessário
- ✅ Transparência: Interface mostra evolução "Regex → IA Fix → Final"

### 2. **Escolha do Google Gemini**

**Por que Gemini em vez de OpenAI/Anthropic?**
- ✅ **Gratuito:** Tier gratuito generoso para testes e desenvolvimento
- ✅ **Atualizado:** Modelo recente com boa performance em PT-BR
- ✅ **API simples:** Fácil integração com `@google/generative-ai`

**Trade-offs considerados:**
- ⚠️ Rate limits mais restritos que GPT-4
- ⚠️ Menor adoção enterprise (mas suficiente para o desafio)


**Critérios de confiança:**
- **Alta:** Todos os campos obrigatórios válidos, sem correções necessárias
- **Média:** Campos presentes, mas com normalização de OCR (ex: `O` → `0`)
- **Baixa:** Dados incompletos, valores aproximados ou muitas correções

### 4. **Componentização Modular**

Dividi a interface em 6 componentes independentes:
- `SeletorTextoCard`: Seleção de exemplos/texto customizado
- `TextoOCRCard`: Visualização do texto bruto
- `ResultadoCard`: Dados estruturados principais
- `ItensCard`: Lista de produtos/serviços
- `ConfiancaCard`: Análise de confiança com evolução
- `page.tsx`: Orquestração (~80 linhas vs ~600 originais)

**Benefícios:**
- Facilita testes unitários
- Reutilização de componentes
- Manutenção simplificada

### 5. **Validação com Zod**

Uso de schemas Zod para:
- Garantir tipos seguros em runtime
- Validação de CNPJ, datas, valores
- Transformação de dados (strings → números, normalização)

**Exemplo:**
```typescript
const ItemSchema = z.object({
  descricao: z.string().min(1),
  quantidade: z.number().positive(),
  valorUnitario: z.number().nonnegative(),
  valorTotal: z.number().nonnegative(),
});
```

---


## 🏃‍♂️ Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passo 1: Clonar o repositório
```bash
git clone https://github.com/seu-usuario/desafio-ocr.git
cd desafio-ocr
```

### Passo 2: Instalar dependências
```bash
npm install
# ou
yarn install
```

### Passo 3: Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
GOOGLE_API_KEY=sua_chave_api_aqui
```

**Como obter a chave da API:**
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API Key
3. Cole no arquivo `.env.local`

### Passo 4: Rodar o projeto
```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📂 Estrutura do Projeto

```
├── app/
│   ├── page.tsx                 # Página principal (orquestração)
│   └── layout.tsx               # Layout global
├── components/
│   ├── ui/                      # Componentes shadcn/ui
│   └── ocr/                     # Componentes específicos do OCR
│       ├── SeletorTextoCard.tsx
│       ├── TextoOCRCard.tsx
│       ├── ResultadoCard.tsx
│       ├── ItensCard.tsx
│       └── ConfiancaCard.tsx
├── lib/
│   ├── ocr-processor.ts         # Lógica de processamento (Regex)
│   ├── ia-processor.ts          # Correção com Gemini
│   └── utils.ts                 # Funções auxiliares
├── data/
│   └── sample-data.ts           # Exemplos de cupons (níveis de dificuldade)
└── .env.local                   # Variáveis de ambiente (não commitado)
```

---


## 📊 Exemplos Processados

A aplicação inclui exemplos pré-configurados com diferentes níveis de complexidade, simulando cupons e documentos reais com falhas de OCR.
---


## 📝 Licença

Este projeto foi desenvolvido como parte de um desafio técnico.

---

## 👤 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/ustavoteles)
- LinkedIn: [Seu Perfil](https://linkedin.com/in/ustavoteles)

---

