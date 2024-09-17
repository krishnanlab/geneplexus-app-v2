# General

Unless noted otherwise, each API method expects:

- `Content-Type: application/json` header.
- `POST` method
- Request body with JSON-encoded string of appropriate params

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

## `/gpz-convert-ids`

#### Inputs

```ts
type Request = {
  // list of gene symbols/names/ids
  genes: string[];
  // species to lookup genes against
  species: "Human" | "Mouse" | "Fly" | "Zebrafish" | "Worm" | "Yeast";
};
```

#### Outputs

```ts
type Response = {
  // number of genes inputted
  input_count: int;
  // list of successfully converted Entrez IDs
  convert_ids: string[];
  // high level summary of conversion results, per network
  table_summary: {
    // network
    Network: "BioGRID" | "STRING" | "IMP";
    // total number of genes in network
    NetworkGenes: int;
    // number of input genes in network
    PositiveGenes: int;
  }[];
  // dataframe of results
  df_convert_out: {
    // input id of gene
    "Original ID": string;
    // converted id of gene
    "Entrez ID": string;
    // converted name of gene
    "Gene Name": string;
    // whether gene was found in each network
    "In BioGRID?": "Y" | "N";
    "In IMP?": "Y" | "N";
    "In STRING?": "Y" | "N";
  }[];
};
```

Note: if input species is Zebrafish, BioGRID is not included in results

## `/gpz-ml`

#### Inputs

```ts
type Request = {
  // list of gene symbols/names/ids
  genes: string[];
  // species to lookup genes against
  sp_trn: "Human" | "Mouse" | "Fly" | "Zebrafish" | "Worm" | "Yeast";
  // species for which model predictions will be made
  sp_tst: "Human" | "Mouse" | "Fly" | "Zebrafish" | "Worm" | "Yeast";
  // network that ML features are from and which edge list is used to make final graph
  net_type: "BioGRID" | "STRING" | "IMP";
  // source used to select negative genes and which sets to compare trained model to
  gsc: "GO" | "Monarch" | "Mondo" | "Combined";
};
```

#### Outputs

```ts
type Response = {
  // copy of inputs for re-uploading convenience
  input: Request;

  // see `convert-ids` `df_convert_out` schema
  df_convert_out_subset: {
    "Original ID": string;
    "Entrez ID": string;
    "Gene Name": string;
    // only one of these present, based on selected network
    "In BioGRID?"?: string;
    "In IMP?"?: string;
    "In STRING?"?: string;
  }[];

  // cross validation results, performance measured using log2(auprc/prior)
  avgps: (int | None)[];

  // number of genes considered positives in network
  positive_genes: int;
  // top predicted genes that are isolated from other top predicted genes in network (as Entrez IDs)
  isolated_genes: string[];
  // top predicted genes that are isolated from other top predicted genes in network (as gene symbols)
  isolated_genes_sym: string[];
  // edge list corresponding to subgraph induced by top predicted genes (as Entrez IDs)
  df_edge: { Node1: string; Node2: string; Weight: number }[];
  // edge list corresponding to subgraph induced by top predicted genes (as gene symbols)
  df_edge_sym: { Node1: string; Node2: string; Weight: number }[];

  // table showing how associated each gene in prediction species network is to the users gene list
  df_probs: {
    // Entrez ID
    "Entrez": string;
    // gene symbol
    "Symbol": string;
    // full gene name
    "Name": string;
    // whether gene is in input gene list
    "Known/Novel": "Known" | "Novel";
    // gene class, positive | negative | neutraul
    "Class-Label": "P" | "N" | "U";
    // probability of gene being part of input gene list
    "Probability": number;
    // z-score of the probabilities
    "Z-score": number;
    // adjusted p-values of the z-scores
    "P-adjusted": number;
    // rank of relevance of gene to input gene list
    "Rank": int;
  }[];

  // table showing how similar user's trained model is to models trained on known gene sets
  df_sim: {
    // type of term
    "Task": string;
    // term ID
    "ID": string;
    // term name
    "Name": string;
    // similarity between input model and a model trained on term gene set
    "Similarity": number;
    // z-score of the similarities
    "Z-score": number;
    // adjusted p-values of the z-scores
    "P-adjusted": number;
    // rank of similarity between input model and a model trained on term gene set
    "Rank": int;
  }[];
};
```
