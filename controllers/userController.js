const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AsyncHandler = require('express-async-handler');

// Generate JWT token
const generateToken = (id, name, email) => jwt.sign(
  {
    user: {
      name: name,
      email: email,
      id: id,
    },
  },
  process.env.JWT_SECRET,
  { expiresIn: "50m" }
);

// Register user
register = AsyncHandler(async (req, res) => {
  try {
    const { name, email, password, role} = req.body;
    
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role,
    });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id, user.name, user.email)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
login = AsyncHandler(async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id,user.email, user.name)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// getAllUsers
getAllUsers = AsyncHandler(async (req, res) => {
    if(req.user.role !== 'hr') {
        return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    const users = await User.find({});
    return res.status(200).json(users);
});

// Get current user profile
getUserInfo = AsyncHandler(async (req, res) => {
  try {
    console.log(req.user);
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { register, login, getAllUsers, getUserInfo };