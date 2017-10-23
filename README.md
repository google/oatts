# OpenAPI Test Templates (oatts)

> Generate basic unit test scaffolding for your [OpenAPI specification](https://www.openapis.org/).

## Disclaimer

`oatts` is based off of the [swagger-test-templates](https://github.com/apigee-127/swagger-test-templates) module and the lessons learned during its development.

_This is a work in progress._

## Goal

The goal of `oatts` is to provide a standalone module for generating Node.js unit test code scaffolding based on a given OpenAPI specification.

The hope is that by providing such a tool, API developers will be encouraged to test the contract between their spec and backend early, often and continuously as the project grows.

## Usage

There are a couple ways to use `oatts`.

### Module

Install via `npm`

    npm install --save oatts


Then use it in code
```js
var oatts = require('oatts');

var options = {
    // see "Options" section below for available options
};

var tests = oatts.generate('/path/to/openapi.yaml', options);

console.log(tests)
```

### Command line interface

Install globally via `npm`

    npm install -g oatts


Then use in your command line
```sh
> oatts generate --help

  Usage: generate [options]

  generate unit test scaffolding for a given OpenAPI/Swagger Spec

  Options:

    -h, --help                             output usage information
    --host <host>                          target hostname to use in test generation
    -p, --paths <paths>                    comma separated list of paths to generate tests for
    -e, --samples                          generate sample response bodies rather than schema, if applicable
    -s, --spec <spec>                      path to the target OpenAPI/Swagger spec document to consume
    -w, --writeTo <writeTo>                directory to write the generated tests to file
    -c, --consumes <consumes>              consumes/content-type to use in request when applicable to the API resource
    -o, --produces <produces>              produces/accept to use in request when applicable to the API resource
    -u, --customValues <customValues>      custom request values to be used in generation; takes precedent over a customValuesFile
    --customValuesFile <customValuesFile>  path to JSON file with custom request values to be used in generation
    -m, --scheme <scheme>                  which scheme to use if multiple are present in spec
    -t --templates <templateDir>           path to direcotry of custom templates

> oatts generate -s ./path/to/openapi.yaml -w ./output/dir
> ls ./output/dir
pet-test.js  pet-{petId}-uploadImage-test.js  user-test.js 
. . .
```

### Using the result

The resulting test files are built using the [mocha](https://mochajs.org/) testing framework and [chakram](http://dareid.github.io/chakram/) API testing framework. Thus, you will need both of these dependencies installed in order to run your newly generated tests.

After installing these, you can run the tests with mocha:
```
# start your API server to test against!!
> mocha --recursive <test directory>


    tests for /goodbye
        tests for get
            ✓ should respond 200 for "Success" (57ms)

    tests for /hello
        tests for get
            ✓ should respond 200 for "Success"


    2 passing (82ms)
```

### Custom Values
Custom values can be supplied through both the command line and a JSON file. The in-line, command line supplied JSON will take precedent.

An example custom values JSON file can be found [here](https://github.com/noahdietz/oatts/blob/master/test/process/documents/customValuesTest.json).

### Custom Templates
Custom templates can be supplied via the `templates` option. The directory pointed to by the option must contain 4 [Handlebars](http://handlebarsjs.com/) templates named the same way as those found in `./templates`.

* `topLevel.handlebars`: the top level template for a single test file
* `pathLevel.handlebars`: the path level template, usually the beginning of a test suite for a specific path
* `operationLevel.handlebars`: the operation level template, for a single operation test suite
* `transactionLevel.handlebars`: the template for a single transaction, or a single response code's unit test

The data available to be used in the templates is specified in the [ProcessedSpec](https://noahdietz.github.io/oatts/processing.html#.ProcessedSpec__anchor) type.

There are also a few helpers available to be used in the Handlebars templates, which can be found in the [templateHelpers](https://noahdietz.github.io/oatts/templateHelpers.html) documentation namespace. Use the default templates as examples of how to use them.

## Options

The following options can be passed to the generation function, some/all are exposed in the accompanying CLI:

| Name | CLI Flag | Default | Required | Description |
| ---- |:--------:| -------:| --------:| -----------:|
| `spec` | `--spec -s` | n/a | `true` | Path to a `swagger.yaml` or `openapi.yaml` |
| `host` | `--host` | `spec.host` | `false` | Hostname to put in test requests; defaults to `host` in given spec |
| `paths` | `--paths -p` | `spec.paths` | `false` | API paths to generate tests for; defaults to all paths in given spec |
| `samples` | `--samples -e` | `false` | `false` | Toggle generating sample responses for assertion |
| `writeTo` | `--writeTo -w` | n/a | `false` | Directory to write generated tests to; will create the directory if it doesn't exist |
| `consumes` | `--consumes -c` | `operation.consumes[0]` &#124; &#124; `spec.conumes[0]` | `false` | Consumes header to use in a request when applicable | 
| `produces` | `--produces -o` | `operation.produces[0]` &#124; &#124; `spec.produces[0]` | `false` | Produces header to use in a request when applicable |
| `customValues` | `--customValues -u` | n/a | `false` | Values to be populated in requests where specified; overrides `customValuesFile` |
| `customValuesFile` | `--customValuesFile` | n/a | `false` | Path to a JSON file with values to populate in requests |
| `scheme` | `--scheme -m` | `spec.schemes[0]` | `false` | Override for multiple scheme present in a spec |
| `templates` | `--templates -t` | `'./templates'` | `false` | Path to directory containing custom templates |

## Testing

To test this module simply use the `npm` script

    npm test

## Contributing

Contributors are welcome! Please see [CONTRIBUTING.md](https://github.com/noahdietz/oatts/blob/master/CONTRIBUTING.md).

## License

See [LICENSE](https://github.com/noahdietz/oatts/blob/master/LICENSE) file.