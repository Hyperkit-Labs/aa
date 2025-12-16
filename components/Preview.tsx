'use client'

import { useState, useEffect, useRef, useMemo, memo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  Smartphone,
  Tablet,
  Monitor,
  Signal,
  Wifi,
  Mail,
  Fingerprint,
  Github,
  MessageCircle,
  Sparkles,
  Dog,
  QrCode,
  Copy,
} from 'lucide-react'
import anime from 'animejs'
import { WalletConfig, ComponentType } from '@/lib/types'
import { DraggableBlock } from './DraggableBlock'

// Generate React code with all config options
function generateReactCode(config: WalletConfig): string {
  const logoConfig = config.customLogoEnabled && config.customLogo ? {
    enabled: true,
    image: config.customLogo,
    replaceTitle: config.customLogoReplaceTitle,
    size: config.logoSize,
    customSize: config.logoCustomSize,
    width: config.logoWidth,
    height: config.logoHeight,
    maintainAspectRatio: config.logoMaintainAspectRatio,
    position: {
      horizontal: config.logoPositionHorizontal,
      vertical: config.logoPositionVertical,
    },
    spacing: {
      top: config.logoSpacingTop,
      bottom: config.logoSpacingBottom,
      left: config.logoSpacingLeft,
      right: config.logoSpacingRight,
    },
    opacity: config.logoOpacity,
    borderRadius: config.logoBorderRadius,
    shadow: config.logoShadowEnabled ? {
      enabled: true,
      color: config.logoShadowColor,
      blur: config.logoShadowBlur,
      offsetX: config.logoShadowOffsetX,
      offsetY: config.logoShadowOffsetY,
    } : { enabled: false },
    header: {
      height: config.logoHeaderHeight,
      backgroundColor: config.logoHeaderBackgroundColor,
      padding: {
        horizontal: config.logoHeaderPaddingHorizontal,
        vertical: config.logoHeaderPaddingVertical,
      },
      border: config.logoHeaderBorderEnabled ? {
        enabled: true,
        color: config.logoHeaderBorderColor,
        width: config.logoHeaderBorderWidth,
      } : { enabled: false },
    },
    responsive: {
      mobile: config.logoResponsiveMobile,
      tablet: config.logoResponsiveTablet,
      desktop: config.logoResponsiveDesktop,
    },
    animation: config.logoAnimation,
  } : null

  return `<SmartWalletAuth
  email={${config.email}}
  sms={${config.sms}}
  social={${config.social}}
  passkey={${config.passkey}}
  external={${config.external}}
  wallets={{
    smartAccount: "${config.accountType}",
    external: ${config.external},
    providers: ["smartWallet", "metamask", "coinbase"]
  }}
  networks={[${config.networks.map((n) => `"${n.toLowerCase()}"`).join(', ')}]}
  branding={{
    theme: "${config.theme}",
    primaryColor: "${config.primaryColor}",
    cornerRadius: ${config.cornerRadius},
    fontFamily: "${config.fontFamily}"
  }}
  componentOrder={[${config.componentOrder.map((c) => `"${c}"`).join(', ')}]}
  accountConfig={{
    accountType: "${config.accountType}",
    entryPoint: "${config.entryPoint}",
    paymaster: ${config.paymaster}
  }}
  sessionConfig={{
    persistence: "${config.persistence}",
    duration: "${config.duration}",
    spendingLimit: {
      enabled: ${config.limits},
      amount: ${config.spendingLimit},
      currency: "${config.spendingLimitCurrency}"
    }
  }}
  ${logoConfig ? `logo={${JSON.stringify(logoConfig, null, 2)}}` : ''}
/>`
}

