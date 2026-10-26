import { existsSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import dotenv from 'dotenv'

const projectRoot = process.cwd()
const envMainPath = path.join(projectRoot, '.env')
const composePath = path.join(projectRoot, 'docker-compose.store.yml')

// Discover all store files: .env.<store>
export const getAvailableStores = () => {
  const files = readdirSync(projectRoot)
  const stores = []

  for (const file of files) {
    if (
      file.startsWith('.env.') &&
      !file.endsWith('.example') &&
      !file.endsWith('.bak') &&
      !file.endsWith('.local') &&
      !file.includes('.production')
    ) {
      const storeName = file.replace('.env.', '')
      const fullPath = path.join(projectRoot, file)
      try {
        const parsed = dotenv.parse(readFileSync(fullPath, 'utf-8'))
        let dbPort = parsed.POSTGRES_PORT
        let dbName = parsed.POSTGRES_DB
        if (parsed.DATABASE_URI) {
          try {
            const u = new URL(parsed.DATABASE_URI.replace(/^postgres(ql)?:\/\//, 'http://'))
            if (!dbPort && u.port) dbPort = u.port
            if (!dbName && u.pathname) dbName = u.pathname.replace(/^\//, '').split('?')[0]
          } catch {}
        }
        stores.push({
          name: storeName,
          file,
          fullPath,
          siteName: parsed.SITE_NAME || parsed.NEXT_PUBLIC_SITE_NAME || storeName,
          port: parsed.PORT || '3000',
          dbUri: parsed.DATABASE_URI || '',
          dbPort: dbPort || '5432',
          dbName: dbName || 'postgres',
          dbUser: parsed.POSTGRES_USER || 'postgres',
          composeProject: parsed.COMPOSE_PROJECT_NAME || `${storeName}-local`
        })
      } catch (err) {
        // Skip unparseable files
      }
    }
  }

  return stores.sort((a, b) => a.name.localeCompare(b.name))
}

// Determine active store by checking .env
export const getActiveStoreName = (stores) => {
  if (!existsSync(envMainPath)) return null

  try {
    const content = readFileSync(envMainPath, 'utf-8')
    const match = content.match(/#\s*\[ACTIVE STORE:\s*([a-zA-Z0-9_-]+)\]/i)
    if (match && match[1]) {
      return match[1]
    }

    // Fallback: match by DATABASE_URI or COMPOSE_PROJECT_NAME
    const currentEnv = dotenv.parse(content)
    for (const s of stores) {
      if (
        (currentEnv.DATABASE_URI && currentEnv.DATABASE_URI === s.dbUri) ||
        (currentEnv.COMPOSE_PROJECT_NAME && currentEnv.COMPOSE_PROJECT_NAME === s.composeProject)
      ) {
        return s.name
      }
    }
  } catch {
    return null
  }

  return null
}

const printStatus = (stores, activeStoreName) => {
  console.log('\n======================================================')
  console.log('STORE CONFIGURATION STATUS (shop-backend)')
  console.log('======================================================')
  if (activeStoreName) {
    const active = stores.find(s => s.name === activeStoreName)
    console.log(`\nActive store in .env: \x1b[32m\x1b[1m${activeStoreName}\x1b[0m`)
    if (active) {
      console.log(`  Site name:     ${active.siteName}`)
      console.log(`  Server port:   http://localhost:${active.port}`)
      console.log(`  Database:      ${active.dbName} (port ${active.dbPort})`)
    }
  } else {
    console.log('\nActive store is not set or .env file is missing.')
  }
  console.log('\nAvailable stores:')
  stores.forEach((s, idx) => {
    const isActive = s.name === activeStoreName
    const marker = isActive ? ' \x1b[32m[ACTIVE]\x1b[0m' : ''
    console.log(`  ${idx + 1}) \x1b[1m${s.name}\x1b[0m: "${s.siteName}" (port: ${s.port}, DB: ${s.dbPort})${marker}`)
  })
  console.log('======================================================\n')
}

export const switchStore = async (targetStoreName, options = { startDb: false, interactive: false }) => {
  const stores = getAvailableStores()
  const target = stores.find(s => s.name === targetStoreName)

  if (!target) {
    console.error(`\x1b[31mError: Store "${targetStoreName}" not found.\x1b[0m`)
    console.log('Available stores:', stores.map(s => s.name).join(', '))
    process.exit(1)
  }


  // Read target .env.<store>
  const originalContent = readFileSync(target.fullPath, 'utf-8')
  const banner = `# ==============================================================================
# [ACTIVE STORE: ${target.name}]
# Automatically generated from: .env.${target.name}
# Command: npm run switch ${target.name}
# ==============================================================================

`

  writeFileSync(envMainPath, banner + originalContent, 'utf-8')

  console.log(`\n\x1b[32m\x1b[1mActivated store: ${target.name}\x1b[0m`)
  console.log(`Copied file:   .env.${target.name} -> .env`)
  console.log(`Site name:     ${target.siteName}`)
  console.log(`Server URL:    http://localhost:${target.port}`)
  console.log(`Database:      ${target.dbName} (port: ${target.dbPort}, project: ${target.composeProject})`)

  let shouldStartDb = options.startDb

  if (options.interactive && !options.startDb) {
    const rl = readline.createInterface({ input, output })
    const answer = await rl.question(`\nStart database container (${target.composeProject}) in Docker? [y/N]: `)
    rl.close()
    if (answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes') {
      shouldStartDb = true
    }
  }

  if (shouldStartDb) {
    console.log(`\nStarting database container for ${target.name}...`)
    const result = spawnSync('docker', [
      'compose',
      '--env-file', target.fullPath,
      '-f', composePath,
      '--project-name', target.composeProject,
      'up', '-d', '--wait', 'db'
    ], { stdio: 'inherit', cwd: projectRoot })

    if (result.status === 0) {
      console.log(`\x1b[32mDatabase container for ${target.name} is running.\x1b[0m`)
    } else {
      console.log(`\x1b[33mWarning: Failed to start Docker container. Ensure Docker Desktop is running.\x1b[0m`)
    }
  }

  console.log('\n------------------------------------------------------')
  console.log('To start development server, run:')
  console.log('  \x1b[36mnpm run dev\x1b[0m')
  console.log('------------------------------------------------------\n')
}

export const restoreDb = (sqlFilePath) => {
  if (!sqlFilePath) {
    console.error('\x1b[31mError: Please provide path to the SQL backup file.\x1b[0m')
    console.log('Usage: npm run switch:restore <path/to/backup.sql>')
    process.exit(1)
  }

  const stores = getAvailableStores()
  const activeStoreName = getActiveStoreName(stores)
  if (!activeStoreName) {
    console.error('\x1b[31mError: No active store configured in .env. Run `npm run switch <store>` first.\x1b[0m')
    process.exit(1)
  }

  const store = stores.find(s => s.name === activeStoreName)
  const resolvedPath = path.isAbsolute(sqlFilePath) ? sqlFilePath : path.resolve(process.cwd(), sqlFilePath)

  if (!existsSync(resolvedPath)) {
    console.error(`\x1b[31mError: Backup file not found at: ${resolvedPath}\x1b[0m`)
    process.exit(1)
  }

  console.log(`\n======================================================`)
  console.log(`RESTORING DATABASE: ${store.name}`)
  console.log(`======================================================`)
  console.log(`Source file:     ${resolvedPath}`)
  console.log(`Target database: ${store.dbName} (project: ${store.composeProject})`)

  // Ensure container is running
  console.log('\nEnsuring database container is running...')
  const upResult = spawnSync('docker', [
    'compose',
    '--env-file', store.fullPath,
    '-f', composePath,
    '--project-name', store.composeProject,
    'up', '-d', '--wait', 'db'
  ], { stdio: 'inherit', cwd: projectRoot })

  if (upResult.status !== 0) {
    console.error('\x1b[31mError: Could not start Docker database container.\x1b[0m')
    process.exit(1)
  }

  console.log('Importing SQL dump into PostgreSQL...')
  const fileContent = readFileSync(resolvedPath)
  const result = spawnSync('docker', [
    'compose',
    '--env-file', store.fullPath,
    '-f', composePath,
    '--project-name', store.composeProject,
    'exec', '-T', 'db',
    'psql', '-U', store.dbUser, '-d', store.dbName
  ], { input: fileContent, stdio: ['pipe', 'inherit', 'inherit'], cwd: projectRoot })

  if (result.status === 0) {
    console.log(`\x1b[32m\x1b[1mSuccessfully restored database for ${store.name}!\x1b[0m\n`)
  } else {
    console.error(`\x1b[31mFailed to restore database. See error output above.\x1b[0m\n`)
    process.exit(1)
  }
}

// Main execution
const main = async () => {
  const args = process.argv.slice(2)
  const command = args[0]
  const stores = getAvailableStores()
  const activeStoreName = getActiveStoreName(stores)

  if (command === 'status' || command === 'list') {
    printStatus(stores, activeStoreName)
    return
  }

  if (command === 'restore') {
    const filePath = args[1]
    restoreDb(filePath)
    return
  }

  // If a store name was passed as argument (e.g. npm run switch store1)
  if (command && command !== '--interactive' && command !== '-i') {
    const startDb = args.includes('--db')
    await switchStore(command, { startDb, interactive: false })
    return
  }

  // Interactive selection
  printStatus(stores, activeStoreName)

  if (stores.length === 0) {
    console.log('Error: No .env.<store> configuration files found.')
    return
  }

  const rl = readline.createInterface({ input, output })
  const prompt = `Select store number or name (1-${stores.length}) [Enter = keep unchanged]: `
  const choice = (await rl.question(prompt)).trim()
  rl.close()

  if (!choice) {
    console.log('Operation cancelled. Active store remained unchanged.')
    return
  }

  let chosenStore = null
  const num = parseInt(choice, 10)
  if (!isNaN(num) && num >= 1 && num <= stores.length) {
    chosenStore = stores[num - 1].name
  } else {
    const found = stores.find(s => s.name.toLowerCase() === choice.toLowerCase())
    if (found) chosenStore = found.name
  }

  if (!chosenStore) {
    console.error(`\x1b[31mInvalid selection: "${choice}".\x1b[0m`)
    return
  }

  await switchStore(chosenStore, { startDb: false, interactive: true })
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
