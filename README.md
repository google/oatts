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

> oatts generate -s ./path/to/openapi.yaml -w ./output/dir
> ls ./output/dir
pet-test.js  pet-{petId}-uploadImage-test.js  user-test.js 
. . .
```

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

## Testing

To test this module simply use the `npm` script

    npm test

## Contributing

Contributors are welcome! Please see [CONTRIBUTING.md](https://github.com/noahdietz/oatts/blob/master/CONTRIBUTING.md).

## License

See [LICENSE](https://github.com/noahdietz/oatts/blob/master/LICENSE) file.