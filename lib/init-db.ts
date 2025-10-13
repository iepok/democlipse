// lib/init-db.ts
import {pool} from './db'
import {readFileSync} from 'fs'
import {join} from 'path'

async function initializeDatabase() {
    try {
        console.log('🚀 Initializing database...')
        console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? 'loaded' : 'MISSING')

        const schemaPath = join(__dirname, 'schema.sql')
        const schema = readFileSync(schemaPath, 'utf-8')

        await pool.query(schema)

        console.log('✅ Database schema created successfully!')

        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name IN ('rooms', 'games', 'players')
        `)

        console.log(`✅ Verification: ${result.rows.length}/3 tables exist`)

        await pool.end()
        process.exit(0)
    } catch (error) {
        console.error('❌ Database initialization failed:', error)
        process.exit(1)
    }
}

initializeDatabase()