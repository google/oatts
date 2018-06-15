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

var util = require('util')
var helpers = require('./handlebar-helpers')
var merge2 = require('./util').merge2;

/**
 * @namespace processing
 */

module.exports = process

/**
 * ProcessedSpec is the fully traversed spec processed for unit test compilation
 * @typedef {object} ProcessedSpec
 * @memberof processing
 * @property {string} host Hostname to be used in the test requests; derived from the options or spec
 * @property {string} scheme HTTP schema to be used in the test requests; derived from the spec
 * @property {string} basePath Base path as defined by the spec
 * @property {string[]} consumes Global content type 'consumes' collection
 * @property {ProcessedPath[]} tests Collection of paths processed for test compilation
 */

/**
 * Processes the given API spec, creating test data artifacts
 * @function process
 * @memberof processing
 * @instance
 * @param {object} api API spec object to be processed
 * @param {object} options options to be used during processing
 * @return {processing.ProcessedSpec}
 */
function process(api, options) {
  var processedSpec = {
    'host': (options.host !== undefined ? options.host : (api.host !== undefined
        ? api.host : 'localhost:5000')),
    'scheme': (options.scheme !== undefined ? options.scheme : (api.schemes
    !== undefined ? api.schemes[0] : 'http')),
    'basePath': (api.basePath !== undefined ? api.basePath : ''),
    'consumes': (api.consumes !== undefined ? api.consumes : []),
    'produces': (api.produces !== undefined ? api.produces : [])
  }

  var processedPaths = processPaths(api, processedSpec, options)
  if (processedPaths.length == 0) {
    console.log('no paths to process in spec')
    return null
  }

  processedSpec.tests = processedPaths

  return processedSpec
}

/**
 * ProcessedPath is the fully traversed path resource ready for unit test compilation
 * @typedef {object} ProcessedPath
 * @memberof processing
 * @property {string} name name to be used in generation of a file name; based on the path
 * @property {string} pathLevelDescription the brief description to use at the top level 'describe' block
 * @property {processing.ProcessedOp[]} operations Collection of operations processed for test compilation
 */

/**
 * Processes the paths defined by the api spec, or indicated by the options
 * @function processPaths
 * @memberof processing
 * @instance
 * @param {object} api parsed OpenAPI spec object
 * @param {object} topLevel global spec properties
 * @param {object} options options to use during processing
 * @return {processing.ProcessedPath[]}
 */
