"use client"

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Hourglass, Play, Pause, ArrowCounterClockwise, Gear, X, Crown } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { UpgradeToPremiumModal } from '@/components/planos/UpgradeToPremiumModal'
import { useSession } from 'next-auth/react'

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak'

interface PomodoroSettings {
  workDuration: number // em minutos
  shortBreakDuration: number
  longBreakDuration: number
  pomodorosUntilLongBreak: number
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4
}

export function PomodoroTimer() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [mode, setMode] = useState<PomodoroMode>('work')
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Verifica se o usuário é premium
  const isPremium = session?.user?.plano === 'premium' || session?.user?.plano === 'PREMIUM'

  // Carrega configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
      setTimeLeft(parsed.workDuration * 60)
    }

    // Cria elemento de áudio para notificação
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjeM0fPTgjMGHm7A7+OZURE')
  }, [])

  // Timer principal
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  // Atualiza título da página com tempo restante
  useEffect(() => {
    if (isRunning) {
      const minutes = Math.floor(timeLeft / 60)
      const seconds = timeLeft % 60
      document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - ${getModeLabel(mode)}`
    } else {
      document.title = 'Aura - Estudos'
    }

    return () => {
      if (!isRunning) {
        document.title = 'Aura - Estudos'
      }
    }
  }, [timeLeft, isRunning, mode])

  const handleTimerComplete = () => {
    setIsRunning(false)

    // Toca som de notificação
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }

    // Mostra notificação do navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: mode === 'work'
          ? 'Hora de fazer uma pausa!'
          : 'Hora de voltar ao trabalho!',
        icon: '/icon.png'
      })
    }

    // Avança para próximo modo
    if (mode === 'work') {
      const newCompletedPomodoros = completedPomodoros + 1
      setCompletedPomodoros(newCompletedPomodoros)

      if (newCompletedPomodoros % settings.pomodorosUntilLongBreak === 0) {
        switchMode('longBreak')
      } else {
        switchMode('shortBreak')
      }
    } else {
      switchMode('work')
    }
  }

  const switchMode = (newMode: PomodoroMode) => {
    setMode(newMode)

    const durations = {
      work: settings.workDuration,
      shortBreak: settings.shortBreakDuration,
      longBreak: settings.longBreakDuration
    }

    setTimeLeft(durations[newMode] * 60)
  }

  const toggleTimer = () => {
    // Verifica se o usuário é premium antes de iniciar
    if (!isRunning && !isPremium) {
      setShowUpgradeModal(true)
      return
    }

    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    const durations = {
      work: settings.workDuration,
      shortBreak: settings.shortBreakDuration,
      longBreak: settings.longBreakDuration
    }
    setTimeLeft(durations[mode] * 60)
  }

  const saveSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings)
    localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings))
    setShowSettings(false)
    resetTimer()
    switchMode('work')
  }

  const getModeLabel = (m: PomodoroMode) => {
    const labels = {
      work: 'Foco',
      shortBreak: 'Pausa',
      longBreak: 'Descanso'
    }
    return labels[m]
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Renderiza o modal de configurações como portal
  const renderSettingsModal = () => {
    if (!showSettings || typeof window === 'undefined') return null

    const modalContent = (
      <div
        className="fixed inset-0 bg-navy/40 flex items-center justify-center p-4"
        style={{ zIndex: 9999 }}
        onClick={() => setShowSettings(false)}
      >
        <div
          className="bg-surface border border-line rounded-2xl shadow-sm p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-ink">Configurações Pomodoro</h3>
            <Button
              onClick={() => setShowSettings(false)}
              variant="ghost"
              size="sm"
              className="text-ink-soft hover:text-ink hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              saveSettings({
                workDuration: Number(formData.get('workDuration')),
                shortBreakDuration: Number(formData.get('shortBreakDuration')),
                longBreakDuration: Number(formData.get('longBreakDuration')),
                pomodorosUntilLongBreak: Number(formData.get('pomodorosUntilLongBreak'))
              })
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-ink-soft mb-2">Tempo de Foco (minutos)</label>
              <input
                type="number"
                name="workDuration"
                defaultValue={settings.workDuration}
                min="1"
                max="60"
                className="w-full bg-surface border border-line-strong rounded-lg px-4 py-2 text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20"
              />
            </div>

            <div>
              <label className="block text-sm text-ink-soft mb-2">Pausa Curta (minutos)</label>
              <input
                type="number"
                name="shortBreakDuration"
                defaultValue={settings.shortBreakDuration}
                min="1"
                max="30"
                className="w-full bg-surface border border-line-strong rounded-lg px-4 py-2 text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20"
              />
            </div>

            <div>
              <label className="block text-sm text-ink-soft mb-2">Pausa Longa (minutos)</label>
              <input
                type="number"
                name="longBreakDuration"
                defaultValue={settings.longBreakDuration}
                min="1"
                max="60"
                className="w-full bg-surface border border-line-strong rounded-lg px-4 py-2 text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20"
              />
            </div>

            <div>
              <label className="block text-sm text-ink-soft mb-2">Pomodoros até pausa longa</label>
              <input
                type="number"
                name="pomodorosUntilLongBreak"
                defaultValue={settings.pomodorosUntilLongBreak}
                min="2"
                max="10"
                className="w-full bg-surface border border-line-strong rounded-lg px-4 py-2 text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-brand hover:bg-brand-dark text-white"
            >
              Salvar
            </Button>
          </form>
        </div>
      </div>
    )

    return createPortal(modalContent, document.body)
  }

  // Interface expandida no header
  if (isOpen) {
    return (
      <>
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Botão do Timer (sempre visível) */}
          <button
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
              isRunning
                ? 'bg-brand-soft border-2 border-brand/50 text-brand-dark'
                : 'bg-surface-hover border-2 border-line text-ink-soft hover:bg-line hover:border-line-strong'
            }`}
            title="Fechar Pomodoro"
          >
            <Hourglass className={`${isRunning ? 'w-5 h-5 animate-pulse' : 'w-5 h-5'}`} />
          </button>

          {/* Timer Display */}
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${
              mode === 'work' ? 'text-ink' : mode === 'shortBreak' ? 'text-green-700 dark:text-green-400' : 'text-brand-dark'
            }`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-ink-faint">{getModeLabel(mode)}</div>
          </div>

          {/* Seletor de Modo */}
          <div className="flex gap-1.5">
            <button
              onClick={() => !isRunning && switchMode('work')}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                mode === 'work'
                  ? 'bg-brand text-white'
                  : 'bg-surface-hover text-ink-soft hover:bg-line'
              }`}
              disabled={isRunning}
              title="Modo Foco"
            >
              Foco
            </button>
            <button
              onClick={() => !isRunning && switchMode('shortBreak')}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                mode === 'shortBreak'
                  ? 'bg-green-600 text-white'
                  : 'bg-surface-hover text-ink-soft hover:bg-line'
              }`}
              disabled={isRunning}
              title="Pausa Curta"
            >
              Pausa
            </button>
            <button
              onClick={() => !isRunning && switchMode('longBreak')}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                mode === 'longBreak'
                  ? 'bg-navy text-white'
                  : 'bg-surface-hover text-ink-soft hover:bg-line'
              }`}
              disabled={isRunning}
              title="Descanso Longo"
            >
              Descanso
            </button>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTimer}
              className={`relative p-2 rounded-lg font-medium text-white transition-all ${
                mode === 'work'
                  ? 'bg-brand hover:bg-brand-dark'
                  : mode === 'shortBreak'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-navy hover:bg-[#0B2233]'
              }`}
              title={isRunning ? 'Pausar' : !isPremium ? 'Premium - Clique para fazer upgrade' : 'Iniciar'}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {!isRunning && !isPremium && (
                <Crown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
              )}
            </button>
            <button
              onClick={resetTimer}
              className="p-2 rounded-lg bg-surface-hover hover:bg-line text-ink-soft hover:text-ink transition-all"
              title="Resetar"
            >
              <ArrowCounterClockwise className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-surface-hover hover:bg-line text-ink-soft hover:text-ink transition-all"
              title="Configurações"
            >
              <Gear className="w-4 h-4" />
            </button>
          </div>

          {/* Pomodoros completados */}
          <div className="flex items-center gap-2 pl-3 border-l border-line">
            <div className="flex gap-1">
              {Array.from({ length: settings.pomodorosUntilLongBreak }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i < completedPomodoros % settings.pomodorosUntilLongBreak
                      ? 'bg-brand'
                      : 'bg-line'
                  }`}
                  title={`Pomodoro ${i + 1}`}
                />
              ))}
            </div>
            <span className="text-xs text-ink-faint">{completedPomodoros}</span>
            {completedPomodoros > 0 && (
              <button
                onClick={() => setCompletedPomodoros(0)}
                className="p-1 rounded hover:bg-surface-hover text-ink-faint hover:text-ink-soft transition-all"
                title="Resetar contador de pomodoros"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex lg:hidden flex-col gap-3 min-w-[320px]">
          <div className="flex items-center justify-between">
            {/* Timer e Botão de fechar */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                  isRunning
                    ? 'bg-brand-soft border border-brand/50 text-brand-dark'
                    : 'bg-surface-hover border border-line text-ink-soft'
                }`}
              >
                <Hourglass className={`${isRunning ? 'w-5 h-5 animate-pulse' : 'w-5 h-5'}`} />
              </button>
              <div className="flex flex-col">
                <div className={`text-2xl font-bold ${
                  mode === 'work' ? 'text-ink' : mode === 'shortBreak' ? 'text-green-700 dark:text-green-400' : 'text-brand-dark'
                }`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-ink-faint">{getModeLabel(mode)}</div>
              </div>
            </div>

            {/* Controles principais */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTimer}
                className={`relative p-2 rounded-lg font-medium text-white transition-all ${
                  mode === 'work'
                    ? 'bg-brand'
                    : mode === 'shortBreak'
                    ? 'bg-green-600'
                    : 'bg-navy'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {!isRunning && !isPremium && (
                  <Crown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
                )}
              </button>
              <button
                onClick={resetTimer}
                className="p-2 rounded-lg bg-surface-hover text-ink-soft hover:bg-line"
              >
                <ArrowCounterClockwise className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg bg-surface-hover text-ink-soft hover:bg-line"
              >
                <Gear className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Seletor de Modo */}
          <div className="flex gap-2">
            <button
              onClick={() => !isRunning && switchMode('work')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                mode === 'work'
                  ? 'bg-brand text-white'
                  : 'bg-surface-hover text-ink-soft'
              }`}
              disabled={isRunning}
            >
              Foco
            </button>
            <button
              onClick={() => !isRunning && switchMode('shortBreak')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                mode === 'shortBreak'
                  ? 'bg-green-600 text-white'
                  : 'bg-surface-hover text-ink-soft'
              }`}
              disabled={isRunning}
            >
              Pausa
            </button>
            <button
              onClick={() => !isRunning && switchMode('longBreak')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                mode === 'longBreak'
                  ? 'bg-navy text-white'
                  : 'bg-surface-hover text-ink-soft'
              }`}
              disabled={isRunning}
            >
              Descanso
            </button>
          </div>

          {/* Contador de pomodoros */}
          <div className="flex items-center justify-between pt-2 border-t border-line">
            <span className="text-sm text-ink-soft">Pomodoros completos</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: settings.pomodorosUntilLongBreak }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i < completedPomodoros % settings.pomodorosUntilLongBreak
                        ? 'bg-brand'
                        : 'bg-line'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-ink">{completedPomodoros}</span>
              {completedPomodoros > 0 && (
                <button
                  onClick={() => setCompletedPomodoros(0)}
                  className="p-1 rounded hover:bg-surface-hover text-ink-faint hover:text-ink-soft"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Configurações */}
        {renderSettingsModal()}

        {/* Modal de Upgrade Premium */}
        <UpgradeToPremiumModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          recurso="Temporizador Pomodoro"
          descricao="O Temporizador Pomodoro completo está disponível apenas para usuários Premium."
        />
      </>
    )
  }

  // Botão minimizado
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all ${
          isRunning
            ? 'bg-brand-soft border border-brand/50 sm:border-2 text-brand-dark'
            : 'bg-surface-hover border border-line sm:border-2 text-ink-soft hover:bg-line hover:border-line-strong'
        }`}
        title="Temporizador Pomodoro"
      >
        <Hourglass className={`${isRunning ? 'w-4 h-4 sm:w-5 sm:h-5 animate-pulse' : 'w-4 h-4 sm:w-5 sm:h-5'}`} />
        {isRunning && (
          <span className={`text-xs sm:text-sm font-bold ${
            mode === 'work' ? 'text-ink' : mode === 'shortBreak' ? 'text-green-700 dark:text-green-400' : 'text-brand-dark'
          }`}>
            {formatTime(timeLeft)}
          </span>
        )}
      </button>

      {/* Modal de Configurações */}
      {renderSettingsModal()}

      {/* Modal de Upgrade Premium */}
      <UpgradeToPremiumModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        recurso="Temporizador Pomodoro"
        descricao="O Temporizador Pomodoro completo está disponível apenas para usuários Premium."
      />
    </>
  )
}
