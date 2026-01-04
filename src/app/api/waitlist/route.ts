import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const waitlistSchema = z.object({
  email: z.string().email("Email inválido"),
  nome: z.string().optional(),
  interesse: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = waitlistSchema.parse(body);

    // Verifica se o email já está na lista
    const existingEntry = await prisma.waitlist.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Este email já está cadastrado na lista de espera" },
        { status: 400 }
      );
    }

    // Adiciona à lista de espera
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email: validatedData.email,
        nome: validatedData.nome,
        interesse: validatedData.interesse,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email adicionado à lista de espera com sucesso!",
        data: waitlistEntry,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao adicionar à lista de espera:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Endpoint para listar todos os emails (protegido - apenas admin)
export async function GET(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação de admin aqui

    const waitlistEntries = await prisma.waitlist.findMany({
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.waitlist.count();

    return NextResponse.json({
      total,
      entries: waitlistEntries,
    });
  } catch (error) {
    console.error("Erro ao buscar lista de espera:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
