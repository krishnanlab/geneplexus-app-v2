export type ConvertIds = {
  convert_ids: string[];
  df_convert_out: {
    "Entrez ID": string;
    "In BioGRID?": string;
    "In IMP?": string;
    "In STRING?": string;
    "Original ID": string;
  }[];
  input_count: number;
  table_summary: {
    Network: string;
    NetworkGenes: number;
    PositiveGenes: number;
  }[];
};

export type AnalysisResults = {
  avgps: number[];
  df_convert_out_subset: {
    "Entrez ID": string;
    "In BioGRID?"?: string;
    "In IMP?"?: string;
    "In STRING?"?: string;
    "Original ID": string;
  }[];
  df_edge: { Node1: string; Node2: string }[];
  df_edge_sym: { Node1: string; Node2: string }[];
  df_probs: {
    "Class-Label": string;
    Entrez: string;
    "Known/Novel": string;
    Name: string;
    Probability: number;
    Rank: number;
    Symbol: string;
  }[];
  df_sim: {
    ID: string;
    Name: string;
    Rank: number;
    Similarity: number;
  }[];
  isolated_genes: string[];
  isolated_genes_sym: string[];
  positive_genes: number;
};

export type Species =
  | "Human"
  | "Mouse"
  | "Fly"
  | "Zebrafish"
  | "Worm"
  | "Yeast";

export type Network = "BioGRID" | "STRING" | "IMP";

export type Negatives = "GO" | "Monarch" | "DisGeNet" | "Combined";

export type Input = {
  genes: string[];
  species: Species;
  network: Network;
  negatives: Negatives;
};
