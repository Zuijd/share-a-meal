const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
let database = []

chai.should()
chai.use(chaiHttp)

//UC-201
describe('Manage users /api/user', () => {
    describe('UC-201-1 add user without firstname', () => {
        beforeEach((done) => {
            database = []
            done();
        })

        it('When a required input it missing, a valid error should be returned.', (done) => {
            chai.request(server)
                .post('/api/user/')
                .send({
                    //no firstname
                    "lastName": "Doe",
                    "street": "Lovensdijkstraat 61",
                    "city": "Breda",
                    "password": "secret",
                    "emailAdress": "new.doe@server.com"
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

    describe('UC-201-2 add user without lastname', () => {
        beforeEach((done) => {
            database = []
            done();
        })

        it('When a required input it missing, a valid error should be returned.', (done) => {
            chai.request(server)
                .post('/api/user/')
                .send({
                    "firstName": "John",
                    // lastname
                    "street": "Lovensdijkstraat 61",
                    "city": "Breda",
                    "password": "secret",
                    "emailAdress": "new.doe@server.com"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {
                        status,
                        result
                    } = res.body
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('Lastname must be a string')
                    done();
                })
        })
    })

    describe('UC-201-3 add user without street', () => {
        beforeEach((done) => {
            database = []
            done();
        })

        it('When a required input it missing, a valid error should be returned.', (done) => {
            chai.request(server)
                .post('/api/user/')
                .send({
                    "firstName": "John",
                    "lastName": "Doe",
                    // street
                    "city": "Breda",
                    "password": "secret",
                    "emailAdress": "new.doe@server.com"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {
                        status,
                        result
                    } = res.body
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('Street must be a string')
                    done();
                })
        })
    })

    describe('UC-201-4 add user without city', () => {
        beforeEach((done) => {
            database = []
            done();
        })

        it('When a required input it missing, a valid error should be returned.', (done) => {
            chai.request(server)
                .post('/api/user/')
                .send({
                    "firstName": "John",
                    "lastName": "Doe",
                    "street": "Lovensdijkstraat 61",
                    // city
                    "password": "secret",
                    "emailAdress": "new.doe@server.com"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {
                        status,
                        result
                    } = res.body
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('City must be a string')
                    done();
                })
        })
    })

    describe('UC-201-5 add user without password', () => {
        beforeEach((done) => {
            database = []
            done();
        })

        it('When a required input it missing, a valid error should be returned.', (done) => {
            chai.request(server)
                .post('/api/user/')
                .send({
                    "firstName": "John",
                    "lastName": "Doe",
                    "street": "Lovensdijkstraat 61",
                    "city": "Breda",
                    // password
                    "emailAdress": "new.doe@server.com"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {
                        status,
                        result
                    } = res.body
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('Password must be a string')
                    done();
                })
        })
    })

    describe('UC-201-6 add user without emailAdress', () => {
        beforeEach((done) => {
            database = []
            done();
        })

        it('When a required input it missing, a valid error should be returned.', (done) => {
            chai.request(server)
                .post('/api/user/')
                .send({
                    "firstName": "John",
                    "lastName": "Doe",
                    "street": "Lovensdijkstraat 61",
                    "city": "Breda",
                    "password": "secret",
                    // emailAdress
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {
                        status,
                        result
                    } = res.body
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('EmailAdress must be a string')
                    done();
                })
        })
    })
})