// React Code Preview Component
function ReactCodePreview({ config }: { config: WalletConfig }) {
  const code = generateReactCode(config)
  const lines = code.split('\n')
  
  return (
    <pre>
      <code>
        {lines.map((line, index) => {
          if (line.trim() === '') return <br key={index} />
          
          // Syntax highlighting
          const parts: JSX.Element[] = []
          let remaining = line
          let keyIndex = 0
          
          // Match JSX tags
          const tagMatch = remaining.match(/^(\s*)(&lt;[\w]+|&lt;\/[\w]+|&gt;)/)
          if (tagMatch) {
            parts.push(
              <span key={keyIndex++} className="text-gray-500">{tagMatch[1]}</span>,
              <span key={keyIndex++} className="token-tag">{tagMatch[2]}</span>
            )
            remaining = remaining.slice(tagMatch[0].length)
          }
          
          // Match attributes
          const attrMatch = remaining.match(/(\w+)=/)
          if (attrMatch) {
            const before = remaining.slice(0, attrMatch.index)
            if (before) parts.push(<span key={keyIndex++}>{before}</span>)
            parts.push(
              <span key={keyIndex++} className="token-attr">{attrMatch[1]}</span>,
              <span key={keyIndex++}>=</span>
            )
            remaining = remaining.slice((attrMatch.index || 0) + attrMatch[0].length)
          }
          
          // Match strings
          const stringMatch = remaining.match(/(["'][^"']*["'])/)
          if (stringMatch) {
            const before = remaining.slice(0, stringMatch.index)
            if (before) parts.push(<span key={keyIndex++}>{before}</span>)
            parts.push(
              <span key={keyIndex++} className="token-string">{stringMatch[1]}</span>
            )
            remaining = remaining.slice((stringMatch.index || 0) + stringMatch[0].length)
          }
          
          // Match booleans
          const boolMatch = remaining.match(/(true|false)/)
          if (boolMatch) {
            const before = remaining.slice(0, boolMatch.index)
            if (before) parts.push(<span key={keyIndex++}>{before}</span>)
            parts.push(
              <span key={keyIndex++} className="token-boolean">{boolMatch[1]}</span>
            )
            remaining = remaining.slice((boolMatch.index || 0) + boolMatch[0].length)
          }
          
          // Match numbers
          const numMatch = remaining.match(/(\d+)/)
          if (numMatch) {
            const before = remaining.slice(0, numMatch.index)
            if (before) parts.push(<span key={keyIndex++}>{before}</span>)
            parts.push(
              <span key={keyIndex++} className="token-number">{numMatch[1]}</span>
            )
            remaining = remaining.slice((numMatch.index || 0) + numMatch[0].length)
          }
          
          if (remaining) parts.push(<span key={keyIndex++}>{remaining}</span>)
          
          return (
            <div key={index}>
              {parts.length > 0 ? parts : <span>{line}</span>}
            </div>
          )
        })}
      </code>
    </pre>
  )
}

// JSON Code Preview Component
function JSONCodePreview({ config }: { config: WalletConfig }) {
  const jsonString = JSON.stringify(config, null, 2)
  const lines = jsonString.split('\n')
  
  return (
    <pre>
      <code>
        {lines.map((line, index) => {
          if (line.trim() === '') return <br key={index} />
          
          // Simple JSON syntax highlighting
          if (line.match(/^\s*"[^"]+":/)) {
            const [key, ...valueParts] = line.split(':')
            const value = valueParts.join(':')
            return (
              <div key={index}>
                <span className="token-key">{key}</span>:
                <span className="token-string">{value}</span>
              </div>
            )
          }
          
          if (line.match(/^\s*(true|false|null|\d+)/)) {
            return (
              <div key={index}>
                <span className="token-boolean">{line}</span>
              </div>
            )
          }
          
          return <div key={index}>{line}</div>
        })}
      </code>
    </pre>
  )
}

interface PreviewProps {
  config: WalletConfig
  onConfigChange: (updates: Partial<WalletConfig>) => void
  onToast: (message: string) => void
}

