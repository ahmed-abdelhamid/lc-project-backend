const mongoose = require('mongoose');
const Supplier = require('./supplierModel');

const lcSchema = new mongoose.Schema({
	supplierId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Supplier'
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	},
	issuer: { type: String, required: true },
	bankName: { type: String, required: true },
	number: { type: Number },
	openingCommission: { type: Number },
	serviceCharge: { type: Number },
	editCommission: { type: Number },
	issueDate: { type: Date },
	expiryDate: { type: Date },
	amount: { type: Number },
	notes: { type: String },
	previouslyPaidInCash: { type: Number },
	previouslyPaidWithInvoice: { type: Number }
});

lcSchema.pre('save', async function(next) {
	const lc = this;

	const supplier = await Supplier.findById(lc.supplierId);
	if (!supplier) {
		throw new Error({ error: 'Contract not found' });
	}

	next();
});

const Lc = new mongoose.model('Lc', lcSchema);

module.exports = Lc;
