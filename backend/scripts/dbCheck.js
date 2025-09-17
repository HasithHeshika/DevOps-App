require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/propertyhub';
  console.log('Connecting to:', uri);
  try {
    const conn = await mongoose.connect(uri);
    const db = conn.connection.db;
    const dbName = db.databaseName;
    const collections = await db.listCollections().toArray();
    const collNames = collections.map(c => c.name);
    let userCount = 0;
    if (collNames.includes('users')) {
      userCount = await db.collection('users').countDocuments();
    }
    console.log('Connected DB name:', dbName);
    console.log('Collections:', collNames);
    console.log('Users count:', userCount);
  } catch (e) {
    console.error('DB check error:', e);
  } finally {
    await mongoose.connection.close().catch(() => {});
    process.exit(0);
  }
})();
