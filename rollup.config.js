import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import { string } from 'rollup-plugin-string';
import svg from 'rollup-plugin-svg';

const configurePath = ({inputPath, outputPath}) => ({
  input: inputPath,
  output: {
    file: outputPath,
    format: 'esm',
    sourcemap: true,
  },
  plugins: getPlugins(),
});

function getPlugins() {
  return [
    svg(),
    string({
      include: '**/template.html',
    }),
    postcss({
      extensions: ['.scss'],
      extract: 'main.min.css',
      minimize: true,
      sourceMap: true,
    }),
    terser(),
    resolve(),
    babel({ babelHelpers: 'bundled' })
  ];
}

const config = [
  {
    inputPath: 'main.js',
    outputPath: 'dist/main.min.js',
  },
]
.map(configurePath);

export default config;
