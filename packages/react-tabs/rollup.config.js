/**
 * Created with Webstrom.
 * Author: 刘云
 * Date: 2019/8/5
 * Time: 21:25
 *
 */
import typescript from 'rollup-plugin-typescript2';
import {uglify} from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import less from 'rollup-plugin-less';
import pkg from './package.json';

const typescriptConfig = {
  cacheRoot: 'tmp/.rpt2_cache',
  typescript: require('typescript')
};

const noDeclarationConfig = Object.assign({}, typescriptConfig, {
  tsconfigOverride: { compilerOptions: { declaration: false } }
});

const makeExternalPredicate = externalArr => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return id => pattern.test(id);
};

const deps = Object.keys(pkg.dependencies || {});
const peerDeps = Object.keys(pkg.peerDependencies || {});

const config = {
  input: 'src/index.ts',
  external: makeExternalPredicate(deps.concat(peerDeps))
};

const umd = Object.assign({}, config, {
  output: {
    file: 'dist/react-carousel.js',
    format: 'umd',
    name: 'scroll',
    exports: 'named',
  },
  external: makeExternalPredicate(peerDeps),
  plugins: [
    resolve(),
    typescript(noDeclarationConfig),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    less()
  ]
});

const umdProd = Object.assign({}, umd, {
  output: Object.assign({}, umd.output, {
    file: pkg.unpkg,
  }),
  plugins: [
    resolve(),
    typescript(noDeclarationConfig),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    uglify()
  ]
});

const es = Object.assign({}, config, {
  output: {
    file: pkg.module,
    format: 'es',
    exports: 'named'
  },
  plugins: [resolve(), typescript(noDeclarationConfig)]
});

const cjs = Object.assign({}, config, {
  output: {
    file: pkg.main,
    format: 'cjs',
    exports: 'named'
  },
  plugins: [resolve(), typescript(typescriptConfig)]
});

export default [umd, umdProd, es, cjs];
// export default [es, cjs];
