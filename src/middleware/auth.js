const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const auth = role => async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		let user;
		if (!role) {
			user = await User.findOne({
				_id: decoded._id,
				'tokens.token': token
			});
		} else {
			user = await User.findOne({
				_id: decoded._id,
				auth: role,
				'tokens.token': token
			});
		}
		if (!user) {
			throw new Error();
		}
		req.token = token;
		req.user = user;
		next();
	} catch (e) {
		res.status(401).send({ error: 'Not Authorized User' });
	}
};

module.exports = auth;
