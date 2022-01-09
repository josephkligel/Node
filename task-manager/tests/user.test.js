const supertest = require('supertest');
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup user', async () => {
    const response = await supertest(app)
    .post('/users').send({
        name: "Andrew",
        email: "andrew@example.com",
        password: "MyPass777!"
    }).expect(201)

    // assertions about the user
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew',
            email: 'andrew@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe("MyPass777!")
})

test('Should login existing user', async () => {
    const response = await supertest(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non-existent user', async() => {
    await supertest(app).post('/users/login').send({
        email: 'noSuchName',
        password: 'blahblah'
    }).expect(400)
})

test('Should get profile', async () => {
    await supertest(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile back', async() => {
    await supertest(app)
    .get('/users/me')
    .send()
    .expect(404)
})

test('Should delete account for user', async () => {
    await supertest(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

// test('Should not delete user account', async () => {
//     await supertest(app)
//     .delete('/users/me')
//     .send()
//     .expect(404)
// })

test('Should upload avatar image', async() => {
    await supertest(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', './tests/fixtures/profile-pic.jpg')
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
   await supertest(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Joseph Kligel'
    })
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Joseph Kligel')
})

test('Should not update user fields', async() => {
    await supertest(app)
    .patch('/users/me')
    .send({
        location: 'D.C.'
    })
    .expect(404)
})
