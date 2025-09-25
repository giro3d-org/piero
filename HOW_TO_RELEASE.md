# How to release Piero

[[_TOC_]]

## Requirements

Install commitizen utility with pip

```shell
pip install commitizen
```

This will install the `cz` utility in your python packages folder (by default `$HOME/.local/bin/cz`).

## Create a release branch

Create a branch `release/XX.YY` where `XX.YY` is the release version number (e.g. `24.4`).

## Generate the changelog

1. generate a changelog with commitizen:

    ```shell
    $HOME/.local/bin/cz changelog --incremental --unreleased-version <version>
    ```

    where version is the version we want to release (don't forget the `v` prefix, for example `v24.10`).

2. Edit the generated changelog for readability (fix typos, add some context for unclear changes).  
   It's also best to sort the items in Feat/Fix/Refactor alphabetically.  
   For the `BREAKING CHANGE` section, edit the text to add a migration guide.

## Bump the version number

- bump version in package.json and run `npm i`

## Open a MR

- open a MR on the repo with these changes
- once merged, tag the commit on main branch (Don't forget the `v` prefix)

## Deploying the app on piero.giro3d.org

The app is automatically deployed whenever a git tag is created that matches the naming convention for the app: `app-v25.10.0` pattern, where `25.10.0` is the [calendar version](https://calver.org/) of the app.

> [!warning]
> The git tag must have the same version as the root `package.json`. If the git package version is `25.10.0`, then the git tag _must_ be `app-v25.10.0`.

## Publishing packages

Piero is both an app and a set of libraries (under the `packages/` folder). The libraries are published under [semantic versioning](https://semver.org/) (contrary to the app that uses [calendar versioning](https://calver.org/).)

Packages are automatically published whenever a git tag is created that matches the naming convention for packages: `packages-v1.2.3`, where `1.2.3` is the version of the packages.

> [!warning]
> All packages must have exactly the same version (lockstep). This is enforced by the CI/CD with the `get-version-tag.mjs` script.

> [!note]
> Package version can be a prerelease, e.g `packages-v1.2.3-beta.1`. In that case NPM packages are published under the appropriate [dist-tag](https://docs.npmjs.com/adding-dist-tags-to-packages):
>
> - `latest` for stable packages
> - alpha
> - beta
> - rc

> [!tip]
> To set the version of all packages at once, use the `npm version --workspaces` command:
>
> ```shell
> $ npm version --workspaces 1.2.3-beta.1
> @giro3d/piero
> v1.2.3-beta.1
> @giro3d/piero-plugin-cityjson
> v1.2.3-beta.1
> ```
