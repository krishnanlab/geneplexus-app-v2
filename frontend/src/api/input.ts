import { api, request } from "@/api";
import type { ConvertIds } from "@/api/types";

/** convert input list of genes into entrez */
export const convertGeneIds = async (ids: string[], species = "Human") => {
  const params = { geneids: ids, species };
  const response = await request<ConvertIds>(`${api}/gpz-convert-ids`, params);

  response.df_convert_out.data.forEach(
    (d) => (d[1] = d[1].match(/Could Not be mapped to Entrez/i) ? "" : d[1]),
  );

  const transformed = {
    count: response.input_count,
    success: response.df_convert_out.data.filter(([, entrez]) => entrez).length,
    error: response.df_convert_out.data.filter(([, entrez]) => !entrez).length,
    summary: response.table_summary,
    table: response.df_convert_out.data.map(
      ([original, entrez, biogrid, imp, string]) => ({
        original,
        entrez,
        biogrid: biogrid === "Y",
        imp: imp === "Y",
        string: string === "Y",
      }),
    ),
  };
  return transformed;
};
