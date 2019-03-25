const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true, trim: true },
		specialization: { type: String, required: true, trim: true },
		notes: { type: String, trim: true },
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		}
	},
	{ timestamps: true }
);

supplierSchema.virtual('contracts', {
	ref: 'Contract',
	localField: '_id',
	foreignField: 'supplierId'
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
