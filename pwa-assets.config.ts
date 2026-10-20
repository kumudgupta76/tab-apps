import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

const bg = { background: '#0b1026' }

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: bg },
    apple: { ...minimal2023Preset.apple, resizeOptions: bg },
  },
  images: ['public/icon.svg'],
})
