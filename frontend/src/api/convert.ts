/** handle conversion between frontend and backend data formats */

import type {
  _AnalysisInputs,
  _AnalysisResults,
  _ConvertIdsResults,
} from "@/api/types";

/** backend format to frontend format */
export const convertConvertIds = (backend: _ConvertIdsResults) => {
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
      name: row["Gene Name"],
      inNetwork:
        (row["In BioGRID?"] ?? row["In IMP?"] ?? row["In STRING?"]) === "Y",
    })),
  };
};

/** backend format to frontend format */
export const convertAnalysisInputs = (backend: _AnalysisInputs) => ({
  name: backend.name,
  genes: backend.genes,
  speciesTrain: backend.sp_trn,
  speciesTest: backend.sp_res,
  network: backend.net_type,
  genesetContext: backend.gsc,
  negatives: backend.negatives,
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
  sp_res: frontend.speciesTest,
  net_type: frontend.network,
  gsc: frontend.genesetContext,
  negatives: frontend.negatives,
});

/** backend format to frontend format */
export const convertAnalysisResults = (backend: _AnalysisResults) => ({
  inputGenes: backend.df_convert_out_subset.map((row) => ({
    input: row["Original ID"],
    entrez: row["Entrez ID"].match(/Could Not be mapped to Entrez/i)
      ? ""
      : row["Entrez ID"],
    name: row["Gene Name"],
    inNetwork:
      (row["In BioGRID?"] ?? row["In IMP?"] ?? row["In STRING?"]) === "Y",
  })),
  crossValidation: backend.avgps,
  positiveGenes: backend.positive_genes,
  predictions: backend.df_probs.map((row) => ({
    entrez: row.Entrez,
    symbol: row.Symbol,
    name: row.Name,
    knownNovel: row["Known/Novel"],
    classLabel: expandClass(row["Class-Label"]),
    probability: row.Probability,
    zScore: row["Z-score"],
    pAdjusted: row["P-adjusted"],
    rank: row.Rank,
  })),
  similarities: backend.df_sim.map((row) => ({
    task: row.Task,
    id: row.ID,
    name: row.Name,
    similarity: row.Similarity,
    zScore: row["Z-score"],
    pAdjusted: row["P-adjusted"],
    rank: row.Rank,
  })),
  network: {
    nodes: backend.df_probs.map((row) => ({
      entrez: row.Entrez,
      symbol: row.Symbol,
      name: row.Name,
      knownNovel: row["Known/Novel"],
      classLabel: expandClass(row["Class-Label"]),
      probability: row.Probability,
      zScore: row["Z-score"],
      pAdjusted: row["P-adjusted"],
      rank: row.Rank,
    })),
    edges: backend.df_edge.map((row) => ({
      source: row.Node1,
      target: row.Node2,
      weight: row.Weight,
    })),
  },
  neutralInfo: (() => {
    const { "All Neutrals": all, ...sets } = backend.neutral_gene_info;
    return {
      all: Array.isArray(all) ? all : [],
      sets: Object.entries(sets).flatMap(([Id, value]) =>
        Array.isArray(value) ? [] : { Id, ...value },
      ),
    };
  })(),
});

/** ml endpoint params frontend format */
export type AnalysisResults = ReturnType<typeof convertAnalysisResults>;

/** convert class label abbreviation to full text */
const expandClass = (
  abbrev: _AnalysisResults["df_probs"][number]["Class-Label"],
) => (({ P: "Positive", N: "Negative", U: "Neutral" }) as const)[abbrev];

/** full analysis */
export type Analysis = { inputs: AnalysisInputs; results: AnalysisResults };
