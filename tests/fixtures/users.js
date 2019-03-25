const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

const activeUserTwoId = new mongoose.Types.ObjectId();
const activeUserTwo = {
	_id: activeUserOneId,
	name: 'Hany',
	email: 'hany@example.com',
	password: 'Hany123456',
	tokens: [
		{ token: jwt.sign({ _id: activeUserOneId }, process.env.JWT_SECRET) }
	]
};

const archivedUserOneId = new mongoose.Types.ObjectId();
const archivedUserOne = {
	_id: archivedUserOneId,
	name: 'John',
	email: 'john@example.com',
	password: 'John123456',
	status: 'archive'
};

module.exports = {
	adminId,
	admin,
	activeUserOneId,
	activeUserOne,
	activeUserTwoId,
	activeUserTwo,
	archivedUserOneId,
	archivedUserOne
};
