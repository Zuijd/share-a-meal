const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
let database = []

chai.should()
chai.use(chaiHttp)

describe('Manage users /api/user', () => {
    describe('UC-201 add user', () => {
        beforeEach((done) => {
            database = []
            done();
        })

        it('When a required input it missing, a valid error should be returned.', (done) => {
            chai.request(server)
                .post('/api/user/')
                .send({
                    //no firstname
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "new.doe@server.com"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {
                        status,
                        result
                    } = res.body
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('Firstname must be a string')
                    done();
                })
        })
    })
})