const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		specialization: { type: String, required: true, trim: true },
		vatRegisteration: {
			type: Number,
			unique: true,
			required: true,
			trim: true
		},
		crRegisteration: { type: Number, unique: true, required: true, trim: true },
		notes: { type: String, trim: true },
		state: { type: String, enum: ['active', 'archived'], default: 'active' },
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		docs: { type: [String], required: true, default: undefined }
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
