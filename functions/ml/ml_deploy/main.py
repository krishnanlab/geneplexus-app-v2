import functions_framework
import geneplexus


@functions_framework.http
def run_pipeline(request):
    """HTTP Cloud Function.
    set function up for CORS headers so function can be called from js
    
    """
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)
    
    # Set CORS headers for the main request
    headers = {"Access-Control-Allow-Origin": "*"}
    
    """"Function Inputs
    geneids: if request_json list of strings
             if request_args genes are in comma separated string
             Note: should just be original input genes as they will be converted
                   again
    gsc: str; option are ["GO","Monarch","DisGeNet","Combined"]
         this will be used to select negative genes and which sets
            to compare trained model to
         Note: DisGeNet is only available for Human
         Note: Combined is including GO, Monarch together (plus 
                  DisGeNet for human)
    net_type: str; options are ["BioGRID","STRING","IMP"]
              network for which the ML features are from and which
              edgelist is used to make the final graph     
    sp_trn: str; options are ["Human","Mouse","Fly","Zebrafish","Worm","Yeast"]
            this is same species in which user supplies the gene ids for
            Note: If net_type == BioGRID, Zebrafish is not allowed
    sp_tst: str; options are ["Human","Mouse","Fly","Zebrafish","Worm","Yeast"]
            this is the species for which model predictions will be made
            Note: If net_type == BioGRID, Zebrafish is not allowed
    
    """
    
    try:
        # get info from the requests
        request_json = request.get_json(silent=True)
        request_args = request.args
        # gene ids must be comma separated in request
        if request_json:
            geneids = request_json["geneids"]
            input_genes = geneids
            gsc = request_json["gsc"]
            net_type = request_json["net_type"]
            sp_trn = request_json["sp_trn"]
            sp_tst = request_json["sp_tst"]
        elif request_args:
            geneids = request_args["geneids"]
            input_genes = geneids.strip().split(",")
            gsc = request_args["gsc"]
            net_type = request_args["net_type"]
            sp_trn = request_args["sp_trn"]
            sp_tst = request_args["sp_tst"]
    except:
        return "problem with input"

    """"Function Outputs
    :attr:`GenePlexus.avgps` (array of float)
        Cross validation results. Performance is measured using
        log2(auprc/prior).
    :attr:`GenePlexus.df_probs` (DataFrame)
        A table with 7 columns: **Entrez** (the gene Entrez ID), **Symbol**
        (the gene Symbol), **Name** (the gene Name), **Probability** (the
        probability of a gene being part of the input gene list),
        **Known/Novel** (whether the gene is in the input gene list),
        **Class-Label** (positive, negative, or neutral), **Rank** (rank of
        relevance of the gene to the input gene list).
        Note: If sp_trn != sp_tst then Known/Novel and Class-Label columns
            are not included
    :attr:`GenePlexus.df_sim` (DataFrame)
        A table with 4 columns: **ID** (the term ID), **Name** (name of
        the term), **Similarity** (similarity between the input model
        and a model trained on the term gene set), **Rank** (rank of
        similarity between the input model and a model trained on the
        term gene set).
    :attr:`GenePlexus.df_edge` (DataFrame)
        Table of edge list corresponding to the subgraph induced by the top
        predicted genes (in Entrez gene ID).
    :attr:`GenePlexus.isolated_genes` (List[str])
        List of top predicted genes (in Entrez gene ID) that are isolated
        from other top predicted genes in the network.
    :attr:`GenePlexus.df_edge_sym` (DataFrame)
        Table of edge list corresponding to the subgraph induced by the top
        predicted genes (in gene symbol).
    :attr:`GenePlexus.isolated_genes_sym` (List[str])
        List of top predicted genes (in gene symbol) that are isolated from
        other top predicted genes in the network.
    :attr:`GenePlexus.df_convert_out_subset` (Dataframe)
        Three columns: **Original ID** (user supplied gene ID), **Entrez ID**
        (ID converted to Entrez if possible), ** In net_type ** (the column for
        which the network was used to run the model)
    :attr:`GenePlexus.isolated_genes_sym` (List[str])
        List of genes considered positives in the network.
        
    """

    try:
        # set the gp object
        gp = geneplexus.GenePlexus(file_loc = "data",
                                   gsc_trn = gsc,
                                   gsc_tst = gsc,
                                   features = "SixSpeciesN2V",
                                   net_type = net_type,
                                   sp_trn = sp_trn,
                                   sp_tst = sp_tst)
        gp.load_genes(input_genes)
        mdl_weights, df_probs, avgps = gp.fit_and_predict()
        df_sim, weights_dict = gp.make_sim_dfs()
        df_edge, isolated_genes, df_edge_sym, isolated_genes_sym = gp.make_small_edgelist()
        df_convert_out_subset, positive_genes = gp.alter_validation_df()
        # save outputs in json format
        json_out = {}
        json_out["avgps"] = gp.avgps
        json_out["df_probs"] = gp.df_probs.to_dict(orient="records")
        json_out["df_sim"] = gp.df_sim.to_dict(orient="records")
        json_out["df_edge"] = gp.df_edge.to_dict(orient="records")
        json_out["isolated_genes"] = gp.isolated_genes
        json_out["df_edge_sym"] = gp.df_edge_sym.to_dict(orient="records")
        json_out["isolated_genes_sym"] = gp.isolated_genes_sym
        json_out["df_convert_out_subset"] = gp.df_convert_out_subset.to_dict(orient="records")
        json_out["positive_genes"] = gp.positive_genes
        return (json_out, 200, headers)
    except:
        return ("problem with geneplexus", 500, headers)
