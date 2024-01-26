import numpy as np


# set some inputs
network = "GIANT-TN" # options GIANT-TN or BioGRID or STRING
negatives = "GO" # options GO or DisGeNet
geneset_size = "variable" # options small, medium, variable
num_genes = 4 # only used when geneset_size is variable
num_calls = 1 # the number of times to run curl on the same set of genes
save_name = "test1"

# read in the genes
if geneset_size == "small":
    genes = "6457,7037,3134,TTC8,BBS5,BBS12"
elif geneset_size == "medium":
    genes = np.loadtxt("input_genes.txt",dtype="str")
    genes = ",".join(genes)
elif geneset_size == "variable":
    genes = np.loadtxt(f"NodeOrder_{network}.txt",dtype="str")
    genes = np.random.choice(genes, size = num_genes, replace=False)
    genes = ",".join(genes)
    
mylist = ["#!/bin/bash"]
mylist.append("### create curl commands")
for i in range(num_calls):
    mylist.append(f'curl "https://us-central1-gap-som-dbmi-geneplx-app-p0n.cloudfunctions.net/gp-ml-{network}-{negatives}?geneids={genes}"')

with open(f"{save_name}.sh", 'w') as thefile:
    for item in mylist:
        thefile.write("%s\n" % item)