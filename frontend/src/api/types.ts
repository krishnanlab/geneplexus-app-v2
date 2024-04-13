export type ConvertIds = {
  input_count: number;
  convert_ids: string[];
  table_summary: {
    Network: string;
    NetworkGenes: number;
    PositiveGenes: number;
  }[];
  df_convert_out: {
    "Entrez ID": string;
    "In BioGRID?": string;
    "In IMP?": string;
    "In STRING?": string;
    "Original ID": string;
  }[];
};

export type AnalysisResults = {
  df_convert_out_subset: {
    "Entrez ID": string;
    "In BioGRID?"?: string;
    "In IMP?"?: string;
    "In STRING?"?: string;
    "Original ID": string;
  }[];
  avgps: number[];
  positive_genes: number;
  isolated_genes: string[];
  isolated_genes_sym: string[];
  df_edge: { Node1: string; Node2: string }[];
  df_edge_sym: { Node1: string; Node2: string }[];
  df_probs: {
    "Class-Label": "P" | "N" | "U";
    Entrez: string;
    "Known/Novel": "Known" | "Novel";
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
};

export type Species =
  | "Human"
  | "Mouse"
  | "Fly"
  | "Zebrafish"
  | "Worm"
  | "Yeast";

export type Network = "BioGRID" | "STRING" | "IMP";

export type GenesetContext = "GO" | "Monarch" | "DisGeNet" | "Combined";

export type Input = {
  genes: string[];
  species: Species;
  network: Network;
  genesetContext: GenesetContext;
};
