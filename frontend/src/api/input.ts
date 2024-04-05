import { api, request } from "@/api";
import type { ConvertIds } from "@/api/types";

/** convert input list of genes into entrez */
export const convertGeneIds = async (ids: string[], species = "Human") => {
  const params = { geneids: ids, species };
  const response = await request<ConvertIds>(`${api}/gpz-convert-ids`, params);

  for (const row of response.df_convert_out)
    if (row["Entrez ID"].match(/Could Not be mapped to Entrez/i))
      row["Entrez ID"] = "";

  const transformed = {
    count: response.input_count,
    success: response.df_convert_out.filter((row) => row["Entrez ID"]).length,
    error: response.df_convert_out.filter((row) => !row["Entrez ID"]).length,
    summary: response.table_summary,
    table: response.df_convert_out.map((row) => ({
      input: row["Original ID"],
      entrez: row["Entrez ID"],
      biogrid: row["In BioGRID?"] === "Y",
      imp: row["In IMP?"] === "Y",
      string: row["In STRING?"] === "Y",
    })),
  };

  return transformed;
};
