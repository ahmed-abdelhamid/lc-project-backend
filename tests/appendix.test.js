const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Appendix = require('../src/models/appendixModel');
const {
	adminId,
	admin,
	activeUserOne,
	activeUserTwoId,
	contractOneId,
	appendixOneId,
	appendixOne,
	setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

///////////////////////////////////////////////////////////////////////////////
///////////////////  TESTS RELATED TO CREATE NEW APPENDIX  ////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should create new appendix', async () => {
	const { body } = await request(app)
		.post(`/contracts/${contractOneId}/appendixes`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ title: 'New Appendix', amount: 5000, duration: 'One Month' })
		.expect(201);
	expect(body).toMatchObject({
		amount: 5000,
		createdBy: adminId.toString(),
		contractId: contractOneId.toString()
	});
});

test('Should not create new appendix if wrong contract id', async () => {
	await request(app)
		.post(`/contracts/${new mongoose.Types.ObjectId()}/appendixes`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ title: 'New Contract', amount: 5000, duration: 'One Month' })
		.expect(400);
});

///////////////////////////////////////////////////////////////////////////////
///////////////////  TESTS RELATED TO GET ALL APPENDIXES  //////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find all appendixes', async () => {
	const { body } = await request(app)
		.get('/appendixes')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body).toHaveLength(3);
});

///////////////////////////////////////////////////////////////////////////////
////////////////  TESTS RELATED TO GET A APPENDIX BY ID  //////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find a contract by id', async () => {
	const { body } = await request(app)
		.get(`/appendixes/${appendixOneId}`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body.name).toEqual(appendixOne.name);
});

test('Should not find appendix with wrong id', async () => {
	await request(app)
		.get(`/appendixes/${new mongoose.Types.ObjectId()}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(404);
});

///////////////////////////////////////////////////////////////////////////////
/////////  TESTS RELATED TO FIND APPENDIXES CREATED BY SPECIFIC USER  //////////
///////////////////////////////////////////////////////////////////////////////
test('Should find all appendixes created by a user', async () => {
	const { body } = await request(app)
		.get(`/users/${activeUserTwoId}/appendixes`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body).toHaveLength(1);
});

test('Should not find any appendixes created by fake user id', async () => {
	await request(app)
		.get(`/users/${new mongoose.Types.ObjectId()}/appendixes`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(404);
});

///////////////////////////////////////////////////////////////////////////////
////////  TESTS RELATED TO FIND APPENDIXES FOR SPECIFIC CONTRACT  /////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find all appendixes for a contract', async () => {
	const { body } = await request(app)
		.get(`/contracts/${contractOneId}/appendixes`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body).toHaveLength(1);
});

test('Should not find any appendixes with a fake contract', async () => {
	await request(app)
		.get(`/contracts/${new mongoose.Types.ObjectId()}/appendixes`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(404);
});

///////////////////////////////////////////////////////////////////////////////
////////////////  TESTS RELATED TO UPDATE APPENDIX BY ID  /////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should update appendix by id', async () => {
	const { body } = await request(app)
		.patch(`/appendixes/${appendixOneId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ notes: 'This is a new note' })
		.expect(200);
	expect(body.notes).toEqual('This is a new note');
});

test('Should not update appendix if invalid update', async () => {
	await request(app)
		.patch(`/appendixes/${appendixOneId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ createdBy: activeUserTwoId })
		.expect(400);
	const appendix = await Appendix.findById(appendixOneId);
	expect(appendix.createdBy).toEqual(appendixOne.createdBy);
});

test('Should not update appendix if invalid id', async () => {
	await request(app)
		.patch(`/appendixes/${new mongoose.Types.ObjectId()}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ notes: 'This is a new note' })
		.expect(400);
});
