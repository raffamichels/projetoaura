import { Midia } from '@/types/midia'
import { StarRating } from '@/components/ui/star-rating'

interface Props {
  midia: Midia
  format?: 'POST' | 'STORY'
}

export function MidiaShareCard({ midia, format = 'POST' }: Props) {
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/') || url.startsWith('data:')) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }

  const isStory = format === 'STORY';

  return (
    <div
      id="aura-share-card"
      // Lógica de Layout e Safe Zones:
      // POST:  1080x1350 | Padding equilibrado (py-24 = 96px)
      // STORY: 1080x1920 | Padding Topo (pt-32 = 128px) para livrar perfil
      //                  | Padding Base (pb-96 = 384px) MUITO IMPORTANTE para livrar o input de msg
      className={`
        w-[1080px] bg-zinc-950 text-white flex flex-col relative overflow-hidden font-sans px-12 transition-all duration-300
        ${isStory ? 'h-[1920px] pt-32 pb-96' : 'h-[1350px] py-24'}
      `}
    >
      {/* Background Decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black z-0" />

      {/* Conteúdo Principal */}
      <div className="relative z-10 flex flex-col h-full items-center justify-between">
        
        {/* === BLOCO SUPERIOR: CAPA, INFO E ESTRELAS === */}
        <div className="flex flex-col items-center w-full">
          
          {/* 1. Capa 
              Post: 500px | Story: 620px (Aumentado, mas sem exagero)
          */}
          <div className={`
            relative aspect-[2/3] rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden border border-white/5 transition-all duration-300
            ${isStory ? 'w-[620px] mb-12' : 'w-[500px] mb-10'}
          `}>
            {midia.capa ? (
              <img
                src={getImageUrl(midia.capa)}
                alt={midia.titulo}
                className="w-full h-full object-cover"
                crossOrigin="anonymous" 
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center">
                 <span className="text-zinc-600 text-3xl font-medium">Sem Capa</span>
              </div>
            )}
          </div>

          {/* 2. Título 
              Post: text-6xl | Story: text-7xl (Grande, mas legível)
          */}
          <h1 className={`
            font-extrabold text-center leading-tight tracking-tight text-white drop-shadow-md max-w-4xl mx-auto transition-all duration-300
            ${isStory ? 'text-7xl mb-5' : 'text-6xl mb-3'}
          `}>
            {midia.titulo}
          </h1>

          {/* 3. Autor 
              Post: text-3xl | Story: text-4xl
          */}
          <p className={`
            text-zinc-400 font-medium tracking-wide transition-all duration-300
            ${isStory ? 'text-4xl mb-10' : 'text-3xl mb-8'}
          `}>
            {midia.tipo === 'LIVRO' ? midia.autor : midia.diretor}
          </p>

          {/* 4. Estrelas 
              Post: Scale 2.5 | Story: Scale 3.0
          */}
          <div className={`transform transition-all duration-300 ${isStory ? 'scale-[3.0]' : 'scale-[2.5]'}`}>
             <StarRating value={midia.nota || 0} readonly size="lg" />
          </div>
        </div>

        {/* === BLOCO CENTRAL: SEPARADOR === */}
        <div className={`w-full max-w-2xl transition-all duration-300 ${isStory ? 'mt-12' : 'mt-8'}`}>
          <div className="flex items-center w-full gap-6 opacity-40">
            <div className="h-[2px] bg-zinc-500 flex-1 rounded-full" />
            <span className={`font-bold uppercase tracking-[0.2em] text-zinc-300 transition-all duration-300 ${isStory ? 'text-3xl' : 'text-2xl'}`}>
              NO
            </span>
            <div className="h-[2px] bg-zinc-500 flex-1 rounded-full" />
          </div>
        </div>

        {/* === BLOCO INFERIOR: LOGO AURA === */}
        {/* A margem inferior aqui é controlada pelo padding do container (pb-96 no story)
            para garantir que isso fique LONGE da zona de digitação do Instagram */}
        <div className="flex flex-col items-center w-full">
          <div className="text-center">
            <h1 className={`
              font-bold tracking-tighter leading-none transition-all duration-300
              ${isStory ? 'text-9xl mb-4' : 'text-9xl mb-2'}
            `}>
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Aura
              </span>
            </h1>
            <p className={`
              text-zinc-500 tracking-wide font-medium transition-all duration-300
              ${isStory ? 'text-3xl' : 'text-2xl'}
            `}>
              Organize sua vida, simplifique seu dia
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}