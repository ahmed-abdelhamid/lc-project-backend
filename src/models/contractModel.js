const mongoose = require('mongoose');

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

const Contract = new mongoose.model('Contract', contractSchema);

module.exports = Contract;
