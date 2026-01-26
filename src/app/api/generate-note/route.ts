import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { generateNote, NoteFormat } from "@/lib/ai/note-generator"
import { verificarAcessoRecurso } from "@/lib/planos-helper"
import { RecursoPremium } from "@/types/planos"

export async function POST(req: Request) {
  try {
    console.log("📝 Iniciando geração de anotação com IA...")

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

    // Verificar se o usuário tem acesso ao recurso de geração com IA
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

    const { content, formato } = await req.json()

    if (!content || !content.trim()) {
      console.log("❌ Conteúdo não fornecido")
      return NextResponse.json({ error: "Conteúdo é obrigatório" }, { status: 400 })
    }

    // Validar formato se fornecido
    const formatoValido: NoteFormat = formato === 'notion' ? 'notion' : 'padrao'

    console.log(`📝 Conteúdo recebido: ${content.length} caracteres (formato: ${formatoValido})`)

    console.log("🤖 Chamando Gemini AI...")

    // Gerar anotação usando IA
    const result = await generateNote({
      content,
      userName: user.name,
      formato: formatoValido,
    })

    console.log("✅ Anotação gerada com sucesso!")

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Erro ao gerar anotação:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno ao gerar anotação" },
      { status: 500 }
    )
  }
}
