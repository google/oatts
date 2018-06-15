// Copyright 2018 Google Inc. All Rights Reserved.
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

'use strict';

var proc = require('./lib/process.js')
var compile = require('./lib/compile.js')
var sway = require('sway')
var fs = require('fs')
var join = require('path').join
var merge2 = require('./lib/util').merge2

module.exports = {
  generate: generate
}

/**
 * GenerationResults is the final result of the generation function
 * @typedef {object} GenerationResults
 * @property {compilation.GeneratedTest[]} generated set of generated test objects
 */

/**
 * Generates test artifacts based on the given API Spec and options
 * @function generate
 * @instance
 * @param {string} specPath path to the API spec document
 * @param {object} options options to apply during processing of API spec
 * @return {Promise<GenerationResults>}
 */
function generate(specPath, options) {
  return sway.create({'definition': specPath})
      .then(function (api) {
        if (options.customValues) {
          options.customValues = JSON.parse(options.customValues);
        }

        if (options.customValuesFile) {
          var customFromFile = require(
              join(process.cwd(), options.customValuesFile))
          options.customValues = merge2(options.customValues, customFromFile)
        }

        var processed = proc(api, options)
        var compiled = compile(processed, options)

        if (options.writeTo !== undefined) {
          if (!fs.existsSync(options.writeTo)) {
            fs.mkdirSync(options.writeTo)
          }

          compiled.forEach(function (testObj, ndx, arr) {
            fs.writeFile(join(options.writeTo, testObj.filename),
                testObj.contents, function (err) {
                  if (err !== null) {
                    console.error(err)
                  }
                })
          })
        }

        return {'generated': compiled}
      }, function (err) {
        console.error(err.stack);
        return err
      });
}