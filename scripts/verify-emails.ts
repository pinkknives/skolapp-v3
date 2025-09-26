import fs from 'node:fs'
import path from 'node:path'

function readTemplate(relPath: string): string {
  const p = path.join(process.cwd(), relPath)
  return fs.readFileSync(p, 'utf8')
}

function render(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_m, rawKey) => {
    const key = String(rawKey).trim().replace(/^\./, '')
    return vars[key] ?? ''
  })
}

function preview(name: 'confirm' | 'magic' | 'reset') {
  const file = `emails/auth/${name}.mdx`
  const tpl = readTemplate(file)
  const out = render(tpl, {
    ConfirmationURL: 'https://example.test/confirm?token=demo',
    MagicLink: 'https://example.test/magic?token=demo',
    RecoveryURL: 'https://example.test/reset?token=demo',
    EmailOTPExp: '15'
  })
  console.log(`\n==== ${name.toUpperCase()} TEMPLATE PREVIEW ====\n`)
  console.log(out)
}

preview('confirm')
preview('magic')
preview('reset')
