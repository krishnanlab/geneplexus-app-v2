# General

Unless noted otherwise, each API method expects:

- `Content-Type: application/json` header.
- `POST` method
- Request body with JSON-encoded string of appropriate params

## `/gpz-convert-ids`

#### Inputs

```ts
type request = {
  // list of gene symbols/names/ids
  genes: string[];
  // species to lookup genes against
  species: "Human" | "Mouse" | "Fly" | "Zebrafish" | "Worm" | "Yeast";
};
```

#### Outputs

```ts
type response = {
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
    // converted id of gene
    "Entrez ID": string;
    // input id of gene
    "Original ID": string;
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
type request = {
  // list of gene symbols/names/ids
  genes: string[];
  // species to lookup genes against
  sp_trn: "Human" | "Mouse" | "Fly" | "Zebrafish" | "Worm" | "Yeast";
  // species for which model predictions will be made
  sp_test: "Human" | "Mouse" | "Fly" | "Zebrafish" | "Worm" | "Yeast";
  // source used to select negative genes and which sets to compare trained model to
  gsc: "GO" | "Monarch" | "DisGeNet" | "Combined";
  // network that ML features are from and which edge list is used to make final graph
  net_type: "BioGRID" | "STRING" | "IMP";
};
```

#### Outputs

```ts
type Response = {
  // see `convert-ids` `df_convert_out` schema
  df_convert_out_subset: {
    "Original ID": string;
    "Entrez ID": string;
    // only one of these present, based on selected network
    "In BioGRID?"?: string;
    "In IMP?"?: string;
    "In STRING?"?: string;
  }[];

  // cross validation results, performance measured using log2(auprc/prior)
  avgps: int[];

  // number of genes considered positives in network
  positive_genes: number;
  // top predicted genes that are isolated from other top predicted genes in network (as Entrez IDs)
  isolated_genes: string[];
  // top predicted genes that are isolated from other top predicted genes in network (as gene symbols)
  isolated_genes_sym: string[];

  // edge list corresponding to subgraph induced by top predicted genes (as Entrez IDs)
  df_edge: { Node1: string; Node2: string }[];
  // edge list corresponding to subgraph induced by top predicted genes (as gene symbols)
  df_edge_sym: { Node1: string; Node2: string }[];

  // table showing how associated each gene in prediction species network is to the users gene list
  df_probs: {
    // Entrez ID
    "Entrez": string;
    // full gene name
    "Name": string;
    // gene symbol
    "Symbol": string;
    // whether gene is in input gene list
    "Known/Novel": "Known" | "Novel";
    // gene class, positive | negative | neutraul
    "Class-Label": "P" | "N" | "U";
    // probability of gene being part of input gene list
    "Probability": number;
    // rank of relevance of gene to input gene list
    "Rank": int;
  }[];

  // table showing how similar user's trained model is to models trained on known gene sets
  df_sim: {
    // term ID
    ID: string;
    // term name
    Name: string;
    // similarity between input model and a model trained on term gene set
    Similarity: number;
    // rank of similarity between input model and a model trained on term gene set
    Rank: int;
  }[];
};
```
