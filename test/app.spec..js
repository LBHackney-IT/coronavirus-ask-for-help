var expect  = require('chai').expect;
var request = require('request');

describe("Application Tests", function() {

    it('Renders the index page', function(done) {
        request('http://0.0.0.0:9000' , function(error, response, body) {
            expect(response.statusCode).to.equal(200)
            done();
        });
    });
});