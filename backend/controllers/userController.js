/** @format */

import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

//@desc Auth user & get token
//@route POST /api/users/login
//@access Public

const authUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (user && (await user.matchPassword(password))) {
		res.json({
			_id: user._id,
			fname: user.fname,
			lname: user.lname,
			email: user.email,
			isAdmin: user.isAdmin,
			token: generateToken(user._id),
		});
	} else {
		res.status(401);
		throw new Error("Invalid email or Password");
	}
});

//@desc Register a new user
//@route POST /api/users/
//@access Public

const registerUser = asyncHandler(async (req, res) => {
	const { fname, lname, email, password } = req.body;

	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400);
		throw new Error("User already exists");
	}
	const user = await User.create({
		fname,
		lname,
		email,
		password,
	});
	if (user) {
		res.status(201).json({
			_id: user._id,
			fname: user.fname,
			lname: user.lname,
			email: user.email,
			isAdmin: user.isAdmin,
			token: generateToken(user._id),
		});
	} else {
		res.status(400);
		throw new Error("Invalid user data");
	}
});

//@desc get profile of user
//@route GET /api/users/profile
//@access Private

const getUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);
	if (user) {
		res.json({
			_id: user._id,
			fname: user.fname,
			lname: user.lname,
			email: user.email,
			savedCardToken: user.savedCardToken,
			savedEcheckToken: user.savedEcheckToken,
			isAdmin: user.isAdmin,
		});
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

//@desc Update profile of user
//@route PUT /api/users/profile
//@access Private

const updateUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);
	if (user) {
		user.fname = req.body.fname || user.fname;
		user.lname = req.body.lname || user.lname;
		user.email = req.body.email || user.email;
		user.savedCardToken = req.body.savedCardToken || user.savedCardToken;
		user.savedEcheckToken = req.body.savedEcheckToken || user.savedEcheckToken;
		if (req.body.password) {
			user.password = req.body.password || user.password;
		}

		const updatedUser = await user.save();

		res.json({
			_id: updatedUser._id,
			fname: updatedUser.fname,
			lname: updatedUser.lname,
			email: updatedUser.email,
			isAdmin: updatedUser.isAdmin,
			savedCardToken: user.savedCardToken,
			savedEcheckToken: user.savedEcheckToken,
			token: generateToken(updatedUser._id),
		});
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

//@desc Get all users
//@route GET /api/users/
//@access Private/Admin

const getUsers = asyncHandler(async (req, res) => {
	const users = await User.find({});
	res.json(users);
});

//@desc Delete user
//@route DELETE /api/users/:id
//@access Private/Admin

const deleteUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);
	if (user) {
		await user.remove();
		res.json({ message: "User removed" });
	} else {
		res.status(404);
		throw new Error("User not Found");
	}
});

//@desc Get user by ID
//@route GET /api/users/:id
//@access Private/Admin

const getUserById = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id).select("-password");
	if (user) {
		res.json(user);
	} else {
		res.status(404);
		throw new Error("User not Found");
	}
});

//@desc Update user
//@route PUT /api/users/:id
//@access Private/Admin

const updateUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);
	if (user) {
		user.fname = req.body.fname || user.fname;
		user.lname = req.body.lname || user.lname;
		user.email = req.body.email || user.email;

		user.isAdmin = req.body.isAdmin;

		const updatedUser = await user.save();

		res.json({
			_id: updatedUser._id,
			fname: updatedUser.fname,
			lname: updatedUser.lname,
			email: updatedUser.email,
			isAdmin: updatedUser.isAdmin,
		});
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

export {
	authUser,
	getUserProfile,
	registerUser,
	updateUserProfile,
	getUsers,
	deleteUser,
	getUserById,
	updateUser,
};
