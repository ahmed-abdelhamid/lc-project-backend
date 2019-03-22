const express = require('express');
const User = require('../models/userModel');
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

module.exports = router;
