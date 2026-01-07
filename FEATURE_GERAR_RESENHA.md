# Feature: Gerar Resenha com IA

## Objetivo
Implementar um botão "Gerar Resenha" nas páginas de livros e filmes da biblioteca que utilize IA generativa para criar uma resenha em primeira pessoa baseada em todos os tópicos/anotações da página.

## Arquitetura da Solução

### 1. Frontend - Botão e Interface

#### Localização do Botão
- Adicionar o botão na página de detalhes do livro/filme
- Posicionamento sugerido: próximo ao título ou na toolbar de ações
- Deve estar visível apenas para o proprietário da página

#### Componente do Botão
```tsx
// components/GenerateReviewButton.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"

interface GenerateReviewButtonProps {
  pageId: string
  pageType: "BOOK" | "MOVIE"
  onReviewGenerated: (review: string) => void
}

export function GenerateReviewButton({
  pageId,
  pageType,
  onReviewGenerated
}: GenerateReviewButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, pageType })
      })

      const data = await response.json()
      onReviewGenerated(data.review)
    } catch (error) {
      console.error("Erro ao gerar resenha:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      variant="outline"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando resenha...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar Resenha
        </>
      )}
    </Button>
  )
}
```

### 2. Backend - API Route

#### Endpoint de Geração
```typescript
// app/api/generate-review/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { generateReview } from "@/lib/ai/review-generator"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { pageId, pageType } = await req.json()

    // 1. Buscar a página e verificar permissões
    const page = await db.page.findUnique({
      where: { id: pageId },
      include: {
        blocks: {
          orderBy: { position: "asc" }
        },
        // Incluir metadados do livro/filme se necessário
        book: true,
        movie: true,
      }
    })

    if (!page || page.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // 2. Extrair conteúdo dos blocos/tópicos
    const content = extractContentFromBlocks(page.blocks)

    // 3. Gerar resenha usando IA
    const review = await generateReview({
      content,
      pageType,
      metadata: page.book || page.movie,
      userName: session.user.name
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error("Error generating review:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

function extractContentFromBlocks(blocks: any[]) {
  return blocks.map(block => {
    // Extrair texto baseado no tipo de bloco
    switch (block.type) {
      case "TEXT":
        return block.content.text || ""
      case "HEADING":
        return `## ${block.content.text || ""}`
      case "LIST":
        return block.content.items?.join("\n- ") || ""
      case "IMAGE":
        return `[Imagem: ${block.content.caption || "sem legenda"}]`
      default:
        return ""
    }
  }).filter(Boolean).join("\n\n")
}
```

### 3. Serviço de IA - Geração de Resenha

#### Opções de Provedores de IA

##### Opção 1: OpenAI GPT
```typescript
// lib/ai/review-generator.ts
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface GenerateReviewParams {
  content: string
  pageType: "BOOK" | "MOVIE"
  metadata?: any
  userName?: string
}

export async function generateReview({
  content,
  pageType,
  metadata,
  userName
}: GenerateReviewParams): Promise<string> {
  const itemType = pageType === "BOOK" ? "livro" : "filme"
  const itemTitle = metadata?.title || "esta obra"

  const prompt = `
Você é ${userName || "um leitor/espectador"} que acabou de ${pageType === "BOOK" ? "ler" : "assistir"} "${itemTitle}".

Com base nas suas anotações abaixo, escreva uma resenha pessoal em primeira pessoa, como se você estivesse compartilhando sua experiência e impressões sobre ${pageType === "BOOK" ? "o livro" : "o filme"}.

A resenha deve:
- Ser escrita em primeira pessoa ("eu achei", "me impressionou", "senti que")
- Ter entre 300-500 palavras
- Refletir suas impressões e sentimentos sobre a obra
- Mencionar elementos que você destacou nas suas anotações
- Ser autêntica e pessoal, como se você estivesse contando para um amigo

Suas anotações:
${content}

Escreva a resenha em português do Brasil, de forma natural e envolvente.
`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Você é um assistente que ajuda a escrever resenhas pessoais e autênticas sobre livros e filmes."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 1000
  })

  return completion.choices[0].message.content || ""
}
```

##### Opção 2: Anthropic Claude
```typescript
// lib/ai/review-generator.ts
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function generateReview({
  content,
  pageType,
  metadata,
  userName
}: GenerateReviewParams): Promise<string> {
  const itemType = pageType === "BOOK" ? "livro" : "filme"
  const itemTitle = metadata?.title || "esta obra"

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `
Você é ${userName || "um leitor/espectador"} que acabou de ${pageType === "BOOK" ? "ler" : "assistir"} "${itemTitle}".

Com base nas suas anotações abaixo, escreva uma resenha pessoal em primeira pessoa.

Anotações:
${content}

A resenha deve ser autêntica, pessoal (300-500 palavras) e em português do Brasil.
`
    }]
  })

  return message.content[0].type === "text" ? message.content[0].text : ""
}
```

##### Opção 3: Google Gemini (Gratuito)
```typescript
// lib/ai/review-generator.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateReview({
  content,
  pageType,
  metadata,
  userName
}: GenerateReviewParams): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const itemType = pageType === "BOOK" ? "livro" : "filme"
  const itemTitle = metadata?.title || "esta obra"

  const prompt = `
Você é ${userName || "um leitor/espectador"} que acabou de ${pageType === "BOOK" ? "ler" : "assistir"} "${itemTitle}".

Com base nas suas anotações abaixo, escreva uma resenha pessoal em primeira pessoa.

Anotações:
${content}

A resenha deve ser autêntica, pessoal (300-500 palavras) e em português do Brasil.
`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
```

### 4. Exibição da Resenha Gerada

#### Componente de Modal/Card
```tsx
// components/ReviewDisplay.tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, Save } from "lucide-react"

