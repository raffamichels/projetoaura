import { Midia } from '@/types/midia'
import { StarRating } from '@/components/ui/star-rating'

interface Props {
  midia: Midia
}

export function MidiaShareCard({ midia }: Props) {
  // Função Proxy para imagens
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/') || url.startsWith('data:')) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }

  return (
    <div
      id="aura-share-card"
      // Tamanho fixo HD (1080x1350)
      // py-24 garante margem exata e igual no topo e no rodapé
      className="w-[1080px] h-[1350px] bg-zinc-950 text-white flex flex-col relative overflow-hidden font-sans py-24 px-12"
    >
      {/* Background Decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black z-0" />

      {/* Conteúdo Principal com Z-Index para ficar acima do bg */}
      <div className="relative z-10 flex flex-col h-full items-center justify-between"> {/* Alterado para justify-between */}
        
        {/* === BLOCO SUPERIOR: CAPA, INFO E ESTRELAS === */}
        <div className="flex flex-col items-center w-full">
          
          {/* 1. Capa (Aumentada levemente para 500px) */}
          <div className="relative w-[500px] aspect-[2/3] rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden border border-white/5 mb-10">
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

          {/* 2. Título */}
          <h1 className="text-6xl font-extrabold text-center leading-tight tracking-tight text-white drop-shadow-md max-w-4xl mx-auto mb-3">
            {midia.titulo}
          </h1>

          {/* 3. Autor */}
          <p className="text-3xl text-zinc-400 font-medium tracking-wide mb-8">
            {midia.tipo === 'LIVRO' ? midia.autor : midia.diretor}
          </p>

          {/* 4. Estrelas */}
          <div className="transform scale-[2.5]">
             <StarRating value={midia.nota || 0} readonly size="lg" />
          </div>
        </div>

        {/* === BLOCO CENTRAL: SEPARADOR === */}
        {/* Container com margin-top para descer o separador */}
        <div className="w-full max-w-2xl mt-8"> {/* Adicionado mt-8 para descer o separador */}
          <div className="flex items-center w-full gap-6 opacity-40">
            <div className="h-[2px] bg-zinc-500 flex-1 rounded-full" />
            <span className="text-2xl font-bold uppercase tracking-[0.2em] text-zinc-300">
              NO
            </span>
            <div className="h-[2px] bg-zinc-500 flex-1 rounded-full" />
          </div>
        </div>

        {/* === BLOCO INFERIOR: LOGO AURA === */}
        {/* Container com padding-bottom para afastar da borda */}
        <div className="flex flex-col items-center w-full pb-12"> {/* Adicionado pb-12 para afastar da borda */}
          <div className="text-center">
            <h1 className="text-9xl font-bold mb-2 tracking-tighter leading-none"> {/* Reduzido mb-4 para mb-2 */}
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Aura
              </span>
            </h1>
            <p className="text-zinc-500 text-2xl tracking-wide font-medium">
              Organize sua vida, simplifique seu dia
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}