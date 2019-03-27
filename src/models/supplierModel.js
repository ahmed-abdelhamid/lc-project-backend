const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true, trim: true },
		specialization: { type: String, required: true, trim: true },
		vatRegisteration: { type: Number, unique: true, required: true },
		rcRegisteration: { type: Number, unique: true, required: true },
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

supplierSchema.virtual('lcs', {
	ref: 'Lc',
	localField: '_id',
	foreignField: 'supplierId'
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
