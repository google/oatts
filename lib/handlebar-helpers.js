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

/**
 * @namespace templateHelpers
 */

module.exports = {
  notEmptyObject: notEmptyObject,
  json: json,
  isNotDefaultStatusCode: isNotDefaultStatusCode
}

/**
 * determines if the given object is empty or not
 * @function notEmptyObject
 * @memberof templateHelpers
 * @instance
 * @param {object} obj object to be evaluated
 * @return {boolean}
 */
function notEmptyObject(obj) {
  if (arguments.length < 1) {
    throw new Error('Handlebars Helper \'notEmptyObject\' needs 1 parameter');
  }

  return obj !== undefined && Object.keys(obj).length !== 0
}

/**
 * stringifies the given JSON object
 * @function json
 * @memberof templateHelpers
 * @instance
 * @param {object} obj JSON object to be stringified
 * @return {string}
 */
function json(obj) {
  if (arguments.length < 1) {
    throw new Error('Handlebars Helper \'json\' needs 1 parameter');
  }

  return JSON.stringify(obj)
}

/**
 * determines if the given status code is the 'default' status
 * @function isNotDefaultStatusCode
 * @memberof templateHelpers
 * @instance
 * @param {(string | number)} code status code to check
 * @return {boolean}
 */
function isNotDefaultStatusCode(code) {
  if (arguments.length < 1) {
    throw new Error(
        'Handlebars Helper \'isNotDefaultStatusCode\' needs 1 parameter');
  }

  return code !== 'default'
}