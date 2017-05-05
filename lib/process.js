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

'use strict';

var join = require('path').join;
var sanitize = require('sanitize-filename')
var helpers = require('./handlebar-helpers')
var util = require('util')

/**
 * @namespace processing
 */

module.exports = process

/**
 * ProcessedSpec is the fully traversed spec processed for unit test compilation
 * @typedef {object} ProcessedSpec
 * @memberof processing
 * @property {string} host Hostname to be used in the test requests; derived from the options or spec
 * @property {string[]} schemes HTTP schema to be used in the test requests; derived from the spec
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
        'host': (options.host !== undefined ? options.host : (api.host !== undefined ? api.host : 'localhost:5000')),
        'schemes': (api.schemes !== undefined ? api.schemes : ['http']),
        'basePath': (api.basePath !== undefined ? api.basePath : '/'),
        'consumes': (api.consumes !== undefined ? api.consumes : [])
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

    if (options.paths !== undefined) {
        options.paths.forEach(function(path, ndx, arr) {
            var pathObj = api.getPath(path)
            var ops = processOperations(api, pathObj, topLevel, options)
            if (ops.length !== 0) {
                data.push({
                    'name': sanitize(path, {'replacement': '-'}).substring(1),
                    'pathLevelDescription': 'tests for ' + path, 
                    'operations': ops
                })
            }
        })
    } else {
        api.getPaths().forEach(function(pathObj, ndx, arr) {
            var ops = processOperations(api, pathObj, topLevel, options)
            if (ops.length !== 0) {
                data.push({
                    'name': sanitize(pathObj.path, {'replacement': '-'}).substring(1),
                    'pathLevelDescription': 'tests for ' + pathObj.path, 
                    'operations': ops
                })
            }
        })
    }

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
    parentPath.getOperations().forEach(function(op, ndx, arr) {
        var transactions = processTransactions(api, op, parentPath, topLevel, options)
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
 * @property {string[]} schemes copied from the globally defined HTTP schema
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

    parentOp.getResponses().forEach(function(res, ndx, arr) {
        var params = processParams(parentOp, parentPath, options)

        var expected = processResponse(res, options)

        transactions.push({
            'testLevelDescription': util.format('should respond %s for "%s"', res.statusCode, res.description),
            'schemes': topLevel.schemes,
            'host': topLevel.host,
            'path': join(topLevel.basePath, params.path),
            'op': parentOp.method,
            'body': params.body,
            'query': params.query,
            'formData': params.formData,
            'expected': expected,
            'hasSamples': options.samples,
            'consumes': (parentOp.definitionFullyResolved.consumes ? parentOp.definitionFullyResolved.consumes : topLevel.consumes)
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
 * @param {object} op sway Operation object that's being processed
 * @param {object} path sway Path object that's being process
 * @param {object} options options to use during processing
 * @return {processing.ProcessedParams}
 */
function processParams(op, path, options) {
    var params = {
        'body' : {},
        'query': {},
        'formData': {},
        'path': path.path
    }

    op.getParameters().forEach(function(param, ndx, arr) {
        if (param.in === 'body') {
            // params.body[param.name] = (options.samples ? param.getSample() : param.definitionFullyResolved.schema)
            params.body[param.name] = param.getSample()
        } else if (param.in === 'query') {
            // params.query[param.name] = (options.samples ? param.getSample() : determineQueryType(param))
            params.query[param.name] = param.getSample()
        } else if (param.in === 'formData') {
            // params.formData[param.name] = (options.samples ? param.getSample() : param.definitionFullyResolved.schema)
            try {
                params.formData[param.name] = param.getSample()
            } catch(e) { // this will be because of formData property of type 'file'
                params.formData[param.name] = '{fileUpload}'
            }
        } else if (param.in === 'path') {
            params.path = pathify(params.path, param)
        }
    })

    path.getParameters().forEach(function(param, ndx, arr) {
        params.path = pathify(params.path, param)
    })

    return params
}

/**
 * ExpectedResponse is the expected response generated based on the API spec
 * @typedef {object} ExpectedResponse
 * @memberof processing
 * @property {number} statusCode expected response status code
 * @property {object} res expected response body, if applicable; can be a generated sample
 */

/**
 * Processes a sway Response for use in a test
 * @function processResponse
 * @memberof processing
 * @instance
 * @param {object} res sway Response object being processed
 * @param {object} options options to use during processing
 * @return {processing.ExpectedResponse}
 */
function processResponse(res, options) {
    var expected = {
        'statusCode': res.statusCode,
    }
    
    var res = options.samples ? res.getSample() : res.definitionFullyResolved.schema
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
 * @return {string}
 */
function pathify(path, param) {
    var regex = new RegExp('(\/.*){'+param.name+'}(\/.*)*', 'g')
    var sample = param.getSample()
    if (isNumberType(param.definition.type)) {
        // prevent negative sample values for numbers 
        while (sample < 0) {
            sample = param.getSample()
        }
    }

    return path.replace(regex, '$1'+sample+'$2');
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
    return (type === 'integer' || type === 'float' || type === 'long' || type === 'double')
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