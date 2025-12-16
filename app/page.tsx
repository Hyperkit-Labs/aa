'use client'

import { useState, useCallback } from 'react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Toast } from '@/components/Toast'
import { Preview } from '@/components/Preview'
import { WalletConfig, PRESETS } from '@/lib/types'

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
}

export default function Home() {
  const [config, setConfig] = useState<WalletConfig>(defaultConfig)
  const [toast, setToast] = useState({ show: false, message: '' })

  const handleConfigChange = useCallback((updates: Partial<WalletConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }, [])

  const showToast = useCallback((message: string) => {
    setToast({ show: true, message })
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }))
  }, [])

  const handleCopyConfig = useCallback(() => {
    const configJson = JSON.stringify(config, null, 2)
    navigator.clipboard.writeText(configJson)
    showToast('JSON copied to clipboard!')
  }, [config, showToast])

  const handleCopyReact = useCallback(() => {
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
    navigator.clipboard.writeText(reactCode)
    showToast('React Component copied!')
  }, [config, showToast])

  return (
    <div className="bg-[#030305] text-white antialiased font-['Inter'] h-screen w-full flex flex-col overflow-hidden text-sm selection:bg-purple-500/30">
      <Toast message={toast.message} show={toast.show} onHide={hideToast} />
      <Header onToast={showToast} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          config={config}
          onConfigChange={handleConfigChange}
          onToast={showToast}
          onCopyConfig={handleCopyConfig}
          onCopyReact={handleCopyReact}
        />
        <Preview config={config} onConfigChange={handleConfigChange} onToast={showToast} />
      </div>
    </div>
  )
}

