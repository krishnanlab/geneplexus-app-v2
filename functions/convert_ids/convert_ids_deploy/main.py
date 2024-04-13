import functions_framework
import geneplexus


@functions_framework.http
def convert_ids(request):
    """
    normalize gene symbols/names/ids to entrez ids
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
        body = request.get_json()
        genes = body["genes"]
        species = body["species"]
    except:
        message = "Problem with input headers, body, or params."
        return ({"message": message}, 400, headers)

    try:
        # set up geneplexus
        # other params (e.g. network, features, gsc) not needed for gene conversion
        gp = geneplexus.GenePlexus(file_loc="data", sp_trn=species)

        # load and convert genes
        gp.load_genes(genes)

        # format response
        response = {}
        response["convert_ids"] = gp.convert_ids
        response["table_summary"] = gp.table_summary
        response["input_count"] = gp.input_count
        response["df_convert_out"] = gp.df_convert_out.to_dict(orient="records")

        return (response, 200, headers)
    except Exception as error:
        message = f"Error running GenePlexus:\n\n{error}"
        return ({"message": message}, 400, headers)
