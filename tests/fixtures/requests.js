const mongoose = require('mongoose');
const { activeUserOneId, activeUserTwoId, adminId } = require('./users');
const {
	supplierThreeId,
	supplierOneId,
	supplierTwoId,
	supplierFourId
} = require('./suppliers');

const newRequestId = new mongoose.Types.ObjectId();
const newRequest = {
	_id: newRequestId,
	amount: 1000,
	supplierId: supplierThreeId,
	requestedBy: activeUserOneId
};

const approvedRequestId = new mongoose.Types.ObjectId();
const approvedRequest = {
	_id: approvedRequestId,
	amount: 1000,
	state: 'approved',
	supplierId: supplierThreeId,
	requestedBy: activeUserOneId
};

const inprogressRequestId = new mongoose.Types.ObjectId();
const inprogressRequest = {
	_id: inprogressRequestId,
	amount: 1000,
	state: 'inprogress',
	supplierId: supplierOneId,
	requestedBy: activeUserTwoId
};

const inprogressRequestOneId = new mongoose.Types.ObjectId();
const inprogressRequestOne = {
	_id: inprogressRequestOneId,
	amount: 3000,
	state: 'inprogress',
	supplierId: supplierTwoId,
	requestedBy: activeUserTwoId
};

const executedRequestId = new mongoose.Types.ObjectId();
const executedRequest = {
	_id: executedRequestId,
	amount: 1000,
	state: 'executed',
	supplierId: supplierFourId,
	requestedBy: adminId
};

module.exports = {
	newRequestId,
	newRequest,
	approvedRequestId,
	approvedRequest,
	inprogressRequestId,
	inprogressRequest,
	inprogressRequestOneId,
	inprogressRequestOne,
	executedRequestId,
	executedRequest
};
