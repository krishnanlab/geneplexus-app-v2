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
export type GenesetContext = "GO" | "Monarch" | "Mondo" | "Combined";

/** convert-ids endpoint inputs format */
export type _ConvertIdsInputs = {
  /** list of gene symbols/names/ids */
  genes: string[];
  /** species to lookup genes against */
  species: Species;
};

/** convert-ids endpoint results format */
export type _ConvertIdsResults = {
  /** number of genes inputted (integer) */
  input_count: number;
  /** list of successfully converted Entrez IDs */
  convert_ids: string[];
  /** high level summary of conversion results, per network */
  table_summary: {
    /** network */
    Network: Network;
    /** total number of genes in network (integer) */
    NetworkGenes: number;
    /** number of input genes in network (integer) */
    PositiveGenes: number;
  }[];
  /** dataframe of results */
  df_convert_out: {
    /** input id of gene */
    "Original ID": string;
    /** converted id of gene */
    "Entrez ID": string;
    /** converted name of gene */
    "Gene Name": string;
    /** whether gene was found in each network */
    "In BioGRID?": "Y" | "N";
    "In IMP?": "Y" | "N";
    "In STRING?": "Y" | "N";
  }[];
};

/** ml endpoint inputs format */
export type _AnalysisInputs = {
  /** human-readable name to remember the analysis by */
  name: string;
  /** list of gene symbols/names/ids */
  genes: string[];
  /** species to lookup genes against */
  sp_trn: Species;
  /** species for which model predictions will be made */
  sp_res: Species;
  /**
   * network that ML features are from and which edge list is used to make final
   * graph
   */
  net_type: Network;
  /**
   * source used to select negative genes and which sets to compare trained
   * model to
   */
  gsc: GenesetContext;
  /** genes to force as negative training examples */
  negatives: string[];
};

/** ml endpoint results format */
export type _AnalysisResults = {
  /** copy of inputs for re-uploading convenience */
  input: _AnalysisInputs;

  /** see `convert-ids` `df_convert_out` schema */
  df_convert_out_subset: _ConvertIdsResults["df_convert_out"];
  /** cross validation results, performance measured using log2(auprc/prior) */
  avgps: (number | null | undefined)[];
  /** number of genes considered positives in network (integer) */
  positive_genes: number;
  /**
   * top predicted genes that are isolated from other top predicted genes in
   * network (as Entrez IDs)
   */
  isolated_genes: string[];
  /**
   * top predicted genes that are isolated from other top predicted genes in
   * network (as gene symbols)
   */
  isolated_genes_sym: string[];
  /**
   * edge list corresponding to subgraph induced by top predicted genes (as
   * Entrez IDs)
   */
  df_edge: { Node1: string; Node2: string; Weight: number }[];
  /**
   * edge list corresponding to subgraph induced by top predicted genes (as gene
   * symbols)
   */
  df_edge_sym: { Node1: string; Node2: string; Weight: number }[];
  /**
   * table showing how associated each gene in prediction species network is to
   * the users gene list
   */
  df_probs: {
    /** rank of relevance of gene to input gene list (integer) */
    Rank: number;
    /** Entrez ID */
    Entrez: string;
    /** gene symbol */
    Symbol: string;
    /** full gene name */
    Name: string;
    /** whether gene is in input gene list */
    "Known/Novel": "Known" | "Novel";
    /** gene class, positive | negative | neutral */
    "Class-Label": "P" | "N" | "U";
    /** probability of gene being part of input gene list */
    Probability: number;
    /** z-score of the probabilities */
    "Z-score": number;
    /** adjusted p-values of the z-scores */
    "P-adjusted": number;
  }[];
  /**
   * table showing how similar user's trained model is to models trained on
   * known gene sets
   */
  df_sim: {
    /**
     * rank of similarity between input model and a model trained on term gene
     * set (integer)
     */
    Rank: number;
    /** type of term */
    Task: string;
    /** term ID */
    ID: string;
    /** term name */
    Name: string;
    /** similarity between input model and a model trained on term gene set */
    Similarity: number;
    /** z-score of the similarities */
    "Z-score": number;
    /** adjusted p-values of the z-scores */
    "P-adjusted": number;
  }[];
  /** extra info about genes marked as neutral */
  neutral_gene_info: Record<
    /** set that genes are from */
    string,
    /** list of gene IDs */
    | string[]
    | {
        /** list of gene IDs */
        Genes: string[];
        /** term name */
        Name: string;
        /** type of term */
        Task: string;
      }
  >;
};
