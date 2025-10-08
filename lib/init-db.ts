import { pool } from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

async function initializeDatabase() {
    try {
        console.log('🚀 Initializing database...');

        // Read schema file
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');

        // Execute schema
        await pool.query(schema);

        console.log('✅ Database schema created successfully!');
        console.log('📊 Tables created:');
        console.log('   - game_participations');
        console.log('   - Indexes: idx_room_id, idx_user_id, idx_room_created');

        // Verify table exists
        const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'game_participations'
    `);

        if (result.rows.length > 0) {
            console.log('✅ Verification successful - table exists');
        } else {
            console.log('⚠️  Warning: Table not found after creation');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

// Run initialization
initializeDatabase();