import functions_framework
import geneplexus


@functions_framework.http
def ml(request):
    """
    run full analysis with geneplexus
    """

    # handle preflight request
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)

    # set CORS headers for main request
    headers = {"Access-Control-Allow-Origin": "*"}

    try:
        # parse request body params
        request_json = request.get_json()
        genes = request_json["genes"]
        gsc = request_json["gsc"]
        net_type = request_json["net_type"]
        sp_trn = request_json["sp_trn"]
        sp_tst = request_json["sp_tst"]
    except:
        message = "Problem with input headers, body, or params."
        return ({"message": message}, 400, headers)

    try:
        # set up geneplexus
        gp = geneplexus.GenePlexus(
            file_loc="data",
            gsc_trn=gsc,
            gsc_tst=gsc,
            features="SixSpeciesN2V",
            net_type=net_type,
            sp_trn=sp_trn,
            sp_tst=sp_tst,
        )

        # load and convert genes
        gp.load_genes(genes)

        # run full analysis
        gp.fit_and_predict()
        gp.make_sim_dfs()
        gp.make_small_edgelist()
        gp.alter_validation_df()

        # format response
        response = {}
        response["avgps"] = gp.avgps
        response["df_probs"] = gp.df_probs.to_dict(orient="records")
        response["df_sim"] = gp.df_sim.to_dict(orient="records")
        response["df_edge"] = gp.df_edge.to_dict(orient="records")
        response["isolated_genes"] = gp.isolated_genes
        response["df_edge_sym"] = gp.df_edge_sym.to_dict(orient="records")
        response["isolated_genes_sym"] = gp.isolated_genes_sym
        response["df_convert_out_subset"] = gp.df_convert_out_subset.to_dict(
            orient="records"
        )
        response["positive_genes"] = gp.positive_genes

        return (response, 200, headers)
    except Exception as error:
        message = f"Error running GenePlexus:\n\n{error}"
        return ({"message": message}, 500, headers)
