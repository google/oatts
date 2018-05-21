# Contributing

We'd love to accept your patches and contributions to this project. There are
just a few small guidelines you need to follow.

## Contributor License Agreement

Contributions to this project must be accompanied by a Contributor License
Agreement. You (or your employer) retain the copyright to your contribution;
this simply gives us permission to use and redistribute your contributions as
part of the project. Head over to <https://cla.developers.google.com/> to see
your current agreements on file or to sign a new one.

You generally only need to submit a CLA once, so if you've already submitted one
(even if it was for a different project), you probably don't need to do it
again.

## Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

## Community Guidelines

This project follows [Google's Open Source Community
Guidelines](https://opensource.google.com/conduct/).

## Making a change

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

[pr]: https://github.com/google/oatts/compare/

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