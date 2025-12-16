export type ComponentType = 'email' | 'sms' | 'social' | 'passkey' | 'external'
export type AccountType = 'eip7702' | 'erc4337' | 'safe' | 'argent'
export type PersistenceType = 'device' | 'session' | 'localStorage'
export type DurationType = '1hour' | '24hours' | '7days' | '30days' | 'permanent'
export type FontFamily = 'Inter' | 'Roboto' | 'Poppins' | 'Montserrat' | 'Open Sans'

export interface WalletConfig {
  email: boolean
  sms: boolean
  social: boolean
  passkey: boolean
  external: boolean
  limits: boolean
  mode: 'ui' | 'code'
  preset: 'full' | 'simple' | 'wallet'
  theme: 'dark' | 'light'
  primaryColor: string
  networks: string[]
  device: 'mobile' | 'tablet' | 'desktop'
  advancedOptions: boolean
  componentOrder: ComponentType[]
  // ERC4337 Configuration
  accountType: AccountType
  entryPoint: string
  paymaster: boolean
  // Sessions & Limits
  persistence: PersistenceType
  duration: DurationType
  spendingLimit: number
  spendingLimitCurrency: string
  // Branding Advanced
  cornerRadius: number
  fontFamily: FontFamily
  customLogo: string | null
  customLogoEnabled: boolean
  customLogoReplaceTitle: boolean
  // Enhanced Logo Configuration
  logoSize: 'small' | 'medium' | 'large' | 'xlarge' | 'custom'
  logoCustomSize: number
  logoWidth?: number
  logoHeight?: number
  logoMaintainAspectRatio: boolean
  logoPositionHorizontal: 'left' | 'center' | 'right'
  logoPositionVertical: 'top' | 'middle' | 'bottom'
  logoSpacingTop: number
  logoSpacingBottom: number
  logoSpacingLeft: number
  logoSpacingRight: number
  logoOpacity: number
  logoBorderRadius: number
  logoShadowEnabled: boolean
  logoShadowColor: string
  logoShadowBlur: number
  logoShadowOffsetX: number
  logoShadowOffsetY: number
  logoHeaderHeight: number
  logoHeaderBackgroundColor: string
  logoHeaderPaddingHorizontal: number
  logoHeaderPaddingVertical: number
  logoHeaderBorderEnabled: boolean
  logoHeaderBorderColor: string
  logoHeaderBorderWidth: number
  logoResponsiveMobile: number
  logoResponsiveTablet: number
  logoResponsiveDesktop: number
  logoAnimation: 'none' | 'fade' | 'slide' | 'scale'
}

export type PresetType = 'full' | 'simple' | 'wallet'

export const PRESETS: Record<PresetType, Partial<WalletConfig>> = {
  full: {
    email: true,
    sms: true,
    social: true,
    passkey: true,
    external: true,
    componentOrder: ['email', 'sms', 'social', 'passkey', 'external'],
  },
  simple: {
    email: true,
    sms: false,
    social: true,
    passkey: false,
    external: false,
    componentOrder: ['email', 'social'],
  },
  wallet: {
    email: false,
    sms: false,
    social: false,
    passkey: false,
    external: true,
    componentOrder: ['external'],
  },
}

