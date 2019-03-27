const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Lc = require('../src/models/lcModel');
const {
	adminId,
	admin,
	activeUserOne,
	activeUserTwoId,
	supplierOneId,
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
		.post(`/suppliers/${supplierOneId}/lcs`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ issuer: 'New Issuer', bankName: 'New Bank' })
		.expect(201);
	expect(body).toMatchObject({
		issuer: 'New Issuer',
		createdBy: adminId.toString(),
		supplierId: supplierOneId.toString()
	});
});

test('Should not create new lc if wrong supplier id', async () => {
	await request(app)
		.post(`/suppliers/${new mongoose.Types.ObjectId()}/lcs`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ issuer: 'New Issuer', bankName: 'New Bank' })
		.expect(400);
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
test('Should find a contract by id', async () => {
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