export function Preview({ config, onConfigChange, onToast }: PreviewProps) {
  const [showCode, setShowCode] = useState(false)
  const [codeView, setCodeView] = useState<'react' | 'json'>('react')
  const previewFrameRef = useRef<HTMLDivElement>(null)
  const codePreviewRef = useRef<HTMLDivElement>(null)
  const uiPreviewRef = useRef<HTMLDivElement>(null)
  const prevDeviceRef = useRef(config.device)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragMove = (event: any) => {
    // Restrict movement to vertical only by setting x delta to 0
    if (event.delta) {
      event.delta.x = 0
    }
  }

  const deviceWidths = {
    mobile: '360px',
    tablet: '500px',
    desktop: '100%',
  }

  const maxWidths = {
    mobile: 'max-w-sm',
    tablet: 'max-w-md',
    desktop: 'max-w-lg',
  }

  const blockSpacing = {
    mobile: 'space-y-3',
    tablet: 'space-y-4',
    desktop: 'space-y-5',
  }

  const previewBlocks = useMemo(() => ({
    email: config.email,
    sms: config.sms,
    social: config.social,
    passkey: config.passkey,
    external: config.external,
  }), [config.email, config.sms, config.social, config.passkey, config.external])

  const enabledComponents = useMemo(() => {
    return config.componentOrder.filter(type => previewBlocks[type])
  }, [config.componentOrder, previewBlocks])

  // Animate device change
  useEffect(() => {
    if (prevDeviceRef.current !== config.device && previewFrameRef.current) {
      anime({
        targets: previewFrameRef.current,
        scale: [1, 0.95, 1],
        duration: 400,
        easing: 'easeOutElastic(1, .6)',
      })
    }
    prevDeviceRef.current = config.device
  }, [config.device])

  // Animate code/UI view switch
  useEffect(() => {
    if (showCode && codePreviewRef.current) {
      anime({
        targets: codePreviewRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        translateY: [20, 0],
        duration: 400,
        easing: 'easeOutQuad',
      })
    } else if (!showCode && uiPreviewRef.current) {
      anime({
        targets: uiPreviewRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 400,
        easing: 'easeOutQuad',
      })
    }
  }, [showCode])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = config.componentOrder.indexOf(active.id as ComponentType)
      const newIndex = config.componentOrder.indexOf(over.id as ComponentType)

      const newOrder = [...config.componentOrder]
      newOrder.splice(oldIndex, 1)
      newOrder.splice(newIndex, 0, active.id as ComponentType)

      onConfigChange({ componentOrder: newOrder })
      onToast('Component order updated')
    }
  }

  const renderComponent = (type: ComponentType) => {
    const inputBg = isLight ? 'bg-gray-50' : 'bg-[#1C1C1E]'
    const inputBorder = isLight ? 'border-gray-300' : 'border-white/10'
    const inputText = isLight ? 'text-gray-900' : 'text-white'
    const inputPlaceholder = isLight ? 'placeholder:text-gray-400' : 'placeholder:text-gray-600'
    const labelText = isLight ? 'text-gray-600' : 'text-gray-400'
    const dividerBg = isLight ? 'bg-gray-300' : 'bg-white/5'
    const dividerText = isLight ? 'bg-white text-gray-500' : 'bg-[#0F0F11] text-gray-500'
    const buttonSecondary = isLight ? 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200' : 'bg-[#1C1C1E] border-white/10 text-white hover:bg-[#252528]'
    const socialButton = isLight ? 'bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-gray-400' : 'bg-[#1C1C1E] border-white/10 hover:bg-white/10 hover:border-white/20'
    const socialIcon = isLight ? 'text-gray-900' : 'text-white'
    const walletButton = isLight ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300' : 'bg-[#1C1C1E] border-white/10 hover:bg-white/10 hover:border-white/20'

    switch (type) {
      case 'email':
        return (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className={`text-[11px] font-medium uppercase ${labelText}`}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                className={`w-full h-10 ${inputBg} border ${inputBorder} rounded-xl px-3 text-sm ${inputText} focus:outline-none transition-colors ${inputPlaceholder}`}
                style={{
                  borderRadius: `${config.cornerRadius}px`,
                  borderColor: config.primaryColor + '40',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = config.primaryColor
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isLight ? '#D1D5DB' : 'rgba(255,255,255,0.1)'
                }}
              />
            </div>
                    <button
                      onClick={(e) => {
                        anime({
                          targets: e.currentTarget,
                          scale: [1, 0.95, 1],
                          duration: 300,
                          easing: 'easeOutElastic(1, .8)',
                        })
                        onToast('Verification Email Sent')
                      }}
                      aria-label="Continue with email authentication"
                      className="w-full h-10 text-white text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{
                        backgroundColor: config.primaryColor,
                        borderRadius: `${config.cornerRadius}px`,
                        '--tw-ring-color': config.primaryColor,
                      } as React.CSSProperties}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          e.currentTarget.click()
                        }
                      }}
                    >
                      Continue with Email
                    </button>
          </div>
        )

      case 'sms':
        return (
          <div className="space-y-3">
            <div className="relative flex items-center justify-center my-2">
              <div className={`h-[1px] ${dividerBg} w-full absolute`}></div>
              <span className={`${isLight ? 'bg-white' : 'bg-[#0F0F11]'} px-2 text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-500'} relative z-10`}>OR</span>
            </div>
            <div className="space-y-1.5">
              <label className={`text-[11px] font-medium uppercase ${labelText}`}>
                Phone Number
              </label>
              <div className="flex gap-2">
                <div className={`w-16 h-10 ${inputBg} border ${inputBorder} flex items-center justify-center text-xs ${labelText}`} style={{ borderRadius: `${config.cornerRadius}px` }}>
                  +1
                </div>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  className={`flex-1 h-10 ${inputBg} border ${inputBorder} px-3 text-sm ${inputText} focus:outline-none transition-colors ${inputPlaceholder}`}
                  style={{
                    borderRadius: `${config.cornerRadius}px`,
                    borderColor: config.primaryColor + '40',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = config.primaryColor
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isLight ? '#D1D5DB' : 'rgba(255,255,255,0.1)'
                  }}
                />
              </div>
            </div>
            <button
              onClick={(e) => {
                anime({
                  targets: e.currentTarget,
                  scale: [1, 0.95, 1],
                  duration: 300,
                  easing: 'easeOutElastic(1, .8)',
                })
                onToast('OTP Sent to Phone')
              }}
              className={`w-full h-10 ${buttonSecondary} text-xs font-medium transition-colors`}
              style={{ borderRadius: `${config.cornerRadius}px` }}
            >
              Send Verification Code
            </button>
          </div>
        )

      case 'social':
        return (
          <div className="space-y-3">
            <div className="relative flex items-center justify-center my-2">
              <div className={`h-[1px] ${dividerBg} w-full absolute`}></div>
              <span className={`${isLight ? 'bg-white' : 'bg-[#0F0F11]'} px-2 text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-500'} relative z-10`}>
                Continue with Social
              </span>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={(e) => {
                  anime({
                    targets: e.currentTarget,
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                    duration: 400,
                    easing: 'easeOutElastic(1, .8)',
                  })
                  onToast('Google Login Initiated')
                }}
                className={`w-10 h-10 rounded-full ${socialButton} border flex items-center justify-center transition-all`}
              >
                <span className={`font-bold text-sm ${socialIcon}`}>G</span>
              </button>
              <button
                onClick={(e) => {
                  anime({
                    targets: e.currentTarget,
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                    duration: 400,
                    easing: 'easeOutElastic(1, .8)',
                  })
                  onToast('X Login Initiated')
                }}
                className={`w-10 h-10 rounded-full ${socialButton} border flex items-center justify-center transition-all`}
              >
                <span className={`font-bold text-sm ${socialIcon}`}>𝕏</span>
              </button>
              <button
                onClick={(e) => {
                  anime({
                    targets: e.currentTarget,
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                    duration: 400,
                    easing: 'easeOutElastic(1, .8)',
                  })
                  onToast('GitHub Login Initiated')
                }}
                className={`w-10 h-10 rounded-full ${socialButton} border flex items-center justify-center transition-all`}
              >
                <Github className={`w-4 h-4 ${socialIcon}`} />
              </button>
              <button
                onClick={(e) => {
                  anime({
                    targets: e.currentTarget,
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                    duration: 400,
                    easing: 'easeOutElastic(1, .8)',
                  })
                  onToast('Discord Login Initiated')
                }}
                className={`w-10 h-10 rounded-full ${socialButton} border flex items-center justify-center transition-all`}
              >
                <MessageCircle className={`w-4 h-4 ${socialIcon}`} />
              </button>
            </div>
          </div>
        )

      case 'passkey':
        return (
          <div className="pt-1">
                    <button
                      onClick={(e) => {
                        anime({
                          targets: e.currentTarget,
                          scale: [1, 0.95, 1],
                          duration: 300,
                          easing: 'easeOutElastic(1, .8)',
                        })
                        onToast('Passkey Prompt Opened')
                      }}
                      className="w-full h-12 text-white text-xs font-medium transition-all flex items-center justify-center gap-2 group border"
                      style={{
                        backgroundColor: `${config.primaryColor}20`,
                        borderColor: `${config.primaryColor}40`,
                        color: config.primaryColor,
                        borderRadius: `${config.cornerRadius}px`,
                      }}
                    >
                      <Fingerprint className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Use Passkey
                    </button>
                    <p className={`text-[10px] text-center mt-2 ${isLight ? 'text-gray-500' : 'text-gray-600'}`}>Works on supported devices</p>
          </div>
        )

      case 'external':
        return (
          <div className="space-y-3">
            <div className="relative flex items-center justify-center my-2">
              <div className={`h-[1px] ${dividerBg} w-full absolute`}></div>
              <span className={`${isLight ? 'bg-white' : 'bg-[#0F0F11]'} px-2 text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-500'} relative z-10`}>
                Connect Wallet
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={(e) => {
                  anime({
                    targets: e.currentTarget,
                    scale: [1, 1.1, 1],
                    duration: 300,
                    easing: 'easeOutElastic(1, .8)',
                  })
                  onToast('Smart Wallet Connecting...')
                }}
                className={`aspect-square rounded-xl ${walletButton} border flex flex-col items-center justify-center gap-1 active:scale-95 transition-all group`}
                style={{ borderRadius: `${config.cornerRadius}px` }}
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className={`text-[8px] ${isLight ? 'text-gray-700 group-hover:text-gray-900' : 'text-gray-400 group-hover:text-white'}`}>Smart</span>
              </button>
              <button
                onClick={(e) => {
                  anime({
                    targets: e.currentTarget,
                    scale: [1, 1.1, 1],
                    duration: 300,
                    easing: 'easeOutElastic(1, .8)',
                  })
                  onToast('MetaMask Connecting...')
                }}
                className={`aspect-square rounded-xl ${walletButton} border flex flex-col items-center justify-center gap-1 active:scale-95 transition-all group`}
                style={{ borderRadius: `${config.cornerRadius}px` }}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isLight ? 'bg-gray-200' : 'bg-[#2a2a2e]'} text-orange-500`}>
                  <Dog className="w-3 h-3" />
                </div>
                <span className={`text-[8px] ${isLight ? 'text-gray-700 group-hover:text-gray-900' : 'text-gray-400 group-hover:text-white'}`}>MetaMask</span>
              </button>
              <button
                onClick={(e) => {
                  anime({
                    targets: e.currentTarget,
                    scale: [1, 1.1, 1],
                    duration: 300,
                    easing: 'easeOutElastic(1, .8)',
                  })
                  onToast('Coinbase Connecting...')
                }}
                className={`aspect-square rounded-xl ${walletButton} border flex flex-col items-center justify-center gap-1 active:scale-95 transition-all group`}
                style={{ borderRadius: `${config.cornerRadius}px` }}
              >
                <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
                  <div className="w-3 h-3 rounded-full border-2 border-white"></div>
                </div>
                <span className={`text-[8px] ${isLight ? 'text-gray-700 group-hover:text-gray-900' : 'text-gray-400 group-hover:text-white'}`}>Coinbase</span>
              </button>
              <button
                onClick={(e) => {
                  anime({
                    targets: e.currentTarget,
                    scale: [1, 1.1, 1],
                    duration: 300,
                    easing: 'easeOutElastic(1, .8)',
                  })
                  onToast('WalletConnect QR...')
                }}
                className={`aspect-square rounded-xl ${walletButton} border flex flex-col items-center justify-center gap-1 active:scale-95 transition-all group`}
                style={{ borderRadius: `${config.cornerRadius}px` }}
              >
                <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center text-white">
                  <QrCode className="w-3 h-3" />
                </div>
                <span className={`text-[8px] ${isLight ? 'text-gray-700 group-hover:text-gray-900' : 'text-gray-400 group-hover:text-white'}`}>QR</span>
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isLight = config.theme === 'light'

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#030305] relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

      {/* Preview Header */}
      <div className="h-12 border-b border-white/5 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-[#030305]/80 backdrop-blur z-30">
        <div className="flex items-center bg-[#1C1C1E] rounded-md border border-white/10 p-0.5">
          <button
            onClick={() => onConfigChange({ device: 'mobile' })}
            className={`p-1.5 rounded transition-all active:scale-95 ${
              config.device === 'mobile'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-white'
            }`}
            aria-label="Mobile view"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onConfigChange({ device: 'tablet' })}
            className={`p-1.5 rounded transition-all active:scale-95 ${
              config.device === 'tablet'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-white'
            }`}
            aria-label="Tablet view"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onConfigChange({ device: 'desktop' })}
            className={`p-1.5 rounded transition-all active:scale-95 ${
              config.device === 'desktop'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-white'
            }`}
            aria-label="Desktop view"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-wider hidden sm:inline">
            Preview Mode
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showCode}
              onChange={(e) => setShowCode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-20 sm:w-24 h-6 sm:h-7 bg-[#1C1C1E] border border-white/10 peer-focus:outline-none rounded-lg peer peer-checked:after:translate-x-full after:content-['Code'] peer-checked:after:content-['UI'] after:absolute after:top-[2px] sm:after:top-[3px] after:left-[2px] sm:after:left-[3px] after:bg-purple-600 after:text-white after:text-[9px] sm:after:text-[10px] after:font-bold after:flex after:items-center after:justify-center after:border-transparent after:rounded-md after:h-4 sm:after:h-5 after:w-9 sm:after:w-11 after:transition-all text-[9px] sm:text-[10px] font-medium text-gray-400 flex justify-between px-2 sm:px-2.5 items-center select-none">
              <span>UI</span>
              <span>Code</span>
            </div>
          </label>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto relative">
        {!showCode ? (
          /* UI Preview */
          <div ref={uiPreviewRef} className="relative">
            <div
              ref={previewFrameRef}
              className={`${config.theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0F0F11] border-white/10'} border shadow-2xl overflow-hidden relative flex flex-col max-h-[600px] sm:max-h-[650px] md:max-h-[700px]`}
              style={{
                width: deviceWidths[config.device],
                borderRadius: `${config.cornerRadius}px`,
                fontFamily: config.fontFamily,
              }}
            >
              {/* Status Bar */}
              <div className={`h-6 flex justify-between items-center px-5 pt-3 mb-2 opacity-50 select-none ${config.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                <span className="text-[10px] font-medium">9:41</span>
                <div className="flex gap-1.5">
                  <Signal className={`w-3 h-3 ${config.theme === 'light' ? 'text-gray-900' : 'text-white'}`} />
                  <Wifi className={`w-3 h-3 ${config.theme === 'light' ? 'text-gray-900' : 'text-white'}`} />
                  <div className={`w-4 h-3 rounded-[2px] border ${config.theme === 'light' ? 'border-gray-900' : 'border-white'} flex items-center justify-start px-[1px]`}>
                    <div className={`w-2.5 h-1.5 rounded-[1px] ${config.theme === 'light' ? 'bg-gray-900' : 'bg-white'}`}></div>
                  </div>
                </div>
              </div>

              {/* App Content */}
              <div className={`flex-1 flex flex-col overflow-y-auto custom-scrollbar ${
                config.device === 'mobile' ? 'p-4' : 'p-6'
              }`}>
                <div className="flex-1 flex flex-col items-center justify-start min-w-0">
                  {/* Logo Header Section */}
                  {config.customLogoEnabled && config.customLogo && (
                    <div
                      className="w-full flex-shrink-0"
                      style={{
                        minHeight: `${config.logoHeaderHeight}px`,
                        backgroundColor: config.logoHeaderBackgroundColor === 'transparent' ? 'transparent' : config.logoHeaderBackgroundColor,
                        paddingLeft: `${config.logoHeaderPaddingHorizontal}px`,
                        paddingRight: `${config.logoHeaderPaddingHorizontal}px`,
                        paddingTop: `${config.logoHeaderPaddingVertical}px`,
                        paddingBottom: `${config.logoHeaderPaddingVertical}px`,
                        borderBottom: config.logoHeaderBorderEnabled
                          ? `${config.logoHeaderBorderWidth}px solid ${config.logoHeaderBorderColor}`
                          : 'none',
                      }}
                    >
                      <div
                        className="w-full"
                        style={{
                          display: 'flex',
                          justifyContent:
                            config.logoPositionHorizontal === 'left'
                              ? 'flex-start'
                              : config.logoPositionHorizontal === 'right'
                              ? 'flex-end'
                              : 'center',
                          alignItems:
                            config.logoPositionVertical === 'top'
                              ? 'flex-start'
                              : config.logoPositionVertical === 'bottom'
                              ? 'flex-end'
                              : 'center',
                          marginTop: `${config.logoSpacingTop}px`,
                          marginBottom: `${config.logoSpacingBottom}px`,
                          marginLeft: `${config.logoSpacingLeft}px`,
                          marginRight: `${config.logoSpacingRight}px`,
                        }}
                      >
                        <img
                          src={config.customLogo}
                          alt="Logo"
                          className="object-contain"
                          style={{
                            width: config.logoWidth ? `${config.logoWidth}px` : undefined,
                            height: config.logoHeight
                              ? `${config.logoHeight}px`
                              : config.logoSize === 'small'
                              ? '32px'
                              : config.logoSize === 'medium'
                              ? '48px'
                              : config.logoSize === 'large'
                              ? '64px'
                              : config.logoSize === 'xlarge'
                              ? '96px'
                              : `${config.logoCustomSize}px`,
                            maxWidth: config.logoWidth ? undefined : config.device === 'mobile'
                              ? `${config.logoResponsiveMobile}px`
                              : config.device === 'tablet'
                              ? `${config.logoResponsiveTablet}px`
                              : `${config.logoResponsiveDesktop}px`,
                            maxHeight: config.logoHeight ? undefined : config.device === 'mobile'
                              ? `${config.logoResponsiveMobile}px`
                              : config.device === 'tablet'
                              ? `${config.logoResponsiveTablet}px`
                              : `${config.logoResponsiveDesktop}px`,
                            opacity: config.logoOpacity / 100,
                            borderRadius: `${config.logoBorderRadius}px`,
                            boxShadow: config.logoShadowEnabled
                              ? `${config.logoShadowOffsetX}px ${config.logoShadowOffsetY}px ${config.logoShadowBlur}px ${config.logoShadowColor}`
                              : 'none',
                            objectFit: config.logoMaintainAspectRatio ? 'contain' : 'fill',
                            animation: config.logoAnimation === 'fade'
                              ? 'fadeIn 0.5s ease-in'
                              : config.logoAnimation === 'slide'
                              ? 'slideIn 0.5s ease-out'
                              : config.logoAnimation === 'scale'
                              ? 'scaleIn 0.3s ease-out'
                              : 'none',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Title Section */}
                  <div className={`text-center mb-6 w-full ${maxWidths[config.device]} flex-shrink-0 ${config.customLogoEnabled && config.customLogo && config.logoSpacingBottom > 0 ? 'mt-4' : ''}`}>
                    {(!config.customLogoEnabled || !config.customLogo || !config.customLogoReplaceTitle) && (
                      <>
                        <h1 className={`text-xl font-bold tracking-tight ${config.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Sign in</h1>
                        <p className={`text-xs mt-1 ${config.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Welcome back to HyperDapp</p>
                      </>
                    )}
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={enabledComponents}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className={`w-full ${blockSpacing[config.device]} ${maxWidths[config.device]} flex-shrink-0 mx-auto`}>
                        {config.componentOrder.map((type) => (
                          <DraggableBlock
                            key={type}
                            id={type}
                            isEnabled={previewBlocks[type]}
                            primaryColor={config.primaryColor}
                          >
                            <div className={`
                              rounded-lg transition-all
                              ${config.theme === 'light' 
                                ? 'bg-gray-50/50 border border-gray-200/50' 
                                : 'bg-white/5 border border-white/5'
                              }
                              hover:border-opacity-30 hover:shadow-sm
                            `}
                            style={{
                              borderRadius: `${config.cornerRadius}px`,
                              padding: config.device === 'mobile' ? '12px' : config.device === 'tablet' ? '16px' : '20px',
                            }}>
                              {renderComponent(type)}
                            </div>
                          </DraggableBlock>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>

              {/* Footer */}
              <div className={`p-4 border-t ${isLight ? 'border-gray-200 bg-gray-50' : 'border-white/5 bg-[#0F0F11]'} text-center`}>
                <p className={`text-[9px] leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-600'}`}>
                  By signing in, you agree to the{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onToast('Opening Terms...')
                    }}
                    className={`${isLight ? 'text-gray-500 hover:text-purple-600' : 'text-gray-400 hover:text-purple-400'} underline ${isLight ? 'decoration-gray-400' : 'decoration-gray-700'}`}
                  >
                    Terms of Service
                  </a>{' '}
                  protected by Hyperkit.
                </p>
              </div>

              {/* Home Indicator */}
              <div className="h-4 w-full flex justify-center items-center pb-2">
                <div className={`w-24 h-1 rounded-full ${isLight ? 'bg-gray-300' : 'bg-white/20'}`}></div>
              </div>
            </div>
          </div>
        ) : (
          /* Code Preview */
          <div ref={codePreviewRef} className="w-full max-w-2xl h-full flex-col">
            <div className="bg-[#0F0F11] border border-white/10 rounded-xl overflow-hidden h-full flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2 bg-[#1C1C1E] border-b border-white/5">
                <div className="flex gap-4">
                  <button
                    onClick={() => setCodeView('react')}
                    className={`text-xs font-medium pb-2 px-1 transition-colors ${
                      codeView === 'react'
                        ? 'text-white border-b-2 border-purple-500'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    React
                  </button>
                  <button
                    onClick={() => setCodeView('json')}
                    className={`text-xs font-medium pb-2 px-1 transition-colors ${
                      codeView === 'json'
                        ? 'text-white border-b-2 border-purple-500'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    Config JSON
                  </button>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const code = codeView === 'react' ? generateReactCode(config) : JSON.stringify(config, null, 2)
                      await navigator.clipboard.writeText(code)
                      onToast(`${codeView === 'react' ? 'React' : 'JSON'} Code Copied!`)
                    } catch (error) {
                      onToast('Failed to copy code')
                    }
                  }}
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label="Copy code"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-[#0A0A0B] font-mono text-xs leading-relaxed custom-scrollbar">
                {codeView === 'react' ? (
                  <ReactCodePreview config={config} />
                ) : (
                  <JSONCodePreview config={config} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
