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
