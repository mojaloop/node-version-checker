# Node.Js version repository checker tool

This tool uses Github API to find all Mojaloop's repositories that are marked as being Javascript or Typescript, and tries to fetch it's Node.js versions.

Two Node.js checking methods are implemented:
* Reading a possible `.nvmrc` file at the root of the repository
* Reading and interpreting a possible `Dockerfile` file at the root of the repository with a line that looks like `FROM node:VERSION...`


### The output of this script is one line per repository, ordered by last push in descending order.
Each line has 6 fields:
* Index number - zero based and relative to the whole
* Repository name
* .nvmrc file status - either no file found or the node version it contains
* Dockerfile file status - either no file found or the node image version
* Topics list of the repo
* lastChanged - date of last push

Example output
```
Found 89 matching repositories
0 | reporting | (no .nvmrc) | Dockerfile image -> lts-buster-slim | lastChanged: 2022-01-10T14:27:08Z
1 | thirdparty-api-svc | (no .nvmrc) | Dockerfile image -> 14.3.0-alpine | lastChanged: 2021-11-04T06:50:04Z
2 | sdk-standard-components | (no .nvmrc) | (no Dockerfile) | topics: core-package,mojaloop | lastChanged: 2022-03-08T17:32:24Z
3 | transaction-requests-service | (no .nvmrc) | Dockerfile image -> 12.16.0-alpine | topics: core-docker | lastChanged: 2021-12-07T18:37:48Z
4 | bulk-api-adapter | .nvmrc -> 12.16.0 | Dockerfile image -> 12.16.1-alpine | topics: core-docker | lastChanged: 2021-12-14T10:48:58Z
5 | quoting-service | (no .nvmrc) | Dockerfile image -> 12.16.1-alpine | topics: core-docker,fees,quotes,transaction | lastChanged: 2021-11-16T08:17:08Z
6 | account-lookup-service | (no .nvmrc) | Dockerfile image -> 12.16.1-alpine | topics: core-docker,ml-automated-releases,mojaloop | lastChanged: 2021-12-14T10:48:51Z
7 | central-ledger | .nvmrc -> 12.16.0 | Dockerfile image -> 12.16.1-alpine | topics: core-docker,ml-automated-releases,mojaloop | lastChanged: 2022-03-01T13:49:28Z
8 | ml-api-adapter | .nvmrc -> 12.16.0 | Dockerfile image -> 12.16.1-alpine | topics: core-docker,mojaloop | lastChanged: 2021-12-14T10:49:00Z
...
```

## Note
Github has a rate limit, running this script multiple times in a short time window might fail.

# Usage

### Install Node version

More information on how to install NVM: https://github.com/nvm-sh/nvm

```bash
nvm install
nvm use
```

### Install all dependencies

```bash
npm install
```

## Build

```bash
npm run build
```

## Run

```bash
npm start
```
