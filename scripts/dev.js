const args = require('minimist')(process.argv.slice(2))
const { resolve } = require('path')
const { build } = require('esbuild')
// console.log(args)

const target = args.p || 'reactivity'
const f = args.f || 'global'

const pkg = require(resolve(__dirname,`../packages/${target}/package.json`))

// iife 立即执行函数
// cjs node中模块
// esm 浏览器esModule
const format = f.startsWith('global') ? 'iife': f === 'cjs'? 'cjs': 'esm'

const outfile = resolve(__dirname,`../packages/${target}/dist/${target}.${f}.js`)

build({
  entryPoints: [resolve(__dirname,`../packages/${target}/src/index.ts`)],
  outfile,
  format, 
  bundle: true,
  sourcemap: true,
  globalName: pkg.buildOptions.name, // 打包全局的名字
  platform: format === 'cjs'?'node': 'browser',
  watch: {
    onRebuild: (error)=>{
      if(error){
        console.log('onRebuild error')
      }else{
        console.log('onRebuild ......')
      }
    }
  }
}).then(()=>{
  console.log('watching ....')
})