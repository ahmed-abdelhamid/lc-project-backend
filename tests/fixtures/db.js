const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/userModel');

const adminId = new mongoose.Types.ObjectId();
const admin = {
	_id: adminId,
	name: 'Admin',
	email: 'admin@example.com',
	password: 'Admin123',
	cannAddLcRequest: true,
	canAddRequest: true,
	canAddPayment: true,
	canAddLc: true,
	canAddExtension: true,
	canAddAmendement: true,
	status: 'active',
	auth: 'admin',
	tokens: [{ token: jwt.sign({ _id: adminId }, process.env.JWT_SECRET) }]
};

const activeUserOneId = new mongoose.Types.ObjectId();
const activeUserOne = {
	_id: activeUserOneId,
	name: 'Mike',
	email: 'mike@example.com',
	password: 'Mike123456',
	tokens: [
		{ token: jwt.sign({ _id: activeUserOneId }, process.env.JWT_SECRET) }
	]
};

const archivedUserOne = {
	name: 'John',
	email: 'john@example.com',
	password: 'John123456',
	status: 'archive'
};

const setupDatabase = async () => {
	await User.deleteMany();

	await new User(admin).save();
	await new User(activeUserOne).save();
	await new User(archivedUserOne).save();
};

module.exports = {
	adminId,
	admin,
	activeUserOneId,
	activeUserOne,
	archivedUserOne,
	setupDatabase
};
