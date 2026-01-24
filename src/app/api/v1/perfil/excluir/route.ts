import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { motivo } = body;

    const userId = session.user.id;

    // Excluir todos os dados do usuário em ordem para respeitar as foreign keys
    // Usando transação para garantir atomicidade
    await prisma.$transaction(async (tx) => {
      // 1. Registros de hábitos
      await tx.registroHabito.deleteMany({
        where: { userId },
      });

      // 2. Hábitos
      await tx.habito.deleteMany({
        where: { userId },
      });

      // 3. Documentos de viagem
      await tx.documentoViagem.deleteMany({
        where: { userId },
      });

      // 4. Despesas de viagem (via viagem)
      const viagens = await tx.viagem.findMany({
        where: { userId },
        select: { id: true },
      });
      const viagemIds = viagens.map((v) => v.id);

      if (viagemIds.length > 0) {
        await tx.despesaViagem.deleteMany({
          where: { viagemId: { in: viagemIds } },
        });

        await tx.atividadeViagem.deleteMany({
          where: { viagemId: { in: viagemIds } },
        });

        await tx.hospedagemViagem.deleteMany({
          where: { viagemId: { in: viagemIds } },
        });

        await tx.transporteViagem.deleteMany({
          where: { viagemId: { in: viagemIds } },
        });

        // Destinos e locais salvos
        const destinos = await tx.destinoViagem.findMany({
          where: { viagemId: { in: viagemIds } },
          select: { id: true },
        });
        const destinoIds = destinos.map((d) => d.id);

        if (destinoIds.length > 0) {
          await tx.localSalvo.deleteMany({
            where: { destinoId: { in: destinoIds } },
          });
        }

        await tx.destinoViagem.deleteMany({
          where: { viagemId: { in: viagemIds } },
        });
      }

      // 5. Viagens
      await tx.viagem.deleteMany({
        where: { userId },
      });

      // 6. Citações
      await tx.citacao.deleteMany({
        where: { userId },
      });

      // 7. Mídias
      await tx.midia.deleteMany({
        where: { userId },
      });

      // 8. Anotações
      await tx.anotacao.deleteMany({
        where: { userId },
      });

      // 9. Páginas (via módulos via cursos)
      const cursos = await tx.curso.findMany({
        where: { userId },
        select: { id: true },
      });
      const cursoIds = cursos.map((c) => c.id);

      if (cursoIds.length > 0) {
        const modulos = await tx.modulo.findMany({
          where: { cursoId: { in: cursoIds } },
          select: { id: true },
        });
        const moduloIds = modulos.map((m) => m.id);

        if (moduloIds.length > 0) {
          await tx.pagina.deleteMany({
            where: { moduloId: { in: moduloIds } },
          });
        }

        await tx.modulo.deleteMany({
          where: { cursoId: { in: cursoIds } },
        });
      }

      // 10. Cursos
      await tx.curso.deleteMany({
        where: { userId },
      });

      // 11. Transações
      await tx.transacao.deleteMany({
        where: { userId },
      });

      // 12. Objetivos financeiros
      await tx.objetivoFinanceiro.deleteMany({
        where: { userId },
      });

      // 13. Categorias
      await tx.categoria.deleteMany({
        where: { userId },
      });

      // 14. Cartões
      await tx.cartao.deleteMany({
        where: { userId },
      });

      // 15. Contas bancárias
      await tx.contaBancaria.deleteMany({
        where: { userId },
      });

      // 16. Atividades
      await tx.atividade.deleteMany({
        where: { userId },
      });

      // 17. Compromissos
      await tx.compromisso.deleteMany({
        where: { userId },
      });

      // 18. Finalmente, excluir o usuário
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // Log do motivo (opcional - para analytics)
    console.log(`Conta excluída - Motivo: ${motivo || 'Não informado'}`);

    return NextResponse.json({
      success: true,
      message: 'Conta excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir conta. Tente novamente.' },
      { status: 500 }
    );
  }
}
