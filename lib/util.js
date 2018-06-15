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

module.exports = {
  merge2: merge2
}

/**
 * merges two objects, with obj1 taking override precedent
 * @function merge2
 * @instance
 * @param {object} obj1 dominant object to merge with
 * @param {object} obj2 subordinate object to merge with
 * @return {object}
 */
function merge2(obj1, obj2) {
  if (!obj1) {
    return obj2;
  } else if (!obj2) {
    return obj1;
  }

  var result = obj2

  Object.keys(obj1).forEach(function (key, ndx, arr) {
    result[key] = obj1[key];
  });

  return result
}