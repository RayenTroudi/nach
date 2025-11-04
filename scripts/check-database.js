const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URL:', process.env.MONGODB_URL ? 'Found' : 'NOT FOUND');
    
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB successfully!\n');

    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`Database name: ${dbName}\n`);

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:\n`);

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      
      console.log(`📋 ${collectionName}: ${count} documents`);
      
      // Show sample data for small collections
      if (count > 0 && count <= 10) {
        const docs = await collection.find({}).limit(5).toArray();
        docs.forEach(doc => {
          if (doc.username) console.log(`   - ${doc.username} (${doc.clerkId || doc._id})`);
          else if (doc.title) console.log(`   - ${doc.title.substring(0, 50)}`);
          else if (doc.name) console.log(`   - ${doc.name}`);
        });
      }
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

checkDatabase();
