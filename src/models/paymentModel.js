const mongoose = require('mongoose');
const PaymentRequest = require('./paymentRequestModel');

const paymentSchema = new mongoose.Schema(
	{
		paymentRequestId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'PaymentRequest',
		},
		contractId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Contract',
		},
		lcId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Lc',
		},
		amount: { type: Number, required: true },
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		notes: { type: String, trim: true },
	},
	{ timestamps: true },
);

paymentSchema.pre('save', async function(next) {
	const payment = this;

	const paymentRequest = await PaymentRequest.findById(payment.paymentRequestId);
	if (paymentRequest.lcId && paymentRequest.amount !== payment.amount) {
		throw new Error('Amount is different than in the request');
	}

	next();
});

const Payment = new mongoose.model('Payment', paymentSchema);

module.exports = Payment;
