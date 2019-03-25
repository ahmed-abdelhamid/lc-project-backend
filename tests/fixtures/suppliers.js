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
	createdBy: activeUserOneId
};

const supplierTwoId = new mongoose.Types.ObjectId();
const supplierTwo = {
	_id: supplierTwoId,
	name: 'Supplier Two',
	specialization: 'Specialization Two',
	createdBy: activeUserOneId
};

const supplierThreeId = new mongoose.Types.ObjectId();
const supplierThree = {
	_id: supplierThreeId,
	name: 'Supplier Three',
	specialization: 'Specialization Three',
	createdBy: activeUserTwoId
};

const supplierFourId = new mongoose.Types.ObjectId();
const supplierFour = {
	_id: supplierFourId,
	name: 'Supplier Four',
	specialization: 'Specialization Four',
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
