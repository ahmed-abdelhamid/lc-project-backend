const request = require('supertest');
const app = require('../src/app');
const Supplier = require('../src/models/supplierModel');
const {
	activeUserOneId,
	activeUserOne,
	activeUserTwoId,
	supplierOneId,
	supplierOne,
	setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

///////////////////////////////////////////////////////////////////////////////
///////////////////  TESTS RELATED TO CREATE NEW SUPPLIER  ////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should create new supplier', async () => {
	const { body } = await request(app)
		.post('/suppliers')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send({
			name: 'New Supplier',
			specialization: 'New Specialization'
		})
		.expect(201);
	const supplier = await Supplier.findById(body._id);
	// Check that user saved in database
	expect(supplier).not.toBeNull();
	// Check response
	expect(body).toMatchObject({
		name: 'New Supplier',
		createdBy: activeUserOneId.toString()
	});
});

///////////////////////////////////////////////////////////////////////////////
///////////////////  TESTS RELATED TO READ ALL SUPPLIERS  /////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should get all suppliers', async () => {
	const { body } = await request(app)
		.get('/suppliers')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	const suppliers = await Supplier.find();
	expect(body).toHaveLength(suppliers.length);
});

///////////////////////////////////////////////////////////////////////////////
//////////////////  TESTS RELATED TO READ SUPPLIER BY ID  /////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find supplier by id', async () => {
	const { body } = await request(app)
		.get(`/suppliers/${supplierOneId}`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body.name).toEqual(supplierOne.name);
});

test('Should not find supplier of wrong id', async () => {
	await request(app)
		.get('/suppliers/abc123')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(404);
});

///////////////////////////////////////////////////////////////////////////////
////////////////  TESTS RELATED TO UPDATE SUPPLIER BY ID  /////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should update supplier by id', async () => {
	const { body } = await request(app)
		.patch(`/suppliers/${supplierOneId}`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send({ notes: 'This is a new note' })
		.expect(200);
	expect(body.notes).toEqual('This is a new note');
});

test('Should not update supplier if invalid update', async () => {
	await request(app)
		.patch(`/suppliers/${supplierOneId}`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send({ createdBy: activeUserTwoId })
		.expect(400);
	const supplier = await Supplier.findById(supplierOneId);
	expect(supplier.createdBy).toEqual(supplierOne.createdBy);
});
