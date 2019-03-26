const mongoose = require('mongoose');
const Supplier = require('./supplierModel');

const contractSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		soc: { type: String },
		amount: { type: Number, required: true, min: 0 },
		duration: { type: String, required: true },
		notes: { type: String },
		supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
	},
	{ timestamps: true }
);

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
