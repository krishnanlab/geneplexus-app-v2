# General

Unless noted otherwise, each API method expects:

- `Content-Type: application/json` header.
- `POST` method
- Request body with JSON-encoded string of appropriate input params

## Function Data

Each function expects its data to be located in `functions/<func_name>/<func_name>_deploy/data/`.

The data is currently held in a GCS bucket, `gs://geneplexus-func-data`, with
data for each function in a subdirectory under the bucket root. The data is
stored as a gzip'd tarball named `<func_name>_data.tar.gz` under each function
subdirectory, with the contents of the tarball being the immediate contents of the
`data` folder (i.e., not in a subdirectory within the tarball).

Here's the current structure in the bucket:

```
geneplexus-func-data
├── convert-ids
│   └── convert-ids_data.tar.gz
└── ml
    └── ml_data.tar.gz
```

These data files are pulled during the GitHub workflow that deploys the
functions to GCP when their source is changed. Specifically, the bucket URL is
passed to `.github/workflows/helper-deploy-func.yaml` as the `func-data-gcs-url`
attribute.

For example, for `convert-ids` (workflow
`.github/workflows/deploy-func-convert_ids.yaml`), the attribute is set to
`gs://geneplexus-func-data/convert-ids/convert-ids_data.tar.gz`.

If you want to run these functions locally, e.g. via the local runner,
you'll have to download the tarballs and extract them to the `data`
folders as mentioned above.

## Endpoints

- `/gpz-convert-ids`
- `/gpz-ml`

See types and comments of what inputs these endpoints accept and what results/outputs they return in [`/frontend/src/api/types.ts`](../frontend/src/api/types.ts).

Notes:

- BioGRID does not support Zebrafish.
- Mondo only supports Human genes.
