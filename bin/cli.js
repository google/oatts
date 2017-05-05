#!/usr/bin/env node

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
var oatts = require('../index')
var util = require('./util')
var cli = require('commander')

cli.version(require('../package.json').version)
    .usage('<subcommand>')

cli.command('generate')
    .description('generate unit test scaffolding for a given OpenAPI/Swagger Spec')
    .option('--host <host>', 'target hostname to use in test generation')
    .option('-p, --paths <paths>', 'comma separated list of paths to generate tests for', util.paths)
    .option('-e, --sample', 'generate sample response bodies rather than schema, if applicable')
    .option('-s, --spec <spec>', 'path to the target OpenAPI/Swagger spec document to consume')
    .option('-w, --writeTo <writeTo>', 'directory to write the generated tests to file')
    .action(function(options)  {
        options.error = util.optionError
        if (!options.spec) { return  options.error('spec path is required') }
        
        var generated = oatts.generate(options.spec, options)
        if (options.writeTo === undefined) {
            console.log(generated)
        }
    });

cli.parse(process.argv);