const express = require('express');
const User = require('../models/userModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Signup new user
router.post('', async ({ body }, res) => {
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
router.get('', auth({ auth: 'admin' }), async (req, res) => {
	try {
		const users = await User.find();
		res.send(users);
	} catch (e) {
		res.status(404).send();
	}
});

// Find user's own profile
router.get('/me', auth(), async ({ user }, res) => {
	res.send(user);
});

// Find user by ID (ADMIN ONLY)
router.get('/:id', auth({ auth: 'admin' }), async (req, res) => {
	const _id = req.params.id;
	try {
		const user = await User.findById(_id);
		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (e) {
		res.status(500).send(e);
	}
});

// Update user's own profile
router.patch('/me', auth(), async ({ user, body }, res) => {
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
router.patch(
	'/:id',
	auth({ auth: 'admin' }),
	async ({ params, body }, res) => {
		let user;
		const _id = params.id;
		const updates = Object.keys(body);
		const allowedUpdates = [
			'password',
			'canAdd',
			'canRequest',
			'canApprove',
			'canRegister',
			'auth',
			'state'
		];
		const isValidOperation = updates.every(update =>
			allowedUpdates.includes(update)
		);
		if (!isValidOperation) {
			return res.status(400).send({ error: 'Invalid Updates' });
		}
		try {
			user = await User.findByIdAndUpdate(_id, body, {
				new: true,
				runValidators: true
			});
			if (!user) {
				return res.status(404).send();
			}
			if (user.state === 'archived') {
				user = await User.findByIdAndUpdate(
					_id,
					{ tokens: [] },
					{ new: true, runValidators: true }
				);
			}
			res.send(user);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Archive user (Will be DELETED)
// router.patch(
// 	'/users/:id/archive',
// 	auth({ auth: 'admin' }),
// 	async ({ params }, res) => {
// 		try {
// 			const user = await User.findByIdAndUpdate(
// 				params.id,
// 				{
// 					state: 'archived',
// 					tokens: []
// 				},
// 				{ new: true, runValidators: true }
// 			);
// 			if (!user) {
// 				return res.status(404).send();
// 			}
// 			res.send(user);
// 		} catch (e) {
// 			res.status(500).send(e);
// 		}
// 	}
// );

// Activate user (Will be DELETED)
// router.patch(
// 	'/users/:id/activate',
// 	auth({ auth: 'admin' }),
// 	async ({ params }, res) => {
// 		try {
// 			const user = await User.findByIdAndUpdate(
// 				params.id,
// 				{ state: 'active' },
// 				{ new: true, runValidators: true }
// 			);
// 			if (!user) {
// 				return res.status(404).send();
// 			}
// 			res.send(user);
// 		} catch (e) {
// 			res.status(500).send(e);
// 		}
// 	}
// );

// Login existing user
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findByCredentials(email, password);
		const token = await user.generateAuthToken();
		res.send({ user, token });
	} catch (e) {
		res.status(401).send(e);
	}
});

// Logout user
router.post('/logout', auth(), async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(
			({ token }) => token !== req.token
		);
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;
