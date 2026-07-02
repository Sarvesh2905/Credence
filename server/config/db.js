const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Try the primary URI first (SRV-based)
    let uri = process.env.MONGODB_URI;

    // If SRV fails, the fallback URI with direct shard hosts is used
    const fallbackURI = process.env.MONGODB_URI_FALLBACK;

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // If SRV failed and we have a fallback, try the direct connection
    const fallbackURI = process.env.MONGODB_URI_FALLBACK;
    if (fallbackURI && error.message.includes('querySrv')) {
      console.log('🔄 SRV lookup failed. Trying direct connection string...');
      try {
        const conn = await mongoose.connect(fallbackURI, {
          serverSelectionTimeoutMS: 15000,
          socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected (fallback): ${conn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error(`❌ Fallback Connection Error: ${fallbackError.message}`);
      }
    }
    
    console.log('⚠️  Server will continue running. MongoDB will retry in 10 seconds.');
    setTimeout(connectDB, 10000);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully.');
});

module.exports = connectDB;
