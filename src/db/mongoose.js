const mongoose = require('mongoose');

mongoose
	.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log('connected');
	})
	.catch(e => {
		console.log('failed');
		console.log(e);
	});

// MONGODB_URL=mongodb://127.0.0.1:27017/lc-api

// Access Key ID:
// AKIAIMVFA4K4M3PSTNFA
// Secret Access Key:
// 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
