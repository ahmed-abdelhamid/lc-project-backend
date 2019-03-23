const express = require('express');
const User = require('../models/userModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Signup new user
router.post('/users', async ({ body }, res) => {
	const user = new User(body);

	try {
		await user.save();
		const token = await user.generateAuthToken();
		res.status(201).send({ user, token });
	} catch (e) {
		res.status(400).send(e);
	}
});

// Get all users
router.get('/users', auth('admin'), async (req, res) => {
	const users = await User.find();
	if (!users) {
		return res.status(404).send();
	}
	res.send(users);
});

// Login existing user
router.post('/users/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findByCredentials(email, password);
		const token = await user.generateAuthToken();
		res.send({ user, token });
	} catch (e) {
		res.status(400).send(e);
	}
});

// Logout user
router.post('/users/logout', auth(), async ({ user, token }, res) => {
	try {
		user.tokens = user.tokens.filter(({ userToken }) => userToken !== token);
		await user.save({ validateBeforeSave: false });
		res.send();
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;
