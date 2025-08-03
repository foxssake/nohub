# Contributing to *nohub*

We would like to make the development process of *nohub* a *cooperative* one.
So, if you'd like to contribute, you're in the right place!

## Choosing a task

If you're already working on a smaller change, we're looking forward for your PR!

If you're already working on a bigger change, please take a moment to discuss
it with us over on [Discord]. This way we can make sure that we are aligned on
the idea, and none of your work goes to waste!

If you're not sure yet, but would like to contribute, let us know on [Discord],
or take a look at the open [issues]. Especially in the early stages, it is best
to discuss before implementing. This way we can avoid situations where e.g.
you're trying to implement a task that doesn't have its underlying dependencies
yet.

## Setting up development

*nohub* runs on [Bun], so make sure to have it installed. The latest version is
good.

Next, fork the repository and clone it. In case you plan to contribute
regularly, feel free to ask for write permission.

Once in the repository, run `bun install`.

That's it, you're now ready to go!

## Before submitting your PR

Once you're done coding, please take a moment to prepare your branch for the
PR.

Firstly, run `bun format`, and fix any remaining errors. This makes sure that
the coding style is consistent, and your PR won't fail on its status check.

Second, make sure to bump the version in `package.json`:

- For features, minor bump: `0.15.4` -> `0.16.0`
- For bugfixes, patch bump: `0.15.4` -> `0.15.5`
- For refactors, patch bump: `0.15.4` -> `0.15.5`
- For other changes, or if unsure, feel free to omit the version bump and ask
  for guidance

And finally, don't forget to enable ["Allow edits from maintainers"], for
easier iteration during review.

With these done, feel free to submit your PR.

## After submitting the PR

We'll review whenever we can. Feel free to ping on [Discord]!


[Discord]: https://discord.gg/xWGh4GskG5
[issues]: https://github.com/foxssake/nohub/issues
[Bun]: https://bun.com/
["Allow edits from maintainers"]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork#enabling-repository-maintainer-permissions-on-existing-pull-requests
