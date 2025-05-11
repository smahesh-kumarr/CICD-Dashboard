import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  orgId: {
    type: String,
    required: [true, 'Organization ID is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  team: {
    type: String,
    required: [true, 'Team is required'],
    enum: ['dev', 'devops', 'operations', 'qa']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Drop existing indexes and create new ones
userSchema.index({ orgId: 1 }, { unique: false });
userSchema.index({ email: 1 }, { unique: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Drop existing indexes if they exist
User.collection.dropIndexes().catch(err => {
  if (err.code !== 26) { // Ignore error if collection doesn't exist
    console.error('Error dropping indexes:', err);
  }
});

export default User; 