const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER
exports.registerUser = async (req, res) => {
  try {
    console.log("BODY:", req.body); // ✅ DEBUG INSIDE FUNCTION

    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json("Invalid credentials");

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json(err.message);
  }
};