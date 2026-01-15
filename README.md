# Desafio Técnico — Desenvolvedor Frontend Júnior

## 📋 Sobre o Desafio

Bem-vindo ao desafio técnico para a vaga de **Desenvolvedor Frontend Júnior**!

Este exercício foi projetado para simular um cenário realista de desenvolvimento: **trabalhar com dados imperfeitos e transformá-los em algo estruturado, confiável e validado**.

Não existe uma resposta perfeita. O que importa são as **decisões técnicas** que você toma e como você as justifica.

---

## 🎯 Contexto do Problema

Imagine que você está trabalhando em um sistema que processa documentos digitalizados. O sistema recebe textos extraídos via **OCR (Optical Character Recognition)** ou respostas de uma **IA**, que nem sempre são perfeitos:

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
   - Exemplo de texto OCR que você pode usar:
     ```
     NOTA FISCAL
     N0M3: João Silva
     VAL0R: R$ 1.234,56
     DATA: 15/01/2024
     ID: #NF-2024-001
     OBS: Pagamento à vista
     ```

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
   - Nome
   - Valor monetário
   - Data
   - Identificador (ID)
   - Outros campos que você julgar importantes

#### 2. **Aplicar validações**
   
   Exemplos de validações que podem ser implementadas:
   - Formato de data válido (DD/MM/YYYY)
   - Valor numérico positivo
   - Campos obrigatórios presentes
   - Formato de ID consistente
   - Normalização de texto (correção de caracteres comuns: 0 → O, 3 → E, etc.)

#### 3. **Gerar o resultado**

   Seu processamento deve retornar:
   
   a) **Um objeto JSON estruturado** com os dados extraídos:
   ```json
   {
     "nome": "João Silva",
     "valor": 1234.56,
     "data": "2024-01-15",
     "id": "NF-2024-001",
     "observacoes": "Pagamento à vista"
   }
   ```

   b) **Um indicador de confiança**:
   - Pode ser um score numérico (0.0 a 1.0)
   - Ou categorias: "Alta", "Média", "Baixa"
   - Justifique sua escolha de como calcular essa confiança

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