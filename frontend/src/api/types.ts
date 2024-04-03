export type ConvertIds = {
  convert_ids: string[];
  df_convert_out: {
    columns: string[];
    index: number[];
    data: [string, string, string, string, string][];
  };
  input_count: number;
  table_summary: {
    Network: string;
    NetworkGenes: number;
    PositiveGenes: number;
  }[];
};
