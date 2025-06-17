import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'public/models',
          dest: '' // will copy to dist/models
        },
      ]
    })
  ]
})
