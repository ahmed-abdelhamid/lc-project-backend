const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Request = require('../src/models/requestModel');
const {
	adminId,
	admin,
	activeUserOne,
	supplierOneId,
	supplierThreeId,
	newRequestId,
	approvedRequestId,
	inprogressRequestId,
	setupDatabase
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
		requestedBy: adminId.toString(),
		supplierId: supplierOneId.toString(),
		state: 'new'
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
	expect(body).toHaveLength(5);
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
