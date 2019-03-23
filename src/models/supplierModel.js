const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		specialization: { type: String, required: true }, // Not sure of it, Maybe needs more validation
		notes: { type: String }
	},
	{ timestamps: true }
);

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
