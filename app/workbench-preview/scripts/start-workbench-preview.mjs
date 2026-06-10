import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const frontendCommand = process.platform === 'win32' ? 'cmd.exe' : 'npm'
const frontendArgs = process.platform === 'win32' ? ['/c', 'npm', 'run', 'frontend'] : ['run', 'frontend']

const children = []
let shuttingDown = false

function start(label, command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd: appRoot,
    env: {
      ...process.env,
      ...extraEnv,
    },
    stdio: 'inherit',
  })
  children.push(child)
  child.on('error', (error) => {
    if (shuttingDown) return
    console.error(`${label} failed to start: ${error.message}`)
    shutdown(1)
  })
  child.on('exit', (code, signal) => {
    if (shuttingDown) return
    console.log(`${label} exited with code=${code} signal=${signal}`)
    shutdown(code || 0)
  })
}

function shutdown(code = 0) {
  shuttingDown = true
  for (const child of children) {
    if (child.exitCode === null) {
      child.kill()
    }
  }
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

start('local-ai-backend', process.execPath, ['server/api-server.mjs'], {
  HOST: '127.0.0.1',
  PORT: '4310',
})
start('vite-workbench', frontendCommand, frontendArgs)
