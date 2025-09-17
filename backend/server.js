const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
// CORS (dev-friendly): allow localhost variants
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000'
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow tools like curl/postman
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In development, allow any localhost origin
      if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic rate limiting
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100)
  })
);

const API_PREFIX = process.env.API_PREFIX || '/api';

// MongoDB connection
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/propertyhub';
  try {
    await mongoose.connect(uri);
    // Log connection details for troubleshooting (no credentials printed)
    const conn = mongoose.connection;
    const dbName = conn && conn.name ? conn.name : 'unknown';
    console.log('✅ MongoDB connected successfully');
    console.log(`   • DB Name: ${dbName}`);
    console.log(`   • URI Host: ${(() => {
      try {
        const u = new URL(uri);
        return `${u.protocol}//${u.hostname}:${u.port || (u.protocol === 'mongodb+srv:' ? 'srv' : '27017')}`;
      } catch (_) {
        return 'local URI';
      }
    })()}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    userType: {
      type: String,
      enum: ['buyer', 'seller', 'agent', 'developer'],
      default: 'buyer'
    },
    isEmailVerified: { type: Boolean, default: false },
    avatar: { type: String, default: '' },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'Sri Lanka' }
    },
    preferences: {
      propertyTypes: [String],
      priceRange: { min: Number, max: Number },
      locations: [String],
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
      }
    },
    savedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
      }
    ],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS || 12));
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email, userType: this.userType },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const User = mongoose.model('User', userSchema);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token is required' });
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Routes
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({ status: 'OK', message: 'PropertyHub API is running', timestamp: new Date().toISOString() });
});

// Debug-only: users count and db info (only in non-production)
if (process.env.NODE_ENV !== 'production') {
  app.get(`${API_PREFIX}/auth/_debug/users-count`, async (req, res) => {
    try {
      const count = await mongoose.connection.db.collection('users').countDocuments().catch(() => 0);
      res.json({
        db: mongoose.connection && mongoose.connection.name,
        users: count
      });
    } catch (e) {
      res.status(500).json({ message: 'Debug endpoint error', error: e.message });
    }
  });
}

// Auth routes
app.post(`${API_PREFIX}/auth/signup`, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, userType } = req.body;
  console.log(`[SIGNUP] Incoming request for email: ${email}`);
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long' });

    const user = new User({ firstName, lastName, email, phone, password, userType: userType || 'buyer' });
    await user.save();
  console.log(`[SIGNUP] Created user with id: ${user._id}`);

    const token = user.generateAuthToken();
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      isEmailVerified: user.isEmailVerified
    };

    res.status(201).json({ message: 'User registered successfully', token, user: userData });
  } catch (error) {
  console.error('[SIGNUP] Error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    if (error.code === 11000) return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post(`${API_PREFIX}/auth/login`, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive) return res.status(401).json({ message: 'Account has been deactivated. Please contact support.' });
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid email or password' });

    const token = user.generateAuthToken();
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
      preferences: user.preferences
    };

    res.json({ message: 'Login successful', token, user: userData });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get(`${API_PREFIX}/auth/profile`, authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password').populate('savedProperties');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put(`${API_PREFIX}/auth/profile`, authenticateToken, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.email;
    const user = await User.findByIdAndUpdate(req.user.userId, { $set: updates }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

app.put(`${API_PREFIX}/auth/change-password`, authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current password and new password are required' });
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post(`${API_PREFIX}/auth/logout`, authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Mount existing Property API routes under API prefix
const propertyRouter = require('./Routes/PropertyRoutes');
app.use(`${API_PREFIX}/properties`, propertyRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API Health Check: http://localhost:${PORT}${API_PREFIX}/health`);
    console.log(`🔐 Auth endpoints:`);
    console.log(`   POST http://localhost:${PORT}${API_PREFIX}/auth/signup`);
    console.log(`   POST http://localhost:${PORT}${API_PREFIX}/auth/login`);
    console.log(`   GET  http://localhost:${PORT}${API_PREFIX}/auth/profile`);
  });
});

module.exports = app;
