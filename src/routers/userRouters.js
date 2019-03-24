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

// Get all users (ADMIN ONLY)
router.get('/users', auth('admin'), async (req, res) => {
	try {
		const users = await User.find();
		res.send(users);
	} catch (e) {
		res.status(404).send();
	}
});

// Find user's own profile
router.get('/users/me', auth(), async ({ user }, res) => {
	res.send(user);
});

// Find user by ID (ADMIN ONLY)
router.get('/users/:id', auth('admin'), async (req, res) => {
	const _id = req.params.id;
	try {
		const user = await User.findById(_id);
		res.send(user);
	} catch (e) {
		res.status(404).send(e);
	}
});

// Update user's own profile
router.patch('/users/me', auth(), async ({ user, body }, res) => {
	const updates = Object.keys(body);
	const allowedUpdates = ['name', 'email', 'password', 'phone'];
	const isValidOperation = updates.every(update =>
		allowedUpdates.includes(update)
	);
	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid Updates' });
	}
	try {
		updates.forEach(update => (user[update] = body[update]));
		await user.save();
		res.send(user);
	} catch (e) {
		res.status(400).send(e);
	}
});

// Update user by ID (ADMIN ONLY)
router.patch('/users/:id', auth('admin'), async ({ params, body }, res) => {
	const _id = params.id;
	const updates = Object.keys(body);
	const allowedUpdates = [
		'password',
		'cannAddLcRequest',
		'canAddRequest',
		'canAddPayment',
		'canAddLc',
		'canAddExtension',
		'canAddAmendement',
		'auth'
	];
	const isValidOperation = updates.every(update =>
		allowedUpdates.includes(update)
	);
	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid Updates' });
	}
	try {
		const user = await User.findByIdAndUpdate(_id, body, {
			new: true,
			runValidators: true
		});
		res.send(user);
	} catch (e) {
		res.status(400).send(e);
	}
});

// Archive user
router.patch('/users/:id/archive', auth('admin'), async ({ params }, res) => {
	try {
		await User.findByIdAndUpdate(
			params.id,
			{ status: 'archive' },
			{ runValidators: true }
		);
		res.send();
	} catch (e) {
		res.status(404).send(e);
	}
});

// Activate user

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
		await user.save();
		res.send();
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;
