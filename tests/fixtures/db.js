const mongoose = require('mongoose');
const User = require('../../src/models/userModel');

const activeUserOneId = new mongoose.Types.ObjectId();
const activeUserOne = {
	_id: activeUserOneId,
	name: 'Mike',
	email: 'mike@example.com',
	password: 'Mike123456'
};

const archivedUserOne = {
	name: 'John',
	email: 'john@example.com',
	password: 'John123456',
	status: 'archive'
};

const setupDatabase = async () => {
	await User.deleteMany();

	await new User(activeUserOne).save();
	await new User(archivedUserOne).save();
};

module.exports = {
	activeUserOneId,
	activeUserOne,
	archivedUserOne,
	setupDatabase
};
