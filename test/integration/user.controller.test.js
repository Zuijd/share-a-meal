const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')

const assert = require('assert')
chai.should()
chai.expect()
chai.use(chaiHttp)

let createdUserId;

describe('UC-2 Manage users /api/user', () => {
    describe('UC-201 Register as new user', () => {

        it('TC-201-1 Mandatory field is missing', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    city: "City",
                    emailAdress: "chai@test.com",
                    password: "pass123",
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number')
                    message.should.be
                        .a('string')
                        .that.contains('Street must be a string')

                    done()
                })
        })

        it('TC-201-2 Invalid email address', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    street: "street",
                    city: "City",
                    emailAdress: 1,
                    password: "pass123",
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number')
                    message.should.be
                        .a('string')
                        .that.contains('EmailAdress must be a string')

                    done()
                })
        })

        it('TC-201-3 Invalid password', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    street: "street",
                    city: "City",
                    emailAdress: "chai@test.com",
                    password: 1,
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number')
                    message.should.be
                        .a('string')
                        .that.contains('Password must be a string')

                    done()
                })
        })

        it('TC-201-4 User already exists', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    street: "street",
                    city: "City",
                    emailAdress: "chai@test.com",
                    password: "1",
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(409)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number')
                    message.should.be
                        .a('string')
                        .that.contains('User already exist')

                    done()
                })
        })

        it('TC-201-5 User registered successfully', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "New",
                    lastName: "User",
                    street: "Street",
                    city: "City",
                    emailAdress: "new@User.com",
                    password: "newUser123",
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(201)
                    res.should.be.an('object')



                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'result')

                    let {
                        status,
                        result
                    } = res.body
                    status.should.be.a('number')
                    result.should.have.property('firstName').and.to.be.a('string')
                    result.should.have.property('lastName').and.to.be.a('string')
                    result.should.have.property('street').and.to.be.a('string')
                    result.should.have.property('city').and.to.be.a('string')
                    result.should.have.property('emailAdress').and.to.be.a('string')
                    result.should.have.property('password').and.to.be.a('string')
                    createdUserId = result.id
                    done()
                })
        })
    })

    // describe('UC-206 Delete user', () => {
    //     it('TC-206-4 User successfully deleted', (done) => {
    //         chai.request(server)
    //             .delete('/api/user/' + createdUserId)
    //             .end((err, res) => {
    //                 assert.ifError(err)
    //                 res.should.have.status(200)
    //                 res.should.be.an('object')

    //                 res.body.should.be
    //                     .an('object')
    //                     .that.has.all.keys('status', 'message')

    //                 let {
    //                     status, 
    //                     message
    //                 } = res.body
    //                 status.should.be.a('number')
    //                 message.should.be.a('string')
    //                 .that.contains('User succesfully deleted')
    //                 done()
    //             })
    //     })
    // })
})