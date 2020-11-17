# action-dependabot-bump-range

Evaluates the bump range (minor, major, patch) and outputs the metadata

## Inputs

### `token`

**Required** Github Api Token `"World"`.

## Outputs

### `error`

the action will not end with bad exit if title could not be parsed
the error will be outputted here instead. so it can be checked

### `from`

the version string of the current version (in default branch) of the bumped package

### `to`

the version string of the new version (in pr branch) of the bumped package

### `diff`

Will be one of follwing values:

`"major" | "premajor" | "minor" | "preminor" | "patch" | "prepatch" | "prerelease"`

## Example usage

```yaml
name: "Label Dependabot PR"

on:
  pull_request:
    types:
      - labeled
      - unlabeled
      - synchronize
      - opened
      - edited
      - ready_for_review
      - reopened
      - unlocked

jobs:
  labels:
    runs-on: ubuntu-latest
    steps:
      - uses: jurijzahn8019/action-dependabot-bump-range@v0.0.1
        id: checker
        env:
          # Remove this if do not want debug output
          DEBUG: "action-dependabot-bump-range:*"
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

        # Execute additional steps conditionally
      - name: Add Pull Request Label for approval
        uses: actions-ecosystem/action-add-labels@v1

        # Perform conditionals here
        if: steps.checker.outputs.diff != 'major'

        with:
          # PAT used here to trigger automerge actions
          # Use GITHUB_TOKEN if not need to trigger events
          github_token: ${{ secrets.TOKEN_GITHUB }}
          labels: "pull: automerge"
```

## Test run

```bash
DEBUG=* \
  INPUT_TOKEN=FOOOOO \
  node dist/index.cjs.js
```
