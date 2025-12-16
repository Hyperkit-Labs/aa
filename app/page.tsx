'use client'

import { useState, useCallback, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Toast, ToastType } from '@/components/Toast'
import { Preview } from '@/components/Preview'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { WalletConfig, PRESETS } from '@/lib/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { validateConfig } from '@/lib/validation'

const defaultConfig: WalletConfig = {
  email: true,
  sms: false,
  social: true,
  passkey: true,
  external: true,
  limits: true,
  mode: 'ui',
  preset: 'full',
  theme: 'dark',
  primaryColor: '#9333EA',
  networks: ['Hyperion'],
  device: 'mobile',
  advancedOptions: false,
  componentOrder: ['email', 'sms', 'social', 'passkey', 'external'],
  accountType: 'eip7702',
  entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  paymaster: false,
  persistence: 'device',
  duration: '1hour',
  spendingLimit: 1000,
  spendingLimitCurrency: 'USD',
  cornerRadius: 12,
  fontFamily: 'Inter',
  customLogo: null,
  customLogoEnabled: false,
  customLogoReplaceTitle: false,
}

export default function Home() {
  const [config, setConfig] = useLocalStorage<WalletConfig>('wallet-config', defaultConfig)
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: ToastType }>({ 
    show: false, 
    message: '',
    type: 'success'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleConfigChange = useCallback((updates: Partial<WalletConfig>) => {
    const newConfig = { ...config, ...updates }
    const validation = validateConfig(updates)
    
    if (!validation.valid) {
      showToast(validation.errors[0], 'error')
      return
    }
    
    setConfig(newConfig)
  }, [config, setConfig])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ show: true, message, type })
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }))
  }, [])

  const handleCopyConfig = useCallback(async () => {
    try {
      const configJson = JSON.stringify(config, null, 2)
      await navigator.clipboard.writeText(configJson)
      showToast('JSON copied to clipboard!', 'success')
    } catch (error) {
      console.error('Failed to copy config:', error)
      showToast('Failed to copy. Please try again.', 'error')
    }
  }, [config, showToast])

  const handleCopyReact = useCallback(async () => {
    try {
      const reactCode = `<SmartWalletAuth
  email={${config.email}}
  sms={${config.sms}}
  social={${config.social}}
  passkey={${config.passkey}}
  wallets={{
    smartAccount: "eip7702",
    external: ${config.external},
    providers: ["smartWallet", "metamask", "coinbase"]
  }}
  networks={[${config.networks.map((n) => `"${n.toLowerCase()}"`).join(', ')}]}
  branding={{
    theme: "${config.theme}",
    primaryColor: "${config.primaryColor}",
    cornerRadius: "xl"
  }}
/>`
      await navigator.clipboard.writeText(reactCode)
      showToast('React Component copied!', 'success')
    } catch (error) {
      console.error('Failed to copy React code:', error)
      showToast('Failed to copy. Please try again.', 'error')
    }
  }, [config, showToast])

  return (
    <ErrorBoundary>
      <div className="bg-[#030305] text-white antialiased font-['Inter'] h-screen w-full flex flex-col overflow-hidden text-sm selection:bg-purple-500/30">
        <Toast 
          message={toast.message} 
          show={toast.show} 
          type={toast.type}
          onHide={hideToast} 
        />
        <Header onToast={showToast} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar
            config={config}
            onConfigChange={handleConfigChange}
            onToast={showToast}
            onCopyConfig={handleCopyConfig}
            onCopyReact={handleCopyReact}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <Preview config={config} onConfigChange={handleConfigChange} onToast={showToast} />
        </div>
      </div>
    </ErrorBoundary>
  )
}

