import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  overview?: string;
}

interface CapaSugestao {
  id: string;
  titulo: string;
  capa: string;
  autor?: string;
  editora?: string;
  ano?: number;
  descricao?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const tipo = searchParams.get('tipo'); // 'livro' ou 'filme'

    if (!query || !tipo) {
      return NextResponse.json(
        { error: 'Parâmetros "q" (query) e "tipo" são obrigatórios' },
        { status: 400 }
      );
    }

    if (tipo === 'livro') {
      return await buscarCapasLivros(query);
    } else if (tipo === 'filme') {
      return await buscarCapasFilmes(query);
    } else {
      return NextResponse.json(
        { error: 'Tipo inválido. Use "livro" ou "filme"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erro ao buscar capas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar capas' },
      { status: 500 }
    );
  }
}

async function buscarCapasLivros(query: string): Promise<NextResponse> {
  try {
    // Google Books API não requer chave para buscas básicas
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&printType=books`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar na Google Books API');
    }

    const data = await response.json();

    const sugestoes: CapaSugestao[] = (data.items || [])
      .filter((item: GoogleBooksVolume) => item.volumeInfo?.imageLinks?.thumbnail)
      .map((item: GoogleBooksVolume) => ({
        id: item.id,
        titulo: item.volumeInfo.title,
        capa: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        autor: item.volumeInfo.authors?.[0],
        editora: item.volumeInfo.publisher,
      }));

    return NextResponse.json({ sugestoes });
  } catch (error) {
    console.error('Erro ao buscar capas de livros:', error);
    return NextResponse.json({ sugestoes: [] });
  }
}

async function buscarCapasFilmes(query: string): Promise<NextResponse> {
  try {
    // TMDB API requer chave - usuário precisa configurar
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      // Retorna lista vazia se não houver API key
      console.warn('TMDB_API_KEY não configurada. Configure no arquivo .env para habilitar busca de capas de filmes.');
      return NextResponse.json({
        sugestoes: [],
        aviso: 'Busca de capas de filmes requer configuração da API do TMDB. Adicione TMDB_API_KEY no arquivo .env'
      });
    }

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar na TMDB API');
    }

    const data = await response.json();

    const sugestoes: CapaSugestao[] = (data.results || [])
      .filter((movie: TMDBMovie) => movie.poster_path)
      .slice(0, 6)
      .map((movie: TMDBMovie) => ({
        id: movie.id.toString(),
        titulo: movie.title,
        capa: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        ano: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
        descricao: movie.overview,
      }));

    return NextResponse.json({ sugestoes });
  } catch (error) {
    console.error('Erro ao buscar capas de filmes:', error);
    return NextResponse.json({ sugestoes: [] });
  }
}
