const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Request = require('../src/models/requestModel');
const Amendment = require('../src/models/amendmentModel');
const Extension = require('../src/models/extensionModel');
const {
	adminId,
	admin,
	activeUserOne,
	supplierOneId,
	supplierThreeId,
	newRequestId,
	approvedRequestId,
	requestForAmendmentId,
	requestForExtensionId,
	requestForBothId,
	lcOneId,
	inprogressRequestId,
	setupDatabase,
} = require('./fixtures/db');

beforeEach(setupDatabase);

///////////////////////////////////////////////////////////////////////////////
///////////////////  TESTS RELATED TO CREATE NEW REQUEST  /////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should create new request', async () => {
	const { body } = await request(app)
		.post(`/suppliers/${supplierOneId}/requests`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ upTo: new Date() })
		.expect(201);
	expect(body).toMatchObject({
		createdBy: adminId.toString(),
		supplierId: supplierOneId.toString(),
		state: 'new',
	});
});

test('Should not create new request if wrong supplier id', async () => {
	await request(app)
		.post(`/suppliers/${new mongoose.Types.ObjectId()}/requests`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ amount: 1000 })
		.expect(400);
});

test('Should not create new request if not upTo or amount created', async () => {
	await request(app)
		.post(`/suppliers/${supplierOneId}/requests`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({})
		.expect(400);
});

///////////////////////////////////////////////////////////////////////////////
///////////////////  TESTS RELATED TO GET ALL REQUESTS  ///////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find all requests', async () => {
	const { body } = await request(app)
		.get('/requests')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body).toHaveLength(8);
});

///////////////////////////////////////////////////////////////////////////////
////////////////  TESTS RELATED TO GET A REQUEST BY ID  ///////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find a request by id', async () => {
	const { body } = await request(app)
		.get(`/requests/${newRequestId}`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body.state).toEqual('new');
});

test('Should not find a request with wrong id', async () => {
	await request(app)
		.get(`/requests/${new mongoose.Types.ObjectId()}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(404);
});

///////////////////////////////////////////////////////////////////////////////
/////////  TESTS RELATED TO FIND REQUESTS FOR SPECIFIC SUPPLIER  //////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find all requests for a supplier', async () => {
	const { body } = await request(app)
		.get(`/suppliers/${supplierThreeId}/requests`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body).toHaveLength(2);
});

test('Should not find any requests with fake suppliers ', async () => {
	await request(app)
		.get(`/suppliers/${new mongoose.Types.ObjectId()}/requests`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(404);
});

///////////////////////////////////////////////////////////////////////////////
////////////////  TESTS RELATED TO UPDATE REQUEST BY ID  //////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should update request if still new', async () => {
	const { body } = await request(app)
		.patch(`/requests/${newRequestId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ amount: 2000 })
		.expect(200);
	expect(body.amount).toEqual(2000);
});

test('Should not update request if not new', async () => {
	await request(app)
		.patch(`/requests/${approvedRequestId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ upTo: new Date() })
		.expect(400);
	const approvedRequest = await Request.findById(approvedRequestId);
	expect(approvedRequest.upTo).toBeUndefined();
});

///////////////////////////////////////////////////////////////////////////////
/////////////  TESTS RELATED TO APPROVING REQUEST BY ID  //////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should approve request if new', async () => {
	await request(app)
		.patch(`/requests/${newRequestId}/approve`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(200);
	const newRequest = await Request.findById(newRequestId);
	expect(newRequest.state).toEqual('approved');
});

test('Should not approve request if not new', async () => {
	await request(app)
		.patch(`/requests/${inprogressRequestId}/approve`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(400);
	const inprogressRequest = await Request.findById(inprogressRequestId);
	expect(inprogressRequest.state).toEqual('executed');
});

///////////////////////////////////////////////////////////////////////////////
/////////  TESTS RELATED TO INPROGRESSING REQUEST BY ID  //////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should inprogress request if approved', async () => {
	await request(app)
		.patch(`/requests/${approvedRequestId}/inprogress`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(200);
	const approvedRequest = await Request.findById(approvedRequestId);
	expect(approvedRequest.state).toEqual('inprogress');
});

test('Should not inprogress request if not approved', async () => {
	await request(app)
		.patch(`/requests/${newRequestId}/inprogress`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(400);
	const newRequest = await Request.findById(newRequestId);
	expect(newRequest.state).toEqual('new');
});

///////////////////////////////////////////////////////////////////////////////
/////////  TESTS RELATED TO EXECUTING REQUEST BY ID  //////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should execute request and create new amendment', async () => {
	await request(app)
		.patch(`/requests/${requestForAmendmentId}/execute`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ lcId: lcOneId, amount: 5000 })
		.expect(201);
	const amendments = await Amendment.find();
	const extensions = await Extension.find();
	const amendmentRequest = await Request.findById(requestForAmendmentId);
	expect(amendments).toHaveLength(1);
	expect(extensions).toHaveLength(0);
	expect(amendmentRequest.state).toEqual('executed');
});

test('Should execute request and create new extension', async () => {
	await request(app)
		.patch(`/requests/${requestForExtensionId}/execute`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ lcId: lcOneId, upTo: new Date() })
		.expect(201);
	const amendments = await Amendment.find();
	const extensions = await Extension.find();
	const extensionRequest = await Request.findById(requestForExtensionId);
	expect(amendments).toHaveLength(0);
	expect(extensions).toHaveLength(1);
	expect(extensionRequest.state).toEqual('executed');
});

test('Should execute request and create new amendment and extension', async () => {
	await request(app)
		.patch(`/requests/${requestForBothId}/execute`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ lcId: lcOneId, upTo: new Date(), amount: 10000 })
		.expect(201);
	const amendments = await Amendment.find();
	const extensions = await Extension.find();
	const bothRequest = await Request.findById(requestForBothId);
	expect(amendments).toHaveLength(1);
	expect(extensions).toHaveLength(1);
	expect(bothRequest.state).toEqual('executed');
});

test('Should not execute request if wrong request id', async () => {
	await request(app)
		.patch(`/requests/${new mongoose.Types.ObjectId()}/execute`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ lcId: lcOneId, upTo: new Date(), amount: 10000 })
		.expect(400);
	const amendments = await Amendment.find();
	const extensions = await Extension.find();
	expect(amendments).toHaveLength(0);
	expect(extensions).toHaveLength(0);
});

test('Should not execute request if wrong lc id', async () => {
	await request(app)
		.patch(`/requests/${requestForBothId}/execute`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({
			lcId: new mongoose.Types.ObjectId(),
			upTo: new Date(),
			amount: 10000,
		})
		.expect(400);
	const amendments = await Amendment.find();
	const extensions = await Extension.find();
	expect(amendments).toHaveLength(0);
	expect(extensions).toHaveLength(0);
});
