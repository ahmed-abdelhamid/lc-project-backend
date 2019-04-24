const User = require('../../src/models/userModel');
const Supplier = require('../../src/models/supplierModel');
const Contract = require('../../src/models/contractModel');
const Appendix = require('../../src/models/appendixModel');
const Request = require('../../src/models/requestModel');
const Lc = require('../../src/models/lcModel');
const Amendment = require('../../src/models/amendmentModel');
const Extension = require('../../src/models/extensionModel');
const {
	adminId,
	admin,
	activeUserOneId,
	activeUserOne,
	activeUserTwoId,
	activeUserTwo,
	archivedUserOneId,
	archivedUserOne
} = require('./users');
const {
	supplierOneId,
	supplierOne,
	supplierTwoId,
	supplierTwo,
	supplierThreeId,
	supplierThree,
	supplierFourId,
	supplierFour
} = require('./suppliers');
const {
	contractOneId,
	contractOne,
	contractTwoId,
	contractTwo,
	contractThreeId,
	contractThree,
	contractFourId,
	contractFour,
	contractFiveId,
	contractFive
} = require('./contracts');
const {
	appendixOneId,
	appendixOne,
	appendixTwoId,
	appendixTwo,
	appendixThreeId,
	appendixThree
} = require('./appendixes');
const {
	newRequestId,
	newRequest,
	approvedRequestId,
	approvedRequest,
	inprogressRequestId,
	inprogressRequest,
	inprogressRequestOneId,
	inprogressRequestOne,
	executedRequestId,
	requestForAmendmentId,
	requestForAmendment,
	requestForExtensionId,
	requestForExtension,
	requestForBothId,
	requestForBoth,
	executedRequest
} = require('./requests');
const { lcOneId, lcOne } = require('./lcs');

const setupDatabase = async () => {
	await User.deleteMany();
	await Supplier.deleteMany();
	await Contract.deleteMany();
	await Appendix.deleteMany();
	await Request.deleteMany();
	await Lc.deleteMany();
	await Amendment.deleteMany();
	await Extension.deleteMany();

	await new User(admin).save();
	await new User(activeUserOne).save();
	await new User(activeUserTwo).save();
	await new User(archivedUserOne).save();
	await new Supplier(supplierOne).save();
	await new Supplier(supplierTwo).save();
	await new Supplier(supplierThree).save();
	await new Supplier(supplierFour).save();
	await new Contract(contractOne).save();
	await new Contract(contractTwo).save();
	await new Contract(contractThree).save();
	await new Contract(contractFour).save();
	await new Contract(contractFive).save();
	await new Appendix(appendixOne).save();
	await new Appendix(appendixTwo).save();
	await new Appendix(appendixThree).save();
	await new Request(newRequest).save();
	await new Request(approvedRequest).save();
	await new Request(inprogressRequest).save();
	await new Request(inprogressRequestOne).save();
	await new Request(requestForAmendment).save();
	await new Request(requestForExtension).save();
	await new Request(requestForBoth).save();
	await new Request(executedRequest).save();
	await new Lc(lcOne).save();
};

module.exports = {
	adminId,
	admin,
	activeUserOneId,
	activeUserOne,
	activeUserTwoId,
	activeUserTwo,
	archivedUserOneId,
	archivedUserOne,
	supplierOneId,
	supplierOne,
	supplierTwoId,
	supplierTwo,
	supplierThreeId,
	supplierThree,
	supplierFourId,
	supplierFour,
	contractOneId,
	contractOne,
	contractTwoId,
	contractTwo,
	contractThreeId,
	contractThree,
	contractFourId,
	contractFour,
	contractFiveId,
	contractFive,
	appendixOneId,
	appendixOne,
	appendixTwoId,
	appendixTwo,
	appendixThreeId,
	appendixThree,
	newRequestId,
	newRequest,
	approvedRequestId,
	approvedRequest,
	inprogressRequestId,
	inprogressRequest,
	inprogressRequestOneId,
	inprogressRequestOne,
	executedRequestId,
	executedRequest,
	requestForAmendmentId,
	requestForAmendment,
	requestForExtensionId,
	requestForExtension,
	requestForBothId,
	requestForBoth,
	lcOneId,
	lcOne,
	setupDatabase
};
