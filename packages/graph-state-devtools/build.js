const esbuild = require('esbuild');

esbuild.buildSync({
  entryPoints: [
    './src/index.tsx',
  ],
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  bundle: true,
  platform: 'browser',
  outfile: './dist/index.js',
  target: 'es2017'
});
