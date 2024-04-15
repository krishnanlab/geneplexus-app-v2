/**
 * handle data schemas/formats and conversion between them between
 * frontend/backend
 */

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

/** convert-ids endpoint response format */
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

/** backend format to frontend format */
export const convertConvertIds = (backend: _ConvertIds) => {
  /** map "couldn't convert" status to easier-to-work-with value */
  for (const row of backend.df_convert_out)
    if (row["Entrez ID"].match(/Could Not be mapped to Entrez/i))
      row["Entrez ID"] = "";

  return {
    count: backend.input_count,
    success: backend.df_convert_out.filter((row) => row["Entrez ID"]).length,
    error: backend.df_convert_out.filter((row) => !row["Entrez ID"]).length,
    summary: backend.table_summary.map((row) => ({
      network: row.Network,
      positiveGenes: row.PositiveGenes,
      totalGenes: row.NetworkGenes,
    })),
    table: backend.df_convert_out.map((row) => ({
      input: row["Original ID"],
      entrez: row["Entrez ID"],
      biogrid: row["In BioGRID?"] === "Y",
      imp: row["In IMP?"] === "Y",
      string: row["In STRING?"] === "Y",
    })),
  };
};

/** ml endpoint params backend format */
export type _AnalysisInputs = {
  name: string;
  genes: string[];
  sp_trn: Species;
  sp_tst: Species;
  net_type: Network;
  gsc: GenesetContext;
};

/** backend format to frontend format */
export const convertAnalysisInputs = (backend: _AnalysisInputs) => ({
  name: backend.name,
  genes: backend.genes,
  speciesTrain: backend.sp_trn,
  speciesTest: backend.sp_tst,
  network: backend.net_type,
  genesetContext: backend.gsc,
});

/** ml endpoint params frontend format */
export type AnalysisInputs = ReturnType<typeof convertAnalysisInputs>;

/** frontend format to backend format */
export const revertAnalysisInputs = (
  frontend: AnalysisInputs,
): _AnalysisInputs => ({
  name: frontend.name,
  genes: frontend.genes,
  sp_trn: frontend.speciesTrain,
  sp_tst: frontend.speciesTest,
  net_type: frontend.network,
  gsc: frontend.genesetContext,
});

/** convert-ids endpoint response format */
export type _AnalysisResults = {
  inputs: _AnalysisInputs;
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

/** backend format to frontend format */
export const convertAnalysisResults = (backend: _AnalysisResults) => ({
  inputGenes: backend.df_convert_out_subset.map((row) => ({
    input: row["Original ID"],
    entrez: row["Entrez ID"].match(/Could Not be mapped to Entrez/i)
      ? ""
      : row["Entrez ID"],
    inNetwork:
      (row["In BioGRID?"] ?? row["In IMP?"] ?? row["In STRING?"]) === "Y",
  })),
});

/** ml endpoint params frontend format */
export type AnalysisResults = ReturnType<typeof convertAnalysisResults>;