interface ReviewDisplayProps {
  review: string
  onSave?: (review: string) => void
  onClose: () => void
}

export function ReviewDisplay({
  review: initialReview,
  onSave,
  onClose
}: ReviewDisplayProps) {
  const [review, setReview] = useState(initialReview)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(review)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    onSave?.(review)
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Resenha Gerada</DialogTitle>
        </DialogHeader>

        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="min-h-[400px] font-serif text-base"
          placeholder="Sua resenha..."
        />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </>
            )}
          </Button>

          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### 5. Integração na Página do Livro/Filme

```tsx
// app/(protected)/library/[id]/page.tsx
"use client"

import { useState } from "react"
import { GenerateReviewButton } from "@/components/GenerateReviewButton"
import { ReviewDisplay } from "@/components/ReviewDisplay"

export default function BookPage({ params }: { params: { id: string } }) {
  const [generatedReview, setGeneratedReview] = useState<string | null>(null)

  const handleReviewGenerated = (review: string) => {
    setGeneratedReview(review)
  }

  const handleSaveReview = async (review: string) => {
    // Salvar a resenha no banco de dados
    // Pode ser em um campo específico ou como um novo bloco na página
    await fetch(`/api/pages/${params.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review })
    })
  }

  return (
    <div>
      {/* Conteúdo da página */}

      <GenerateReviewButton
        pageId={params.id}
        pageType="BOOK"
        onReviewGenerated={handleReviewGenerated}
      />

      {generatedReview && (
        <ReviewDisplay
          review={generatedReview}
          onSave={handleSaveReview}
          onClose={() => setGeneratedReview(null)}
        />
      )}
    </div>
  )
}
```

## Configuração

### 1. Variáveis de Ambiente

Adicione no arquivo [.env](.env):

```env
# Escolha uma das opções:

# Opção 1: OpenAI
OPENAI_API_KEY=sk-...

# Opção 2: Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# Opção 3: Google Gemini (recomendado para começar - gratuito)
GEMINI_API_KEY=...
```

### 2. Instalação de Dependências

```bash
# Para OpenAI
npm install openai

# Para Anthropic
npm install @anthropic-ai/sdk

# Para Google Gemini
npm install @google/generative-ai
```

### 3. Atualização do Schema do Banco (Opcional)

Se quiser salvar a resenha gerada:

```prisma
// prisma/schema.prisma
model Page {
  // ... campos existentes
  generatedReview String? @db.Text
  reviewGeneratedAt DateTime?
}
```

## Melhorias Futuras

### 1. Cache de Resenhas
- Evitar gerar múltiplas vezes para o mesmo conteúdo
- Salvar a última resenha gerada

### 2. Personalização
- Permitir escolher o tom da resenha (formal, casual, crítico)
- Ajustar o tamanho da resenha
- Escolher idioma

### 3. Histórico de Versões
- Manter versões anteriores de resenhas geradas
- Permitir comparação entre versões

### 4. Compartilhamento
- Exportar resenha para redes sociais
- Gerar formatos diferentes (Markdown, PDF)

### 5. Análise de Sentimento
- Mostrar métricas sobre a resenha (tom, pontos positivos/negativos)
- Sugestões de melhoria

## Custos Estimados

### OpenAI GPT-4
- ~$0.01 por resenha (500 palavras)

### Anthropic Claude
- ~$0.015 por resenha

### Google Gemini
- **Gratuito** até 15 requisições por minuto
- Recomendado para começar

## Considerações de Segurança

1. **Rate Limiting**: Limitar número de gerações por usuário/dia
2. **Validação**: Validar tamanho do conteúdo antes de enviar para IA
3. **Sanitização**: Sanitizar output da IA antes de exibir
4. **Permissões**: Verificar que usuário é dono da página

## Roadmap de Implementação

1. **Fase 1**: Botão básico + API route
2. **Fase 2**: Integração com IA (começar com Gemini gratuito)
3. **Fase 3**: Interface de exibição e edição
4. **Fase 4**: Salvamento no banco de dados
5. **Fase 5**: Melhorias e otimizações

## Recursos Adicionais

- [Documentação OpenAI](https://platform.openai.com/docs)
- [Documentação Anthropic](https://docs.anthropic.com)
- [Documentação Gemini](https://ai.google.dev/docs)
