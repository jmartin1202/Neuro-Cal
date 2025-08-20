import { pool } from '../server.js';

const testDatabaseConnection = async () => {
  try {
    console.log('🔍 Testing PostgreSQL connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test query execution
    const result = await client.query('SELECT version()');
    console.log('✅ Query execution successful');
    console.log(`📊 PostgreSQL version: ${result.rows[0].version}`);
    
    // Test database info
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `);
    
    console.log('📋 Database Information:');
    console.log(`   Database: ${dbInfo.rows[0].database_name}`);
    console.log(`   User: ${dbInfo.rows[0].current_user}`);
    console.log(`   Server: ${dbInfo.rows[0].server_address}:${dbInfo.rows[0].server_port}`);
    
    // Test table existence
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('📊 Existing tables:');
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found - run database initialization first');
    }
    
    // Test UUID extension
    try {
      await client.query('SELECT gen_random_uuid()');
      console.log('✅ UUID extension available');
    } catch (error) {
      console.log('⚠️  UUID extension not available - will be created during initialization');
    }
    
    client.release();
    console.log('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Check if PostgreSQL is running');
      console.log('   2. Verify the port (default: 5432)');
      console.log('   3. Check firewall settings');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed:');
      console.log('   1. Check username and password in .env file');
      console.log('   2. Verify user exists in PostgreSQL');
      console.log('   3. Check pg_hba.conf configuration');
    } else if (error.code === '3D000') {
      console.log('\n💡 Database does not exist:');
      console.log('   1. Create the database: CREATE DATABASE neurocal;');
      console.log('   2. Or check database name in .env file');
    }
    
    throw error;
  }
};

const runConnectionTest = async () => {
  try {
    await testDatabaseConnection();
    process.exit(0);
  } catch (error) {
    console.error('💥 Connection test failed');
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runConnectionTest();
}

export { testDatabaseConnection };