function processPaths(api, topLevel, options) {
  var data = []
  var targetPaths = [];

  if (options.paths !== undefined) {
    options.paths.forEach(function (path, ndx, arr) {
      targetPaths.push(api.getPath(path))
    })
  } else {
    targetPaths = api.getPaths();
  }

  if (options.statusCodes !== undefined) {
    var tempPaths = [];
    options.statusCodes.forEach(function (code, ndx, arr) {
      for (var ndx = 0; ndx < targetPaths.length; ndx++) {
        var opList = targetPaths[ndx].getOperations();
        for (var opNdx = 0; opNdx < opList.length; opNdx++) {
          if (opList[opNdx].getResponse(code)) {
            tempPaths.push(targetPaths[ndx])
            break;
          }
        }
      }
    });

    targetPaths = tempPaths;
  }

  targetPaths.forEach(function (pathObj, ndx, arr) {
    var ops = processOperations(api, pathObj, topLevel, options)
    if (ops.length !== 0) {
      data.push({
        'name': pathObj.path.replace(/\//g, '-').substring(1),
        'pathLevelDescription': 'tests for ' + pathObj.path,
        'operations': ops
      })
    }
  })

  return data
}

/**
 * ProcessedOp is the fully traversed path operation ready for unit test compilation
 * @typedef {object} ProcessedOp
 * @memberof processing
 * @instance
 * @property {string} operationLevelDescription the brief description to use at the inner 'describe' block
 * @property {processing.ProcessedTransaction[]} transactions Collection of transactions processed for test compilation
 */

/**
 * Processes the operations of the given Path object
 * @function processOperations
 * @memberof processing
 * @instance
 * @param {object} api parsed OpenAPI spec object
 * @param {object} parentPath sway Path object being processed
 * @param {object} topLevel global spec properties
 * @param {object} options options to use during processing
 * @return {processing.ProcessedOp[]}
 */
function processOperations(api, parentPath, topLevel, options) {
  var ops = []
  parentPath.getOperations().forEach(function (op, ndx, arr) {
    var transactions = processTransactions(api, op, parentPath, topLevel,
        options)
    if (transactions.length !== 0) {
      ops.push({
        'operationLevelDescription': 'tests for ' + op.method,
        'transactions': transactions
      })
    }
  })

  return ops
}

/**
 * ProcessedTransaction is an HTTP transaction (request/response pair) processed for test compilation
 * @typedef {object} ProcessedTransaction
 * @memberof processing
 * @property {string} testLevelDescription the brief description to use in the test 'it' block
 * @property {string} scheme copied from the globally defined HTTP schema
 * @property {string} host copied from the globally defined hostname or as specified in the options
 * @property {string} path fully qualified path built with the base path; includes path param substitutions
 * @property {op} op the REST operation to use
 * @property {object} body the request body params
 * @property {object} query the request query params
 * @property {object} formData the request form data params
 * @property {ExpectedResponse} expected the expected response to use for test validation
 * @property {boolean} hasSamples flag indicating if the expected response includes sample values
 * @property {string[]} consumes based on globally defined conumes or operation defined types
 */

/**
 * Processes the transactions for a given Path + Operation
 * @function processTransactions
 * @memberof processing
 * @instance
 * @param {object} api parsed OpenAPI spec object
 * @param {object} parentOp parent sway Operation object being processed
 * @param {object} parentPath parent sway Path object being processed
 * @param {object} topLevel global spec properties
 * @param {object} options options to use during processing
 * @return {processing.ProcessedTransaction[]}
 */
function processTransactions(api, parentOp, parentPath, topLevel, options) {
  var transactions = []

  parentOp.getResponses().forEach(function (res, ndx, arr) {
    if (options.statusCodes && options.statusCodes.indexOf(res.statusCode)
        === -1) {
      // skip unwanted status codes
      return;
    }

    var params = processParams(res.statusCode, parentOp, parentPath, options)

    var expected = processResponse(res, parentOp.method, parentPath.path,
        options)
    var hasValue = options.samples
    if (expected.custom) {
      delete expected.custom
      hasValue = true
    }

    transactions.push({
      'testLevelDescription': util.format('should respond %s for "%s"',
          res.statusCode, replaceNewlines(res.description)),
      'scheme': topLevel.scheme,
      'host': topLevel.host,
      'path': (topLevel.basePath + params.path),
      'op': parentOp.method,
      'body': params.body,
      'query': params.query,
      'formData': params.formData,
      'expected': expected,
      'hasValue': hasValue,
      'headers': merge2(params.headers,
          processHeaders(res.statusCode, parentOp, parentPath, topLevel,
              options))
    })
  })

  return transactions
}

/**
 * ProcessedParams is an object representing the processed request parameters for unit test compilation
 * @typedef {object} ProcessedParams
 * @memberof processing
 * @property {string} path processed path with path parameter sample substitutions
 * @property {object} body the request body params
 * @property {object} query the request query params
 * @property {object} formData the request form data params
 */

/**
 * Processes the parameters of a Path + Operation for use in a test
 * @function processParams
 * @memberof processing
 * @instance
 * @param {number} code response status code being processed
 * @param {object} op sway Operation object that's being processed
 * @param {object} path sway Path object that's being process
 * @param {object} options options to use during processing
 * @return {processing.ProcessedParams}
 */
function processParams(code, op, path, options) {
  var params = {
    'body': {},
    'query': {},
    'formData': {},
    'path': path.path,
    'headers': {}
  }

  op.getParameters().forEach(function (param, ndx, arr) {
    var customValue = lookupCustomValue(param.name, param.in, code, op.method,
        path.path, options)

    if (param.in === 'body') {
      params.body = customValue !== undefined ? customValue : param.getSample()
    } else if (param.in === 'query') {
      params.query[param.name] = customValue !== undefined ? customValue
          : param.getSample()
    } else if (param.in === 'formData') {
      try {
        params.formData[param.name] = customValue !== undefined ? customValue
            : param.getSample()
      } catch (e) { // this will be because of formData property of type 'file'
        params.formData[param.name] = '{fileUpload}'
      }
    } else if (param.in === 'path') {
      params.path = pathify(params.path, param, customValue)
    } else if (param.in === 'header') {
      params.headers[param.name] = customValue !== undefined ? customValue
          : param.getSample()
    }
  })

  path.getParameters().forEach(function (param, ndx, arr) {
    var customValue = lookupCustomValue(param.name, param.in, code, op.method,
        path.path, options)
    params.path = pathify(params.path, param, customValue)
  })

  return params
}

/**
 * resolves any custom values available for the given parameter
 * @function lookupCustomValue
 * @memberof processing
 * @instance
 * @param {string} name parameter name being looked up
 * @param {string} location where the parameter is in the request/response
 * @param {number} code response status code being evaluated
 * @param {string} op the operation method being processed
 * @param {string} path API path being processed
 * @param {object} options for use in looking up the custom value
 * @return {any}
 */
function lookupCustomValue(name, location, code, op, path, options) {
  var levels = [path, op, code]
  var val = undefined;

  if (options.customValues) {
    var curr = options.customValues

    var ndx = 0
    do {
      if (curr[location]) {
        if (curr[location][name] !== undefined) {
          val = curr[location][name]
        }
      }

      curr = curr[levels[ndx]]
    } while (ndx++ < levels.length && curr)
  }

  return val
}

/**
 * Determines the request headers for a transaction
 * @function processHeaders
 * @memberof processing
 * @instance
 * @param {string} responseCode response code being processed
 * @param {object} op parent operation object
 * @param {object} path parent path object
 * @param {object} top global properties
 * @param {object} options for use in processing headers
 * @return {object}
 */
function processHeaders(responseCode, op, path, top, options) {
  var headers = {};
  var levels = [path.path, op.method, responseCode]

  // check custom request values for any desired headers; cascading merge
  if (options.customValues) {
    var curr = options.customValues

    var ndx = 0
    do {
      if (curr['header'] !== undefined) {
        headers = merge2(curr['header'], headers)
      }

      curr = curr[levels[ndx]]
    } while (ndx++ < levels.length && curr !== undefined)
  }

  // handle consumes
  if (options.consumes) { // a specific content-type was targeted
    if (op.definitionFullyResolved.consumes) {
      // this operation overrides global consumes, and does contain the requested content-type
      if (op.definitionFullyResolved.consumes.indexOf(options.consumes) != -1) {
        headers['Content-Type'] = options.consumes;
      } else { // we will just use the first one because this doesn't match
        headers['Content-Type'] = op.definitionFullyResolved.consumes[0];
      }

    } else if (top.consumes.length > 0 && top.consumes.indexOf(options.consumes)
        != -1) {
      headers['Content-Type'] = options.consumes;
    } else if (top.consumes.length === 1) { // unless there is a singular different global consumes, just use that one
      headers['Content-Type'] = top.consumes[0];
    }
  } else if (op.definitionFullyResolved.consumes) { // we will just use the first one if none are specified
    headers['Content-Type'] = op.definitionFullyResolved.consumes[0];
  } else if (top.consumes.length > 0) {
    headers['Content-Type'] = top.consumes[0];
  }

  // handle produces
  if (options.produces) {
    if (op.definitionFullyResolved.produces) {
      if (op.definitionFullyResolved.produces.indexOf(options.produces) != -1) {
        headers['Accept'] = options.produces;
      } else {
        headers['Accept'] = op.definitionFullyResolved.produces[0];
      }

    } else if (top.produces.length > 0 && top.produces.indexOf(options.produces)
        != -1) {
      headers['Accept'] = options.produces;
    } else if (top.produces.length === 1) {
      headers['Accept'] = top.produces[0];
    }
  } else if (op.definitionFullyResolved.produces) {
    headers['Accept'] = op.definitionFullyResolved.produces[0];
  } else if (top.produces.length > 0) {
    headers['Accept'] = top.produces[0];
  }

  return headers
}

/**
 * ExpectedResponse is the expected response generated based on the API spec
 * @typedef {object} ExpectedResponse
 * @memberof processing
 * @property {number} statusCode expected response status code
 * @property {boolean} custom indicates if the value was a custom injection
 * @property {object} res expected response body, if applicable; can be a generated sample
 */

/**
 * Processes a sway Response for use in a test
 * @function processResponse
 * @memberof processing
 * @instance
 * @param {object} res sway Response object being processed
 * @param {string} op the operation method being processed
 * @param {string} path API path being processed
 * @param {object} options options to use during processing
 * @return {processing.ExpectedResponse}
 */
function processResponse(res, op, path, options) {
  var expected = {
    'statusCode': res.statusCode,
    'custom': false
  }

  if (options.customValues
      && options.customValues[path]
      && options.customValues[path][op]
      && options.customValues[path][op][res.statusCode]
      && options.customValues[path][op][res.statusCode].response) {

    expected['res'] = options.customValues[path][op][res.statusCode].response
    expected.custom = true;

    return expected
  }

  var res = options.samples ? res.getSample()
      : res.definitionFullyResolved.schema
  if (res !== undefined) {
    expected['res'] = res
  }

  return expected
}

/**
 * replaces the path paremeter in the given URL path with a sample value
 * @function pathify
 * @memberof processing
 * @instance
 * @param {string} path URL path to be pathified
 * @param {object} param sway Parameter object to use in pathify
 * @param {(string|number)} value a custom value to use in the pathify
 * @return {string}
 */
function pathify(path, param, value) {
  var regex = new RegExp('(\/.*){' + param.name + '}(\/.*)*', 'g')
  var sample = value !== undefined ? value : param.getSample()
  if (isNumberType(param.definition.type)) {
    // prevent negative sample values for numbers
    while (sample < 0) {
      sample = param.getSample()
    }
  }

  return path.replace(regex, '$1' + sample + '$2').replace(/ /g, '');
}

/**
 * evaluates if the given type is an OpenAPI number type or not
 * @function isNumberType
 * @memberof processing
 * @instance
 * @param {string} type type to be evaluated
 * @return {boolean}
 */
function isNumberType(type) {
  return (type === 'integer' || type === 'float' || type === 'long' || type
      === 'double')
}

/**
 * Determines the proper type for the Query parameter
 * @function determineQueryType
 * @memberof processing
 * @instance
 * @param {object} param sway Parameter object to investigate
 * @return {string}
 */
function determineQueryType(param) {
  var val = param.name; // default to the name if all else fails

  if (param.definitionFullyResolved.type === 'array') {
    val = param.definitionFullyResolved.items.type + '[]'
  } else {
    val = param.definitionFullyResolved.type
  }
  return '{' + val + '}'
}

/**
 * Used to replace newlines with a space in each response.description
 * @function replaceNewlines
 * @memberof processing
 * @instance
 * @param {string} str string to replace newlines with spaces
 * @return {string}
 */
function replaceNewlines(str) {
  return str.replace(/\r?\n|\r/g, " ")
}
