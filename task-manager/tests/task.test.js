const supertest = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOneId, userOne, userTwo,
    taskOne, 
    taskThree, 
    setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async() => {
    const response = await supertest(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: 'From my tests',
    })
    .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should get userOne\'s tasks', async() => {
    const response = await supertest(app)
    .get(`/tasks`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toEqual(2)
})

test('Should test task security', async() => {
    await supertest(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
})