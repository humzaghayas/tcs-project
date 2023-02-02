# commercetools Serverless Plugin

[commercetools's](https://commercetools.com/) plugin for the [Serverless Framework](https://serverless.com) allows you to seamlessly integrate your serverless functions with commercetools' extensibility options.

## Contents

- [Features](#features)
- [Install](#install)
- [Configuration](#configuration)
  - [Terraforms]
  - [API Extension](#api-extension)
- [Usage](#usage)
- [Help](#help)
- [Development](#development)

## Features

- This is a POC to show case the Commerceools API extension capability for Kingfisher.
- The POC consists of a simple extension of CT written in Node JS and deployed on Google GCP (cloud) (firebase).
- Supports Terraforms and GCP

## Install

```sh
npm install


## Configuration

Add your commercetools' project settings :

```tf

In code base, go to path <<PROJECT ROOT>>\tcs_ct_customization\packages\tcs-terraform\default
Open file provider.tf
Place values to connect to CT project:

provider "commercetools" {
  client_id     = "your_clientid"
  client_secret = "your_secret"
  project_key   = "your_key"
  scopes        = "your_scopes"
  token_url     = "your_authurl"
  api_url       = "your_apiUrl"
}

```

### API Extension

Add environment vars for the deploy type ("extension") :

```yml

	<<PROJECT ROOT>>\github\workflows\order-create-api-extension-ci-master.yml
    in evv section
	place these values in github repository secrets 
	
	  FIREBASE_TOKEN: ${{secrets.FIREBASE_TOKEN}}
	  PROJECT_ID: ${{secrets.PROJECT_ID}}
      PROECT_PATH: tcs-order-create-api-extension
```


## Usage

To build your terraform project through CI/CD make this request:

```deploye to CT
curl \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <YOUR-TOKEN>"\
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/WORKFLOW_ID/dispatches \
  -d '{"ref":"terraform","inputs":{"name":"Mona the Octocat","home":"San Francisco, CA"}}'

```

To build GCP serverless manually:

```firebase GCP

firebase use YOUR_PROJECT_ID
firebase deploy --only function
```


Alternatively To build GCP serverless using CI/CD:

```GCP

curl \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <YOUR-TOKEN>"\
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/WORKFLOW_ID/dispatches \
  -d '{"ref":"tcs-order-create-api-extension","inputs":{"name":"Mona the Octocat","home":"San Francisco, CA"}}'

```

## Usage can be done using POSTman with environment variables

Postman collection can be found in <<Prohect ROOT>>\Postman-collection: