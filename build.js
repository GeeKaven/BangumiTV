import * as esbuild from 'esbuild';
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

const banner = [`/*! BangumiTV v${pkg.version}`,
  'GeeKaven (https://tawawa.moe)',
  'https://bangumi-tv.vercel.app',
`${pkg.license} License */`
].join(' | ');

esbuild.buildSync({
  entryPoints: ['public/src/bangumi.js'],
  minify: true,
  target: 'es2015',
  banner: {
    js: banner,
  },
  outdir: 'dist',
})

esbuild.buildSync({
  entryPoints: ['public/src/bangumi.css'],
  minify: true,
  banner: {
    css: banner
  },
  outdir: 'dist',
})