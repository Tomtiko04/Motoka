#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const env = process.argv[2]

if (!env || !['development', 'production'].includes(env)) {
  console.log('Usage: node scripts/switch-env.js <development|production>')
  console.log('Example: node scripts/switch-env.js development')
  process.exit(1)
}

const envFile = path.join(__dirname, '..', `env.${env}`)
const targetFile = path.join(__dirname, '..', '.env')

try {
  // Copy the environment file
  fs.copyFileSync(envFile, targetFile)
  console.log(`✅ Switched to ${env} environment`)
  console.log(`📁 Using: ${targetFile}`)
  
  // Display the current configuration
  const content = fs.readFileSync(targetFile, 'utf8')
  console.log('\n📋 Current configuration:')
  console.log(content)
  
} catch (error) {
  console.error('❌ Error switching environment:', error.message)
  process.exit(1)
}
