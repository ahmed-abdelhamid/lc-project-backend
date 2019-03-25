const User = require('../../src/models/userModel');
const Supplier = require('../../src/models/supplierModel');
const {
	adminId,
	admin,
	activeUserOneId,
	activeUserOne,
	activeUserTwoId,
	activeUserTwo,
	archivedUserOneId,
	archivedUserOne
} = require('./users');
const {
	supplierOneId,
	supplierOne,
	supplierTwoId,
	supplierTwo,
	supplierThreeId,
	supplierThree,
	supplierFourId,
	supplierFour
} = require('./suppliers');

const setupDatabase = async () => {
	await User.deleteMany();
	await Supplier.deleteMany();

	await new User(admin).save();
	await new User(activeUserOne).save();
	await new User(archivedUserOne).save();
	await new Supplier(supplierOne).save();
	await new Supplier(supplierTwo).save();
};

module.exports = {
	adminId,
	admin,
	activeUserOneId,
	activeUserOne,
	activeUserTwoId,
	activeUserTwo,
	archivedUserOneId,
	archivedUserOne,
	supplierOneId,
	supplierOne,
	supplierTwoId,
	supplierTwo,
	supplierThreeId,
	supplierThree,
	supplierFourId,
	supplierFour,
	setupDatabase
};
