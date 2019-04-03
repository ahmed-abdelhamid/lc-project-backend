test('just a test', () => {});
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Lc = require('../src/models/lcModel');
const Request = require('../src/models/requestModel');
const {
	adminId,
	admin,
	activeUserOne,
	activeUserTwoId,
	supplierOneId,
	supplierTwoId,
	supplierThreeId,
	newRequestId,
	inprogressRequestOneId,
	lcOneId,
	lcOne,
	setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

///////////////////////////////////////////////////////////////////////////////
///////////////////  TESTS RELATED TO CREATE NEW LC  //////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should create new lc', async () => {
	const { body } = await request(app)
		.post(`/requests/${inprogressRequestOneId}/lcs`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({
			supplierId: supplierTwoId,
			issuer: 'New Issuer',
			bankName: 'New Bank',
			number: 'abc123',
			issueDate: new Date(),
			expiryDate: new Date(),
			amount: 1000
		})
		.expect(201);
	expect(body).toMatchObject({
		issuer: 'New Issuer',
		createdBy: adminId.toString(),
		supplierId: supplierTwoId.toString()
	});
	const executedRequest = await Request.findById(inprogressRequestOneId);
	expect(executedRequest.state).toEqual('executed');
});

test('Should not create new lc if wrong supplier id', async () => {
	await request(app)
		.post(`/requests/${inprogressRequestOneId}/lcs`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({
			supplierId: new mongoose.Types.ObjectId(),
			issuer: 'New Issuer',
			bankName: 'New Bank',
			number: 'abc123',
			issueDate: new Date(),
			expiryDate: new Date(),
			amount: 1000
		})
		.expect(400);
	const inprogressRequest = await Request.findById(inprogressRequestOneId);
	expect(inprogressRequest.state).toEqual('inprogress');
});

test('Should not create new lc if wrong request id', async () => {
	await request(app)
		.post(`/requests/${new mongoose.Types.ObjectId()}/lcs`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({
			supplierId: supplierTwoId,
			issuer: 'New Issuer',
			bankName: 'New Bank',
			number: 'abc123',
			issueDate: new Date(),
			expiryDate: new Date(),
			amount: 1000
		})
		.expect(400);
	const inprogressRequest = await Request.findById(inprogressRequestOneId);
	expect(inprogressRequest.state).toEqual('inprogress');
});

test('Should not create new lc if supplier dose not match with supplier in request', async () => {
	await request(app)
		.post(`/requests/${inprogressRequestOneId}/lcs`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({
			supplierId: supplierOneId,
			issuer: 'New Issuer',
			bankName: 'New Bank',
			number: 'abc123',
			issueDate: new Date(),
			expiryDate: new Date(),
			amount: 1000
		})
		.expect(400);
	const inprogressRequest = await Request.findById(inprogressRequestOneId);
	expect(inprogressRequest.state).toEqual('inprogress');
});

test('Should not create new lc if not in progress request', async () => {
	await request(app)
		.post(`/requests/${newRequestId}/lcs`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({
			supplierId: supplierThreeId,
			issuer: 'New Issuer',
			bankName: 'New Bank',
			number: 'abc123',
			issueDate: new Date(),
			expiryDate: new Date(),
			amount: 1000
		})
		.expect(400);
	const newRequest = await Request.findById(inprogressRequestOneId);
	expect(newRequest.state).toEqual('inprogress');
});

///////////////////////////////////////////////////////////////////////////////
///////////////////  TESTS RELATED TO GET ALL LCS  ////////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find all lcs', async () => {
	const { body } = await request(app)
		.get('/lcs')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body).toHaveLength(1);
});

///////////////////////////////////////////////////////////////////////////////
////////////////  TESTS RELATED TO GET A LC BY ID  ////////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find lc by id', async () => {
	const { body } = await request(app)
		.get(`/lcs/${lcOneId}`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body.bankName).toEqual(lcOne.bankName);
});

test('Should not find lc with wrong id', async () => {
	await request(app)
		.get(`/lcs/${new mongoose.Types.ObjectId()}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(404);
});

///////////////////////////////////////////////////////////////////////////////
////////////////  TESTS RELATED TO UPDATE LC BY ID  ///////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should update lc by id', async () => {
	const { body } = await request(app)
		.patch(`/lcs/${lcOneId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ notes: 'This is a new note' })
		.expect(200);
	expect(body.notes).toEqual('This is a new note');
});

test('Should not update lc if invalid update', async () => {
	await request(app)
		.patch(`/lcs/${lcOneId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ createdBy: activeUserTwoId })
		.expect(400);
	const lc = await Lc.findById(lcOneId);
	expect(lc.createdBy).toEqual(lcOne.createdBy);
});

test('Should not update lc if invalid id', async () => {
	await request(app)
		.patch(`/lcs/${new mongoose.Types.ObjectId()}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ notes: 'This is a new note' })
		.expect(400);
});

///////////////////////////////////////////////////////////////////////////////
/////////  TESTS RELATED TO FIND LCS FOR SPECIFIC SUPPLIER  ///////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find all lcs for a supplier', async () => {
	const { body } = await request(app)
		.get(`/suppliers/${supplierOneId}/lcs`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body).toHaveLength(1);
});

test('Should not find any lcs with fake suppliers ', async () => {
	await request(app)
		.get(`/suppliers/${new mongoose.Types.ObjectId()}/contracts`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(404);
});
