import { resolve } from 'path'
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        communication: resolve(__dirname, 'sample-apps/communication/index.html'),
        helloWorld: resolve(__dirname, 'sample-apps/hello-world/index.html'),
        messaging: resolve(__dirname, 'sample-apps/messaging/index.html'),
        iot: resolve(__dirname, 'sample-apps/iot/index.html')
      },
    },
  },
  base: '',
  server: {
    port: 8084
  },
  plugins: [
    basicSsl()
  ]
})