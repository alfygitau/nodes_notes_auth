const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc get all users
// @route GET /users
// @access private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({
      message: "No users found",
    });
  }
  res.json(users);
});

// @desc create a user
// @route POST /users
// @access private
const createUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  // check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  //   hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = { username, password: hashedPassword, roles };

  //   create and store new user into the database
  const user = await User.create(newUser);
  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data recieved" });
  }
});

// @desc update a user
// @route PUT /users
// @access private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // confirm data
  if (
    !username ||
    !id ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
// confirm user from form data
  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //   check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();
  //   allow update to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }
  user.username = username;
  user.roles = roles;
  user.active = active;
//  updating passowrd
  if (password) {
    //   hash the password
    user.password = await bcrypt.hash(password, 10);
  }
  // response
  const updatedUser = await user.save();
  res.status(201).json({ message: `${updatedUser.username} updated` });
});

// @desc delete a user
// @route DELETE /users
// @access private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }
  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();
  const reply = `user of username ${result.username} with ID ${result._id} deleted`;
  res.status(200).json(reply);
});

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
