const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')

const assert = require('assert')
chai.should()
chai.expect()
chai.use(chaiHttp)

//UC-201
describe('Manage users /api/user', () => {
    describe('UC-201-1 add user with missing value', () => {

        it('TC-201-1 Verplicht veld ontbreekt', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    city: "City",
                    emailAdress: "chai@test.com",
                    password: "pass123",
                    isActive: 1, 
                    phoneNumber: "121212",

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
    })
})