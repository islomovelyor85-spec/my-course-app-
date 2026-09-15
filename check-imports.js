import fs from 'fs'
import path from 'path'

function walk(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === 'dist') continue
    const p = path.join(dir, f)
    const stat = fs.statSync(p)
    if (stat.isDirectory()) {
      walk(p, list)
    } else if (/\.(jsx?|tsx?)$/.test(f)) {
      list.push(p)
    }
  }
  return list
}

const srcDir = path.join(process.cwd(), 'src')
if (!fs.existsSync(srcDir)) {
  console.error('src papkasi topilmadi.')
  process.exit(1)
}

const files = walk(srcDir)
const importRe = /(?:from|import)\s+['"](\.[^'"]+)['"]/g

let brokenCount = 0
let checkedCount = 0

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  let m
  while ((m = importRe.exec(content))) {
    const importPath = m[1]
    checkedCount++
    const base = path.resolve(path.dirname(file), importPath)
    const candidates = [
      base,
      base + '.js',
      base + '.jsx',
      base + '.ts',
      base + '.tsx',
      path.join(base, 'index.js'),
      path.join(base, 'index.jsx')
    ]
    const exists = candidates.some((c) => fs.existsSync(c) && fs.statSync(c).isFile())
    if (!exists) {
      brokenCount++
      const rel = path.relative(process.cwd(), file)
      console.log('XATO: ' + rel + '  ->  import "' + importPath + '" topilmadi')
    }
  }
}

console.log('----------------------------------------')
console.log('Tekshirildi: ' + checkedCount + ' ta import, ' + files.length + ' ta faylda')
if (brokenCount === 0) {
  console.log('Barcha import yollari togri')
} else {
  console.log(brokenCount + ' ta buzilgan import topildi (yuqorida)')
}
