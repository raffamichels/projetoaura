"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface GenerateReviewButtonProps {
  midiaId: string
  onReviewGenerated: (review: string) => void
  disabled?: boolean
}

export function GenerateReviewButton({
  midiaId,
  onReviewGenerated,
  disabled = false,
}: GenerateReviewButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ midiaId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar resenha")
      }

      onReviewGenerated(data.review)
      toast.success("Resenha gerada com sucesso!")
    } catch (error) {
      console.error("Erro ao gerar resenha:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao gerar resenha. Tente novamente."
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating || disabled}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando resenha...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Gerar Resenha
        </>
      )}
    </Button>
  )
}
