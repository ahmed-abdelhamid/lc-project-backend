const mongoose = require('mongoose');
const { activeUserOneId } = require('./users');
const { supplierOneId } = require('./suppliers');

const lcOneId = new mongoose.Types.ObjectId();
const lcOne = {
	_id: lcOneId,
	supplierId: supplierOneId,
	createdBy: activeUserOneId,
	issuer: 'Issuer One',
	bankName: 'Bank One'
};

module.exports = {
	lcOneId,
	lcOne
};
