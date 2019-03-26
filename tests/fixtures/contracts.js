const mongoose = require('mongoose');
const { adminId, activeUserOneId, activeUserTwoId } = require('./users');
const {
	supplierOneId,
	supplierThreeId,
	supplierFourId
} = require('./suppliers');

const contractOneId = new mongoose.Types.ObjectId();
const contractOne = {
	_id: contractOneId,
	title: 'Contract One',
	amount: 1000,
	duration: '1 Month',
	supplierId: supplierThreeId,
	createdBy: activeUserOneId
};

const contractTwoId = new mongoose.Types.ObjectId();
const contractTwo = {
	_id: contractTwoId,
	title: 'Contract Two',
	amount: 2000,
	duration: '2 Month',
	supplierId: supplierThreeId,
	createdBy: activeUserTwoId
};

const contractThreeId = new mongoose.Types.ObjectId();
const contractThree = {
	_id: contractThreeId,
	title: 'Contract Three',
	amount: 3000,
	duration: '3 Month',
	supplierId: supplierFourId,
	createdBy: adminId
};

const contractFourId = new mongoose.Types.ObjectId();
const contractFour = {
	_id: contractFourId,
	title: 'Contract Four',
	amount: 4000,
	duration: '4 Month',
	supplierId: supplierOneId,
	createdBy: activeUserOneId
};

const contractFiveId = new mongoose.Types.ObjectId();
const contractFive = {
	_id: contractFiveId,
	title: 'Contract Five',
	amount: 5000,
	duration: '5 Month',
	supplierId: supplierOneId,
	createdBy: activeUserTwoId
};

module.exports = {
	contractOneId,
	contractOne,
	contractTwoId,
	contractTwo,
	contractThreeId,
	contractThree,
	contractFourId,
	contractFour,
	contractFiveId,
	contractFive
};
