const mongoose = require('mongoose');
const { adminId, activeUserTwoId, archivedUserOneId } = require('./users');
const {
	contractOneId,
	contractThreeId,
	contractFiveId
} = require('./contracts');

const appendixOneId = new mongoose.Types.ObjectId();
const appendixOne = {
	_id: appendixOneId,
	title: 'Appendix One',
	amount: 1000,
	soc: 'Scope of work',
	date: new Date(),
	duration: '1 Month',
	contractId: contractOneId,
	createdBy: archivedUserOneId
};

const appendixTwoId = new mongoose.Types.ObjectId();
const appendixTwo = {
	_id: appendixTwoId,
	title: 'Appendix Two',
	amount: 2000,
	soc: 'Scope of work',
	date: new Date(),
	duration: '2 Month',
	contractId: contractThreeId,
	createdBy: activeUserTwoId
};

const appendixThreeId = new mongoose.Types.ObjectId();
const appendixThree = {
	_id: appendixThreeId,
	title: 'Appendix Three',
	amount: 3000,
	soc: 'Scope of work',
	date: new Date(),
	duration: '3 Month',
	contractId: contractFiveId,
	createdBy: adminId
};

module.exports = {
	appendixOneId,
	appendixOne,
	appendixTwoId,
	appendixTwo,
	appendixThreeId,
	appendixThree
};
