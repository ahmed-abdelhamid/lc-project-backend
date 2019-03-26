const mongoose = require('mongoose');
const Contract = require('./contractModel');

const appendixSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		soc: { type: String },
		amount: { type: Number, required: true, min: 0 },
		duration: { type: String, required: true },
		notes: { type: String },
		contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
	},
	{ timestamps: true }
);

appendixSchema.pre('save', async function(next) {
	const appendix = this;

	const contract = await Contract.findById(appendix.contractId);
	if (!contract) {
		throw new Error({ error: 'Contract not found' });
	}

	next();
});

const Appendix = new mongoose.model('Appendix', appendixSchema);

module.exports = Appendix;
