const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Contract = require('../src/models/contractModel');
const {
	adminId,
	admin,
	activeUserOne,
	activeUserTwoId,
	supplierOneId,
	supplierThreeId,
	contractOneId,
	contractOne,
	setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

///////////////////////////////////////////////////////////////////////////////
///////////////////  TESTS RELATED TO CREATE NEW CONTRACT  ////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should create new contract', async () => {
	const { body } = await request(app)
		.post(`/suppliers/${supplierOneId}/contracts`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ title: 'New Contract', amount: 5000, duration: 'One Month' })
		.expect(201);
	expect(body).toMatchObject({
		amount: 5000,
		createdBy: adminId.toString(),
		supplierId: supplierOneId.toString()
	});
});

test('Should not create new contract if wrong supplier id', async () => {
	await request(app)
		.post(`/suppliers/${new mongoose.Types.ObjectId()}/contracts`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ title: 'New Contract', amount: 5000, duration: 'One Month' })
		.expect(400);
});

///////////////////////////////////////////////////////////////////////////////
///////////////////  TESTS RELATED TO GET ALL CONTRACTS  //////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find all contracts', async () => {
	const { body } = await request(app)
		.get('/contracts')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body).toHaveLength(5);
});

///////////////////////////////////////////////////////////////////////////////
////////////////  TESTS RELATED TO GET A CONTRACT BY ID  //////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find a contract by id', async () => {
	const { body } = await request(app)
		.get(`/contracts/${contractOneId}`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body.name).toEqual(contractOne.name);
});

test('Should not find a contract with wrong id', async () => {
	await request(app)
		.get(`/users/${new mongoose.Types.ObjectId()}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(404);
});

///////////////////////////////////////////////////////////////////////////////
/////////  TESTS RELATED TO FIND CONTRACTS CREATED BY SPECIFIC USER  //////////
///////////////////////////////////////////////////////////////////////////////
test('Should find all contracts created by a user', async () => {
	const { body } = await request(app)
		.get(`/users/${activeUserTwoId}/contracts`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body).toHaveLength(2);
});

test('Should not find any suppliers created by fake user id', async () => {
	await request(app)
		.get(`/users/${new mongoose.Types.ObjectId()}/contracts`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(404);
});

///////////////////////////////////////////////////////////////////////////////
/////////  TESTS RELATED TO FIND CONTRACTS FOR SPECIFIC SUPPLIER  /////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find all contracts for a supplier', async () => {
	const { body } = await request(app)
		.get(`/suppliers/${supplierThreeId}/contracts`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body).toHaveLength(2);
});

test('Should not find any suppliers created by fake user id', async () => {
	await request(app)
		.get(`/suppliers/${new mongoose.Types.ObjectId()}/contracts`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(404);
});

///////////////////////////////////////////////////////////////////////////////
////////////////  TESTS RELATED TO UPDATE CONTRACT BY ID  /////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should update contract by id', async () => {
	const { body } = await request(app)
		.patch(`/contracts/${contractOneId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ notes: 'This is a new note' })
		.expect(200);
	expect(body.notes).toEqual('This is a new note');
});

test('Should not update contract if invalid update', async () => {
	await request(app)
		.patch(`/contracts/${contractOneId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ createdBy: activeUserTwoId })
		.expect(400);
	const contract = await Contract.findById(contractOneId);
	expect(contract.createdBy).toEqual(contractOne.createdBy);
});

test('Should not update contract if invalid id', async () => {
	await request(app)
		.patch(`/contracts/${new mongoose.Types.ObjectId()}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ notes: 'This is a new note' })
		.expect(400);
});
