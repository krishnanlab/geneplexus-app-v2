/** response format from convert ids api endpoint */
export type _ConvertIds = {
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

/** response format from ml analysis api endpoint */
export type _AnalysisResults = {
  input: _AnalysisInput;
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

/** species options */
export type Species =
  | "Human"
  | "Mouse"
  | "Fly"
  | "Zebrafish"
  | "Worm"
  | "Yeast";

/** network options */
export type Network = "BioGRID" | "STRING" | "IMP";

/** geneset context options */
export type GenesetContext = "GO" | "Monarch" | "DisGeNet" | "Combined";

/** input format for ml analysis api endpoint */
export type _AnalysisInput = {
  name: string;
  genes: string[];
  sp_trn: Species;
  sp_tst: Species;
  net_type: Network;
  gsc: GenesetContext;
};

/** analysis input format for frontend */
export type AnalysisInput = {
  name: string;
  genes: string[];
  speciesTrain: Species;
  speciesTest: Species;
  network: Network;
  genesetContext: GenesetContext;
};

/** transform analysis input from backend format to frontend format */
export const convertInput = (input: _AnalysisInput): AnalysisInput => ({
  name: input.name,
  genes: input.genes,
  speciesTrain: input.sp_trn,
  speciesTest: input.sp_tst,
  network: input.net_type,
  genesetContext: input.gsc,
});

/** transform analysis input from frontend format to backend format */
export const revertInput = (input: AnalysisInput): _AnalysisInput => ({
  name: input.name,
  genes: input.genes,
  sp_trn: input.speciesTrain,
  sp_tst: input.speciesTest,
  net_type: input.network,
  gsc: input.genesetContext,
});
