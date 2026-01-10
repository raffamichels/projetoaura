import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { generateReview } from "@/lib/ai/review-generator"
import { verificarAcessoRecurso } from "@/lib/planos-helper"
import { RecursoPremium } from "@/types/planos"

export async function POST(req: Request) {
  try {
    console.log("🎬 Iniciando geração de resenha...")

    const session = await auth()

    if (!session?.user?.email) {
      console.log("❌ Usuário não autenticado")
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      console.log("❌ Usuário não encontrado no banco")
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    console.log(`✅ Usuário autenticado: ${user.email}`)

    // Verificar se o usuário tem acesso ao recurso de geração de resenha
    const acessoRecurso = verificarAcessoRecurso(
      user.plano,
      user.planoExpiraEm,
      RecursoPremium.GERAR_RESENHA_IA
    )

    if (!acessoRecurso.temAcesso) {
      console.log(`❌ Usuário sem acesso ao recurso (Plano: ${acessoRecurso.planoEfetivo})`)
      return NextResponse.json(
        {
          error: acessoRecurso.motivo || "Recurso disponível apenas para usuários Premium",
          planoAtual: acessoRecurso.planoEfetivo,
          recursoNecessario: RecursoPremium.GERAR_RESENHA_IA
        },
        { status: 403 }
      )
    }

    console.log(`✅ Acesso ao recurso verificado (Plano: ${acessoRecurso.planoEfetivo})`)

    const { midiaId } = await req.json()

    if (!midiaId) {
      console.log("❌ ID da mídia não fornecido")
      return NextResponse.json({ error: "ID da mídia é obrigatório" }, { status: 400 })
    }

    console.log(`📚 Buscando mídia ID: ${midiaId}`)

    // Buscar a mídia com todas as citações
    const midia = await prisma.midia.findFirst({
      where: {
        id: midiaId,
        userId: user.id,
      },
      include: {
        citacoes: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!midia) {
      console.log("❌ Mídia não encontrada ou não pertence ao usuário")
      return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 })
    }

    console.log(`✅ Mídia encontrada: ${midia.titulo} (${midia.tipo})`)

    // Extrair conteúdo dos campos de reflexão e aprendizado
    const contentParts: string[] = []

    if (midia.impressoesIniciais) {
      contentParts.push(`**Impressões Iniciais:**\n${midia.impressoesIniciais}`)
    }

    if (midia.principaisAprendizados) {
      contentParts.push(`**Principais Aprendizados:**\n${midia.principaisAprendizados}`)
    }

    if (midia.trechosMemoraveis) {
      contentParts.push(`**Trechos Memoráveis:**\n${midia.trechosMemoraveis}`)
    }

    if (midia.reflexao) {
      contentParts.push(`**Reflexões:**\n${midia.reflexao}`)
    }

    if (midia.aprendizadosPraticos) {
      contentParts.push(`**Aprendizados Práticos:**\n${midia.aprendizadosPraticos}`)
    }

    if (midia.consideracoesFinais) {
      contentParts.push(`**Considerações Finais:**\n${midia.consideracoesFinais}`)
    }

    // Adicionar citações se houver
    if (midia.citacoes.length > 0) {
      const citacoesText = midia.citacoes
        .map((citacao) => {
          const pageInfo = citacao.pagina ? ` (pág. ${citacao.pagina})` : ""
          return `"${citacao.texto}"${pageInfo}`
        })
        .join("\n\n")

      contentParts.push(`**Citações que me marcaram:**\n${citacoesText}`)
    }

    const content = contentParts.join("\n\n")

    console.log(`📝 Conteúdo extraído: ${content.length} caracteres`)

    if (!content.trim()) {
      console.log("❌ Não há conteúdo suficiente")
      return NextResponse.json(
        { error: "Não há conteúdo suficiente para gerar uma resenha. Adicione suas impressões, aprendizados ou citações." },
        { status: 400 }
      )
    }

    console.log("🤖 Chamando Gemini AI...")

    // Gerar resenha usando IA
    const review = await generateReview({
      content,
      pageType: midia.tipo === "LIVRO" ? "BOOK" : "MOVIE",
      metadata: {
        title: midia.titulo,
        author: midia.autor || undefined,
        director: midia.diretor || undefined,
      },
      userName: user.name,
    })

    console.log("✅ Resenha gerada com sucesso!")

    return NextResponse.json({ review }, { status: 200 })
  } catch (error) {
    console.error("Erro ao gerar resenha:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno ao gerar resenha" },
      { status: 500 }
    )
  }
}
