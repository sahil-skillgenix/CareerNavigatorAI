/**
 * This script lists all tables in the PostgreSQL database and their metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Get current file directory 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Get database connection info from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString
});

// Query to get all tables and their size/row counts
const GET_ALL_TABLES_QUERY = `
SELECT 
    t.table_schema,
    t.table_name,
    c.reltuples::bigint AS row_estimate,
    pg_size_pretty(pg_total_relation_size('"' || t.table_schema || '"."' || t.table_name || '"')) AS total_size,
    obj_description('"' || t.table_schema || '"."' || t.table_name || '"'::regclass, 'pg_class') AS description
FROM 
    information_schema.tables t
JOIN 
    pg_class c ON ('"' || t.table_schema || '"."' || t.table_name || '"' = c.oid::regclass::text)
WHERE 
    t.table_schema NOT IN ('pg_catalog', 'information_schema')
    AND t.table_type = 'BASE TABLE'
ORDER BY 
    t.table_schema,
    t.table_name;
`;

// Query to find tables without references in the code
const findUnusedTables = async (allTables) => {
  const rootDir = path.join(__dirname, '..');
  const unusedTables = [];
  const usedTables = [];

  for (const table of allTables) {
    const { table_name } = table;
    
    try {
      const { stdout } = await new Promise((resolve, reject) => {
        const exec = require('child_process').exec;
        exec(`grep -r --include="*.ts" --include="*.js" "${table_name}" ${rootDir}/server ${rootDir}/shared || true`, 
          (error, stdout, stderr) => {
            if (error && error.code !== 1) {
              reject(error);
            } else {
              resolve({ stdout, stderr });
            }
          }
        );
      });
      
      if (stdout.trim() === '') {
        unusedTables.push(table);
      } else {
        const references = stdout.trim().split('\n').length;
        usedTables.push({
          ...table,
          references,
          files: stdout.trim().split('\n').map(line => line.split(':')[0])
        });
      }
    } catch (error) {
      console.error(`Error searching for references to table ${table_name}:`, error);
      usedTables.push({
        ...table,
        references: 'ERROR',
        files: []
      });
    }
  }

  return { unusedTables, usedTables };
};

// Main function
async function main() {
  try {
    console.log('Connecting to PostgreSQL database...');
    const client = await pool.connect();
    
    try {
      console.log('Fetching all tables...');
      const result = await client.query(GET_ALL_TABLES_QUERY);
      const allTables = result.rows;
      
      console.log(`Found ${allTables.length} tables in the database\n`);
      
      // Find unused tables
      console.log('Analyzing tables for usage in code...');
      const { unusedTables, usedTables } = await findUnusedTables(allTables);
      
      // Display results
      console.log('\n=== DATABASE TABLES ANALYSIS ===\n');
      
      console.log('TABLES WITH NO CODE REFERENCES:');
      if (unusedTables.length === 0) {
        console.log('None - all tables appear to be referenced in the code');
      } else {
        unusedTables.forEach(table => {
          console.log(`- ${table.table_schema}.${table.table_name} (Est. rows: ${table.row_estimate}, Size: ${table.total_size})`);
        });
      }
      
      console.log('\nUSED TABLES:');
      usedTables.sort((a, b) => b.row_estimate - a.row_estimate);
      usedTables.forEach(table => {
        console.log(`- ${table.table_schema}.${table.table_name} (Est. rows: ${table.row_estimate}, Size: ${table.total_size}, Refs: ${table.references})`);
      });
      
      // Generate cleanup script for unused tables if any exist
      if (unusedTables.length > 0) {
        const cleanupScript = `
/**
 * Script to drop unused tables
 * REVIEW CAREFULLY before running!
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const TABLES_TO_DROP = [
  ${unusedTables.map(t => `  { schema: '${t.table_schema}', name: '${t.table_name}' }`).join(',\n')}
];

async function dropTables() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    for (const table of TABLES_TO_DROP) {
      try {
        console.log(\`Dropping table \${table.schema}.\${table.name}...\`);
        await client.query(\`DROP TABLE "\${table.schema}".\${table.name} CASCADE\`);
        console.log(\`✅ Dropped \${table.schema}.\${table.name}\`);
      } catch (error) {
        console.error(\`❌ Error dropping \${table.schema}.\${table.name}: \${error.message}\`);
        await client.query('ROLLBACK');
        return;
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('\\n✅ All tables dropped successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error dropping tables:', error);
  } finally {
    client.release();
  }
}

// Main function
async function main() {
  console.log('The following tables will be dropped:');
  TABLES_TO_DROP.forEach(table => {
    console.log(\`- \${table.schema}.\${table.name}\`);
  });
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\\nWARNING: This will permanently delete these tables and ALL their data!\\nAre you sure you want to proceed? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() === 'yes') {
      await dropTables();
    } else {
      console.log('Operation cancelled. No tables were dropped.');
    }
    
    rl.close();
    await pool.end();
  });
}

main();
`;
        
        fs.writeFileSync(path.join(__dirname, 'drop-unused-tables.js'), cleanupScript);
        console.log('\nCreated drop-unused-tables.js script for removing unused tables');
        console.log('REVIEW CAREFULLY before running!');
      }
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
main();