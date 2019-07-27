const mongoose = require('mongoose');
const Supplier = require('./supplierModel');

const contractSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		date: { type: Date, required: true },
		soc: { type: String, trim: true, required: true },
		amount: { type: Number, required: true, min: 0 },
		duration: { type: Number, required: true, trim: true },
		notes: { type: String, trim: true },
		state: {
			type: String,
			enum: ['active', 'archived', 'deleted'],
			default: 'active'
		},
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
		previouslyPaidInCash: {
			type: Number,
			required: true,
			default: 0
		},
		docs: [{ type: String, required: true }]
	},
	{ timestamps: true }
);

contractSchema.virtual('appendixes', {
	ref: 'Appendix',
	localField: '_id',
	foreignField: 'contractId'
});

contractSchema.virtual('paymentRequests', {
	ref: 'PaymentRequest',
	localField: '_id',
	foreignField: 'contractId'
});

contractSchema.virtual('payments', {
	ref: 'Payment',
	localField: '_id',
	foreignField: 'contractId'
});

contractSchema.virtual('lcs', {
	ref: 'Lc',
	localField: '_id',
	foreignField: 'contractId'
});
contractSchema.virtual('requests', {
	ref: 'Request',
	localField: '_id',
	foreignField: 'contractId'
});

contractSchema.pre('save', async function(next) {
	const contract = this;

	const supplier = await Supplier.findById(contract.supplierId);
	if (!supplier) {
		throw new Error({ error: 'Supplier not found' });
	}

	next();
});

const Contract = new mongoose.model('Contract', contractSchema);

module.exports = Contract;
