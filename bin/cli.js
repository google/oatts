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
var cli = require('commander')
var oatts = require('../index')
var util = require('./util')
var join = require('path').join;

cli.version(require('../package.json').version)
    .usage('<subcommand>')

cli.command('generate')
    .description('generate unit test scaffolding for a given OpenAPI/Swagger Spec')
    .option('--host <host>', 'target hostname to use in test generation')
    .option('-p, --paths <paths>', 'comma separated list of paths to generate tests for', util.paths)
    .option('-e, --samples', 'generate sample response bodies rather than schema, if applicable')
    .option('-s, --spec <spec>', 'path to the target OpenAPI/Swagger spec document to consume')
    .option('-w, --writeTo <writeTo>', 'directory to write the generated tests to file')
    .option('-c, --consumes <consumes>', 'consumes/content-type to use in request when applicable to the API resource')
    .option('-o, --produces <produces>', 'produces/accept to use in request when applicable to the API resource')
    .option('-u, --customValues <customValues>', 'custom request values to be used in generation; takes precedent over a customValuesFile')
    .option('--customValuesFile <customValuesFile>', 'path to JSON file with custom request values to be used in generation')
    .option('-m, --scheme <scheme>', 'which scheme to use if multiple are present in spec')
    .option('-t --templates <templateDir>', 'path to direcotry of custom templates')
    .action(function(options)  {
        options.error = util.optionError;
        if (!options.spec) { return  options.error('spec path is required'); }
        
        var generated = oatts.generate(options.spec, options);
        generated.then(function(gen){
            if (options.writeTo === undefined) {
                console.log(gen)
            }
        },
        function(err) {
            console.error(err)
        });
    });

cli.parse(process.argv);