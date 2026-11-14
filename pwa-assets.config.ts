import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// One-time icon generation from public/icon.svg: `npx pwa-assets-generator`.
export default defineConfig({
  preset: { ...minimal2023Preset, maskable: { ...minimal2023Preset.maskable, padding: 0.15, resizeOptions: { background: '#07090c' } } },
  images: ['public/icon.svg'],
})
