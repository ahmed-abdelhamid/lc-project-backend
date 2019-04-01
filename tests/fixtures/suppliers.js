const mongoose = require('mongoose');
const {
	activeUserOneId,
	activeUserTwoId,
	archivedUserOneId
} = require('./users');

const supplierOneId = new mongoose.Types.ObjectId();
const supplierOne = {
	_id: supplierOneId,
	name: 'Supplier One',
	specialization: 'Specialization One',
	vatRegisteration: 1,
	crRegisteration: 1,
	createdBy: activeUserOneId
};

const supplierTwoId = new mongoose.Types.ObjectId();
const supplierTwo = {
	_id: supplierTwoId,
	name: 'Supplier Two',
	specialization: 'Specialization Two',
	vatRegisteration: 2,
	crRegisteration: 2,
	createdBy: activeUserOneId
};

const supplierThreeId = new mongoose.Types.ObjectId();
const supplierThree = {
	_id: supplierThreeId,
	name: 'Supplier Three',
	specialization: 'Specialization Three',
	vatRegisteration: 3,
	crRegisteration: 3,
	createdBy: activeUserTwoId
};

const supplierFourId = new mongoose.Types.ObjectId();
const supplierFour = {
	_id: supplierFourId,
	name: 'Supplier Four',
	specialization: 'Specialization Four',
	vatRegisteration: 4,
	crRegisteration: 4,
	createdBy: archivedUserOneId
};

module.exports = {
	supplierOneId,
	supplierOne,
	supplierTwoId,
	supplierTwo,
	supplierThreeId,
	supplierThree,
	supplierFourId,
	supplierFour
};
