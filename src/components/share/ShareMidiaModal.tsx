'use client'

import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import { Download, Loader2, Share2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Midia } from '@/types/midia'
import { MidiaShareCard } from './MidiaShareCard'

interface Props {
  midia: Midia
  open: boolean
  onClose: () => void
}

export function ShareMidiaModal({ midia, open, onClose }: Props) {
  const [generating, setGenerating] = useState(false)
  
  // Referência para o card "escondido" que tem o tamanho original (HD)
  const fullSizeRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!fullSizeRef.current) return

    try {
      setGenerating(true)
      
      // Gera o PNG a partir do elemento escondido em alta resolução
      const dataUrl = await toPng(fullSizeRef.current, {
        quality: 1.0,
        pixelRatio: 1, 
        cacheBust: true,
      })

      const link = document.createElement('a')
      link.download = `aura-share-${midia.titulo.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = dataUrl
      link.click()

      onClose()
    } catch (err) {
      console.error('Erro ao gerar imagem:', err)
      alert('Erro ao gerar a imagem. Tente novamente.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-xl max-h-[90vh] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-500" />
              Compartilhar Leitura
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Sua imagem está pronta. Confira a prévia abaixo.
            </DialogDescription>
          </DialogHeader>

          {/* ÁREA DE PRÉVIA (PREVIEW) */}
          {/* Removi bg-zinc-950 e bordas para ficar limpo no fundo do modal */}
          <div className="flex-1 flex items-center justify-center py-4 my-2 overflow-hidden">
            <div className="relative w-[340px] h-[425px]"> 
              <div className="origin-top-left transform scale-[0.315]">
                <MidiaShareCard midia={midia} />
              </div>
            </div>
          </div>

          {/* RODAPÉ COM BOTÕES */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
            {/* Botão Esquerda: Fechar */}
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4 mr-2" />
              Fechar
            </Button>

            {/* Botão Direita: Salvar */}
            <Button 
              onClick={handleDownload} 
              disabled={generating}
              className="bg-purple-600 hover:bg-purple-700 min-w-[140px]"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Salvar imagem
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* RENDERIZAÇÃO OCULTA (OFF-SCREEN) */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <div ref={fullSizeRef}>
          <MidiaShareCard midia={midia} />
        </div>
      </div>
    </>
  )
}