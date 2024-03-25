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

-   bump version in package.json and run `npm i`

## Open a MR

-   open a MR on the repo with these changes
-   once merged, tag the commit on main branch (Don't forget the `v` prefix)
