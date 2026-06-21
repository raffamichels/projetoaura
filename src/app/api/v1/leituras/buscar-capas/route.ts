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
    publishedDate?: string;
    categories?: string[];
    language?: string;
  };
}

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  publisher?: string[];
  first_publish_year?: number;
  language?: string[];
  subject?: string[];
}

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  overview?: string;
  original_language?: string;
}

interface TMDBMovieDetails {
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
  original_language?: string;
  credits?: {
    crew?: Array<{ job: string; name: string }>;
  };
}

interface CapaSugestao {
  id: string;
  titulo: string;
  capa: string;
  autor?: string;
  editora?: string;
  diretor?: string;
  duracao?: number;
  ano?: number;
  genero?: string;
  idioma?: string;
  descricao?: string;
}

const IDIOMAS: Record<string, string> = {
  pt: 'Português',
  en: 'Inglês',
  es: 'Espanhol',
  fr: 'Francês',
  de: 'Alemão',
  it: 'Italiano',
  ja: 'Japonês',
  ko: 'Coreano',
  zh: 'Chinês',
  ru: 'Russo',
};

const GENEROS_FILME_TMDB: Record<number, string> = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Policial',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  27: 'Terror',
  10402: 'Musical',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção Científica',
  53: 'Suspense',
  10752: 'Guerra',
  37: 'Western',
};

function normalizarIdioma(codigo?: string): string | undefined {
  if (!codigo) return undefined;
  const idiomaBase = codigo.toLowerCase().split(/[-_]/)[0];
  return IDIOMAS[idiomaBase] || codigo.toUpperCase();
}

function normalizarGeneroLivro(categorias?: string[]): string | undefined {
  if (!categorias?.length) return undefined;

  const texto = categorias.join(' ').toLowerCase();
  const correspondencias: Array<[string[], string]> = [
    [['science fiction'], 'Ficção Científica'],
    [['young adult'], 'Jovem Adulto'],
    [['self-help', 'self help'], 'Autoajuda'],
    [['personal development'], 'Desenvolvimento Pessoal'],
    [['biography'], 'Biografia'],
    [['autobiography'], 'Autobiografia'],
    [['business'], 'Negócios'],
    [['technology', 'computers'], 'Tecnologia'],
    [['philosophy'], 'Filosofia'],
    [['history'], 'História'],
    [['poetry'], 'Poesia'],
    [['religion'], 'Religião'],
    [['horror'], 'Terror'],
    [['thriller', 'suspense'], 'Suspense'],
    [['mystery', 'detective'], 'Policial'],
    [['fantasy'], 'Fantasia'],
    [['romance'], 'Romance'],
    [['adventure'], 'Aventura'],
    [['humor', 'comics'], 'Humor'],
    [['juvenile', 'children'], 'Infantil'],
    [['drama'], 'Drama'],
    [['science'], 'Ciência'],
    [['fiction'], 'Ficção'],
  ];

  return correspondencias.find(([termos]) => termos.some((termo) => texto.includes(termo)))?.[1];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const tipo = searchParams.get('tipo');

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

async function buscarCapasGoogleBooks(query: string): Promise<CapaSugestao[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) return [];

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&printType=books&key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return [];

    const data = await response.json();

    return (data.items || [])
      .filter((item: GoogleBooksVolume) => item.volumeInfo?.imageLinks?.thumbnail)
      .slice(0, 6)
      .map((item: GoogleBooksVolume) => ({
        id: item.id,
        titulo: item.volumeInfo.title,
        capa: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        autor: item.volumeInfo.authors?.[0],
        editora: item.volumeInfo.publisher,
        ano: item.volumeInfo.publishedDate ? parseInt(item.volumeInfo.publishedDate) : undefined,
        genero: normalizarGeneroLivro(item.volumeInfo.categories),
        idioma: normalizarIdioma(item.volumeInfo.language),
      }));
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

async function buscarCapasOpenLibrary(query: string): Promise<CapaSugestao[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6&fields=key,title,author_name,cover_i,publisher,first_publish_year,language,subject`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AuraApp/1.0 (contato@aura.app)',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return [];

    const data = await response.json();

    return (data.docs || [])
      .filter((doc: OpenLibraryDoc) => doc.cover_i)
      .slice(0, 6)
      .map((doc: OpenLibraryDoc) => ({
        id: doc.key,
        titulo: doc.title,
        capa: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
        autor: doc.author_name?.[0],
        editora: doc.publisher?.[0],
        ano: doc.first_publish_year,
        genero: normalizarGeneroLivro(doc.subject),
        idioma: normalizarIdioma(doc.language?.[0]),
      }));
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

async function buscarCapasLivros(query: string): Promise<NextResponse> {
  // 1. Try Google Books first (most reliable, requires API key)
  const googleResults = await buscarCapasGoogleBooks(query);
  if (googleResults.length > 0) {
    return NextResponse.json({ sugestoes: googleResults });
  }

  // 2. Fallback to Open Library
  const openLibResults = await buscarCapasOpenLibrary(query);
  if (openLibResults.length > 0) {
    return NextResponse.json({ sugestoes: openLibResults });
  }

  // 3. No results from either source
  return NextResponse.json({ sugestoes: [] });
}

async function buscarCapasFilmes(query: string): Promise<NextResponse> {
  try {
    // TMDB API requer chave - usuário precisa configurar
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ sugestoes: [] });
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

    const filmes: TMDBMovie[] = (data.results || [])
      .filter((movie: TMDBMovie) => movie.poster_path)
      .slice(0, 6);

    const sugestoes: CapaSugestao[] = await Promise.all(filmes.map(async (movie) => {
      let detalhes: TMDBMovieDetails | undefined;

      try {
        const detalhesResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=pt-BR&append_to_response=credits`,
          { headers: { 'Accept': 'application/json' } }
        );

        if (detalhesResponse.ok) {
          detalhes = await detalhesResponse.json();
        }
      } catch {
        // A sugestão básica continua disponível caso os detalhes falhem.
      }

      return {
        id: movie.id.toString(),
        titulo: movie.title,
        capa: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        ano: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
        diretor: detalhes?.credits?.crew?.find((pessoa) => pessoa.job === 'Director')?.name,
        duracao: detalhes?.runtime,
        genero: detalhes?.genres?.map((genero) => GENEROS_FILME_TMDB[genero.id]).find(Boolean),
        idioma: normalizarIdioma(detalhes?.original_language || movie.original_language),
        descricao: movie.overview,
      };
    }));

    return NextResponse.json({ sugestoes });
  } catch (error) {
    console.error('Erro ao buscar capas de filmes:', error);
    return NextResponse.json({ sugestoes: [] });
  }
}
