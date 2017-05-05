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
var compile = require('../../lib/compile.js')
var mocha = require('mocha')
var util = require('util')
var fullProcessed = require('./documents/fullProcessed.json')

describe('compile', function() {
    describe('no options', function() {
        it ('should compile all processed correctly', function(done) {
            var tests = compile(fullProcessed, {})
            
            expect(tests).to.not.be.null
            tests.forEach(function(test, ndx, arr) {
                expect(test).to.have.property('filename')
                expect(test).to.have.property('contents')
            });

            done()
        })

        it ('should return null', function(done) {
            var tests = compile({'tests': []}, {})
            
            expect(tests).to.be.null

            done()
        })
    })
})