require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  userType: { type: String, default: 'buyer' },
});

const User = mongoose.model('User', userSchema, 'users');

(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/propertyhub';
  try {
    await mongoose.connect(uri);
    const hash = await bcrypt.hash('Test1234', 10);
    const doc = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: `test_${Date.now()}@example.com`,
      phone: '+94 71 123 4567',
      password: hash,
      userType: 'buyer',
    });
    console.log('Inserted user id:', doc._id.toString());
  } catch (e) {
    console.error('Create test user error:', e.message);
  } finally {
    await mongoose.connection.close().catch(() => {});
    process.exit(0);
  }
})();
