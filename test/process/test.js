// Copyright 2017 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var expect = require('chai').expect
var process = require('../../lib/process.js')
var mocha = require('mocha')
var util = require('util')
var sway = require('sway')
var specPath = './test/process/documents/swagger.yaml'


describe('process', function() {
    describe('no options', function() {
        it('should process all correctly', function(done) {
            sway.create({'definition': specPath})
            .then(function (api) {
                var data = process(api, {})
                expect(data).to.not.be.null
                expect(data.host).to.equal("petstore.swagger.io", "host property did not match the spec")
                expect(data.schemes).to.not.be.empty
                expect(data.tests).to.not.be.empty
                done()
            }, function (err) {
                done(err)
            });
        })
    })

    describe('option-based', function() {
        it('should process just \'/pet\' correctly', function(done) {
            sway.create({'definition': specPath})
            .then(function (api) {
                var data = process(api, {'paths': ['/pet']})
                expect(data).to.not.be.null
                expect(data.host).to.equal("petstore.swagger.io", "host property did not match the spec")
                expect(data.schemes).to.not.be.empty
                expect(data.schemes[0]).to.equal("http", "expected schemes to be http but it was: " + data.schemes[0])
                expect(data.consumes).to.be.empty
                expect(data.tests.length).to.equal(1, "returned tests set was expected to have 1 item, but it had " + data.tests.length)
                done()
            }, function (err) {
                done(err)
            });
        })

        it('should process with option.host correctly', function(done) {
            var optionHost = 'test.acme.net'
            sway.create({'definition': specPath})
            .then(function (api) {
                var data = process(api, {'host': optionHost})
                expect(data).to.not.be.null
                expect(data.host).to.equal(optionHost, "generated host property expected to be " + optionHost + " but was " + data.host)
                expect(data.schemes).to.not.be.empty
                expect(data.tests).to.not.be.empty
                done()
            }, function (err) {
                done(err)
            });
        })

        it('should process \'/pet/{petId}\' & \'/pet\' with option.samples active correctly', function(done) {
            sway.create({'definition': specPath})
            .then(function (api) {
                var data = process(api, {'samples': true, 'paths': ['/pet/{petId}']})
                expect(data).to.not.be.null
                expect(data.host).to.equal("petstore.swagger.io", "host property did not match the spec")
                expect(data.schemes).to.not.be.empty
                expect(data.tests).to.not.be.empty
                done()
            }, function (err) {
                done(err)
            });
        })
    })
})