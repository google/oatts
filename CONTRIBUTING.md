# Contributing

Pull requests are welcome! By participating in this project, you
agree to abide by the Code Of Conduct included in this repository.

If you have a request or question, start by opening an issue for discussion!

To start coding, fork, then clone the repo:

    git clone git@github.com:your-username/oatts.git

Install dependencies:

    npm install

Make sure the tests pass:

    npm test

Make your change. **Add tests for your change**. Make the tests pass:

    npm test

Push to your fork and [submit a pull request][pr].

[pr]: https://github.com/noahdietz/oatts/compare/

If the change...

* introduces a new type
* changes the definition of an existing type
* adds a new function
* changes the signature of an existing function 
* adds a new local module

...please add/update the appropriate [jsdoc] comments.

[jsdoc]: http://usejsdoc.org/

Following passing the tests and committing the change, regrenerate the docs:

    npm run gen-docs

Commit the changes to `docs/` as a **separate commit.**

At this point you're waiting on us. I will try to at least comment on the pull request as quickly as possible.
We may suggest some changes or improvements or alternatives.

Some things that will increase the chance that your pull request is accepted:

* Write tests.
* Write a [good commit message][commit].

[commit]: https://github.com/erlang/otp/wiki/Writing-good-commit-messages