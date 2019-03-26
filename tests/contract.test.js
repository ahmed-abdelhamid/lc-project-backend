const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Contract = require('../src/models/contractModel');
const {
	adminId,
	admin,
	activeUserOne,
	supplierOneId,
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
