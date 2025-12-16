'use client'

import { useState, useRef, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'

type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

// Color conversion utilities
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0
  let g = 0
  let b = 0

  if (0 <= h && h < 60) {
    r = c
    g = x
    b = 0
  } else if (60 <= h && h < 120) {
    r = x
    g = c
    b = 0
  } else if (120 <= h && h < 180) {
    r = 0
    g = c
    b = x
  } else if (180 <= h && h < 240) {
    r = 0
    g = x
    b = c
  } else if (240 <= h && h < 300) {
    r = x
    g = 0
    b = c
  } else if (300 <= h && h < 360) {
    r = c
    g = 0
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function parseColorString(color: string): { r: number; g: number; b: number; a?: number } | null {
  // HEX
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color)
    return rgb ? { ...rgb } : null
  }

  // RGB/RGBA
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1])
    const g = parseInt(rgbMatch[2])
    const b = parseInt(rgbMatch[3])
    const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined
    return { r, g, b, ...(a !== undefined && { a }) }
  }

  // HSL
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i)
  if (hslMatch) {
    const h = parseInt(hslMatch[1])
    const s = parseInt(hslMatch[2])
    const l = parseInt(hslMatch[3])
    return hslToRgb(h, s, l)
  }

  return null
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [format, setFormat] = useState<ColorFormat>('hex')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const presetColors = [
    '#9333EA', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#84CC16', // Lime
    '#6366F1', // Indigo
  ]

  // Parse current color value
  const currentColor = parseColorString(value) || { r: 147, g: 51, b: 234 }
  const rgb = hexToRgb(value) || currentColor
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  // Format-specific values
  const [hexValue, setHexValue] = useState(value.toUpperCase())
  const [rgbValues, setRgbValues] = useState({ r: rgb.r, g: rgb.g, b: rgb.b })
  const [rgbaValues, setRgbaValues] = useState({ r: rgb.r, g: rgb.g, b: rgb.b, a: 1 })
  const [hslValues, setHslValues] = useState({ h: hsl.h, s: hsl.s, l: hsl.l })

  // Update format values when value changes
  useEffect(() => {
    const parsed = parseColorString(value)
    if (parsed) {
      const hex = rgbToHex(parsed.r, parsed.g, parsed.b)
      setHexValue(hex.toUpperCase())
      setRgbValues({ r: parsed.r, g: parsed.g, b: parsed.b })
      setRgbaValues({ r: parsed.r, g: parsed.g, b: parsed.b, a: parsed.a ?? 1 })
      const newHsl = rgbToHsl(parsed.r, parsed.g, parsed.b)
      setHslValues({ h: newHsl.h, s: newHsl.s, l: newHsl.l })
    }
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleFormatChange = (newFormat: ColorFormat) => {
    setFormat(newFormat)
  }

  const handleHexChange = (hex: string) => {
    const cleanHex = hex.replace('#', '').toUpperCase()
    if (cleanHex.length <= 6 && /^[0-9A-F]*$/.test(cleanHex)) {
      setHexValue(cleanHex)
      if (cleanHex.length === 6) {
        const fullHex = '#' + cleanHex
        onChange(fullHex)
      }
    }
  }

  const handleRgbChange = (channel: 'r' | 'g' | 'b', val: number) => {
    const newValues = { ...rgbValues, [channel]: Math.max(0, Math.min(255, val)) }
    setRgbValues(newValues)
    onChange(`rgb(${newValues.r}, ${newValues.g}, ${newValues.b})`)
  }

  const handleRgbaChange = (channel: 'r' | 'g' | 'b' | 'a', val: number) => {
    const newValues = {
      ...rgbaValues,
      [channel]: channel === 'a' ? Math.max(0, Math.min(1, val)) : Math.max(0, Math.min(255, val)),
    }
    setRgbaValues(newValues)
    onChange(`rgba(${newValues.r}, ${newValues.g}, ${newValues.b}, ${newValues.a})`)
  }

  const handleHslChange = (channel: 'h' | 's' | 'l', val: number) => {
    const newValues = {
      ...hslValues,
      [channel]: channel === 'h' ? Math.max(0, Math.min(360, val)) : Math.max(0, Math.min(100, val)),
    }
    setHslValues(newValues)
    const rgb = hslToRgb(newValues.h, newValues.s, newValues.l)
    onChange(rgbToHex(rgb.r, rgb.g, rgb.b))
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getFormattedValue = (): string => {
    switch (format) {
      case 'hex':
        return value.toUpperCase()
      case 'rgb':
        return `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`
      case 'rgba':
        return `rgba(${rgbaValues.r}, ${rgbaValues.g}, ${rgbaValues.b}, ${rgbaValues.a})`
      case 'hsl':
        return `hsl(${hslValues.h}, ${hslValues.s}%, ${hslValues.l}%)`
      default:
        return value
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => {
          setShowTooltip(false)
        }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-6 h-6 rounded border border-white/20 shadow-inner cursor-pointer relative flex-shrink-0"
        style={{ backgroundColor: value }}
        aria-label="Open color picker"
      >
        {showTooltip && !isOpen && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 border-2 border-purple-500/50 rounded-lg text-xs font-semibold text-white whitespace-nowrap z-50 pointer-events-none shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border-2 border-white/30 shadow-inner"
                style={{ backgroundColor: value }}
              />
              <span className="font-mono">{value.toUpperCase()}</span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-3 h-3 bg-gray-900 border-r-2 border-b-2 border-purple-500/50 rotate-45"></div>
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#1C1C1E] border border-white/10 rounded-lg p-4 shadow-2xl w-80 max-h-[600px] overflow-y-auto">
          {/* Preset Colors */}
          <div className="mb-4">
            <div className="text-[10px] text-gray-400 uppercase font-semibold mb-3 tracking-wider">Set Colors</div>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onChange(color)
                  }}
                  className={`w-9 h-9 rounded border-2 transition-all hover:scale-110 relative ${
                    value.toUpperCase() === color.toUpperCase()
                      ? 'border-white shadow-lg ring-2 ring-purple-500/50 scale-110'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                >
                  {value.toUpperCase() === color.toUpperCase() && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Native Color Picker */}
          <div className="mb-4">
            <div className="text-[10px] text-gray-400 uppercase font-semibold mb-3 tracking-wider">Color Picker</div>
            <div className="relative">
              <input
                ref={inputRef}
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-12 rounded-lg cursor-pointer border-2 border-white/20 hover:border-purple-500/50 transition-colors"
              />
              <div className="absolute inset-0 rounded-lg pointer-events-none border-2 border-transparent hover:border-purple-500/30 transition-colors"></div>
            </div>
          </div>

          {/* Format Selector */}
          <div className="mb-4">
            <div className="text-[10px] text-gray-400 uppercase font-semibold mb-3 tracking-wider">Color Format</div>
            <div className="flex gap-1 bg-[#0F0F11] p-1 rounded-lg border border-white/5">
              {(['hex', 'rgb', 'rgba', 'hsl'] as ColorFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleFormatChange(fmt)}
                  className={`flex-1 px-3 py-2 text-[10px] font-semibold rounded-md transition-all uppercase tracking-wide ${
                    format === fmt
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Format-Specific Inputs */}
          <div className="mb-4">
            <div className="text-[10px] text-gray-400 uppercase font-semibold mb-3 tracking-wider">Manual Input</div>

            {format === 'hex' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-semibold">#</span>
                  <input
                    type="text"
                    value={hexValue.replace('#', '')}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#0F0F11] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    placeholder="9333EA"
                    maxLength={6}
                  />
                  <button
                    onClick={() => handleCopy(getFormattedValue())}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5 hover:border-white/10"
                    aria-label="Copy color value"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                    )}
                  </button>
                </div>
                <div className="text-[10px] text-gray-500 font-mono px-1">
                  {getFormattedValue()}
                </div>
              </div>
            )}

            {format === 'rgb' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-xs font-semibold w-8">R:</span>
                  <input
                    type="number"
                    value={rgbValues.r}
                    onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-[#0F0F11] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                    min="0"
                    max="255"
                  />
                  <input
                    type="range"
                    value={rgbValues.r}
                    onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                    className="w-16 accent-red-500"
                    min="0"
                    max="255"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-xs font-semibold w-8">G:</span>
                  <input
                    type="number"
                    value={rgbValues.g}
                    onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-[#0F0F11] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                    min="0"
                    max="255"
                  />
                  <input
                    type="range"
                    value={rgbValues.g}
                    onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                    className="w-16 accent-green-500"
                    min="0"
                    max="255"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-xs font-semibold w-8">B:</span>
                  <input
                    type="number"
                    value={rgbValues.b}
                    onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-[#0F0F11] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    min="0"
                    max="255"
                  />
                  <input
                    type="range"
                    value={rgbValues.b}
                    onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                    className="w-16 accent-blue-500"
                    min="0"
                    max="255"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <span className="text-gray-300 text-xs font-mono flex-1">{getFormattedValue()}</span>
                  <button
                    onClick={() => handleCopy(getFormattedValue())}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5 hover:border-white/10"
                    aria-label="Copy color value"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {format === 'rgba' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-xs font-semibold w-8">R:</span>
                  <input
                    type="number"
                    value={rgbaValues.r}
                    onChange={(e) => handleRgbaChange('r', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-[#0F0F11] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                    min="0"
                    max="255"
                  />
                  <input
                    type="range"
                    value={rgbaValues.r}
                    onChange={(e) => handleRgbaChange('r', parseInt(e.target.value))}
                    className="w-16 accent-red-500"
                    min="0"
                    max="255"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-xs font-semibold w-8">G:</span>
                  <input
                    type="number"
                    value={rgbaValues.g}
                    onChange={(e) => handleRgbaChange('g', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-[#0F0F11] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                    min="0"
                    max="255"
                  />
                  <input
                    type="range"
                    value={rgbaValues.g}
                    onChange={(e) => handleRgbaChange('g', parseInt(e.target.value))}
                    className="w-16 accent-green-500"
                    min="0"
                    max="255"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-xs font-semibold w-8">B:</span>
                  <input
                    type="number"
                    value={rgbaValues.b}
                    onChange={(e) => handleRgbaChange('b', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-[#0F0F11] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    min="0"
                    max="255"
                  />
                  <input
                    type="range"
                    value={rgbaValues.b}
                    onChange={(e) => handleRgbaChange('b', parseInt(e.target.value))}
                    className="w-16 accent-blue-500"
                    min="0"
                    max="255"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-semibold w-8">A:</span>
                  <input
                    type="number"
                    value={rgbaValues.a}
                    onChange={(e) => handleRgbaChange('a', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-[#0F0F11] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    min="0"
                    max="1"
                    step="0.01"
                  />
                  <input
                    type="range"
                    value={rgbaValues.a}
                    onChange={(e) => handleRgbaChange('a', parseFloat(e.target.value))}
                    className="w-16 accent-purple-500"
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <span className="text-gray-300 text-xs font-mono flex-1">{getFormattedValue()}</span>
                  <button
                    onClick={() => handleCopy(getFormattedValue())}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5 hover:border-white/10"
                    aria-label="Copy color value"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {format === 'hsl' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-semibold w-8">H:</span>
                  <input
                    type="number"
                    value={hslValues.h}
                    onChange={(e) => handleHslChange('h', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-[#0F0F11] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    min="0"
                    max="360"
                  />
                  <input
                    type="range"
                    value={hslValues.h}
                    onChange={(e) => handleHslChange('h', parseInt(e.target.value))}
                    className="w-16 accent-purple-500"
                    min="0"
                    max="360"
                  />
                  <span className="text-gray-500 text-xs w-4">°</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-semibold w-8">S:</span>
                  <input
                    type="number"
                    value={hslValues.s}
                    onChange={(e) => handleHslChange('s', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-[#0F0F11] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    min="0"
                    max="100"
                  />
                  <input
                    type="range"
                    value={hslValues.s}
                    onChange={(e) => handleHslChange('s', parseInt(e.target.value))}
                    className="w-16 accent-purple-500"
                    min="0"
                    max="100"
                  />
                  <span className="text-gray-500 text-xs w-4">%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-semibold w-8">L:</span>
                  <input
                    type="number"
                    value={hslValues.l}
                    onChange={(e) => handleHslChange('l', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-[#0F0F11] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    min="0"
                    max="100"
                  />
                  <input
                    type="range"
                    value={hslValues.l}
                    onChange={(e) => handleHslChange('l', parseInt(e.target.value))}
                    className="w-16 accent-purple-500"
                    min="0"
                    max="100"
                  />
                  <span className="text-gray-500 text-xs w-4">%</span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <span className="text-gray-300 text-xs font-mono flex-1">{getFormattedValue()}</span>
                  <button
                    onClick={() => handleCopy(getFormattedValue())}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5 hover:border-white/10"
                    aria-label="Copy color value"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current Color Display */}
          <div className="pt-4 border-t border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-semibold mb-3 tracking-wider">Current Color</div>
            <div className="flex items-center justify-between p-3 bg-[#0F0F11] rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-white/20 shadow-inner ring-2 ring-purple-500/20"
                  style={{ backgroundColor: value }}
                />
                <div>
                  <div className="text-xs font-mono text-white font-semibold">{getFormattedValue()}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Click to copy</div>
                </div>
              </div>
              <button
                onClick={() => handleCopy(getFormattedValue())}
                className="p-2.5 hover:bg-white/5 rounded-lg transition-colors border border-white/5 hover:border-white/10 hover:scale-105"
                aria-label="Copy color value"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                )}
              </button>
            </div>
          </div>
          </div>
        </>
      )}
    </div>
  )
}
