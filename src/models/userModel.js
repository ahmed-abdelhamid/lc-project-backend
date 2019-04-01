const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true, minlength: 4 },
		email: {
			type: String,
			unique: true,
			required: true,
			trim: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error('Invalid Email');
				}
			}
		},
		password: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/)) {
					throw new Error(
						'Password must be at least 6 characters, and must include at least one upper case letter, one lower case letter, and one numeric digit.'
					);
				}
			}
		},
		phone: {
			type: String,
			trim: true,
			validate(value) {
				if (!validator.isMobilePhone(value, 'ar-SA')) {
					throw new Error('Invalid Phone Number');
				}
			}
		},
		notes: { type: String, trim: true },
		canRequest: { type: Boolean, default: false },
		canAdd: { type: Boolean, default: false },
		canRegister: { type: Boolean, default: false },
		canApprove: { type: Boolean, default: false },
		state: {
			type: String,
			enum: ['new', 'blocked', 'active', 'archived'],
			default: 'new'
		},
		auth: { type: String, enum: ['admin', 'user'], default: 'user' },
		tokens: [{ token: { type: String, required: true } }]
	},
	{ timestamps: true }
);

userSchema.virtual('suppliers', {
	ref: 'Supplier',
	localField: '_id',
	foreignField: 'createdBy'
});

userSchema.virtual('contracts', {
	ref: 'Contract',
	localField: '_id',
	foreignField: 'createdBy'
});

userSchema.virtual('appendixes', {
	ref: 'Appendix',
	localField: '_id',
	foreignField: 'createdBy'
});

userSchema.virtual('lcs', {
	ref: 'Lc',
	localField: '_id',
	foreignField: 'createdBy'
});

// Hide Sensitive Data
userSchema.methods.toJSON = function() {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;

	return userObject;
};

// Hash the password before saving on the database
userSchema.pre('save', async function(next) {
	const user = this;
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}

	next();
});

// Find User By Credentials
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) {
		throw new Error('Invalid email or password');
	}

	if (user.state === 'archived') {
		throw new Error('Your account is archived, please contact administrator');
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error('Invalid email or password');
	}

	return user;
};

// Genrete User Auth Tokens
userSchema.methods.generateAuthToken = async function() {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
	user.tokens = user.tokens.concat({ token });
	await user.save();

	return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
