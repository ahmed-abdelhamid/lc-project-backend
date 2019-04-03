const mongoose = require('mongoose');
const { activeUserOneId } = require('./users');
const { supplierOneId } = require('./suppliers');
const { inprogressRequestId } = require('./requests');

const lcOneId = new mongoose.Types.ObjectId();
const lcOne = {
	_id: lcOneId,
	supplierId: supplierOneId,
	createdBy: activeUserOneId,
	requestId: inprogressRequestId,
	issuer: 'Issuer One',
	bankName: 'Bank One',
	number: '1',
	issueDate: new Date(),
	expiryDate: new Date(),
	amount: 1000
};

module.exports = {
	lcOneId,
	lcOne
};
