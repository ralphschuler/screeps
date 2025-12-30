import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import screeps from 'rollup-plugin-screeps';

let config;
try {
  config = require('./.screeps.json');
} catch (e) {
  config = null;
}

export default {
  input: 'main.ts',
  output: {
    file: 'dist/main.js',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    config && screeps({ config: config.main, dryRun: false })
  ]
};
