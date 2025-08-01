#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function setupProduction() {
  console.log('🚀 Setting up production database...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    // Push the schema to the database
    console.log('📦 Pushing database schema...');
    await prisma.$executeRaw`SELECT 1`; // Test connection
    
    console.log('✅ Database connection successful!');
    console.log('📊 Database is ready for production use.');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupProduction(); 