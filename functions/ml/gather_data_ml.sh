#!/bin/bash

# this function will get data generated in GenePlexus_Backend
# and add it to function and zip it to be moved to the cloud

# set dir to backend data
dir1=/Users/mancchri/Desktop/CIDA_unsorted/Arjun/GenePlexusZoo_webserver/gpdata_prop/regular

# make dir and move in data
mkdir ml_data
cp $dir1/* ml_data
# tar this dir (note this compresseed file is manually uploaded to GCP later)
tar -czvf ml_data.tar.gz ml_data
# rename the dir to be move into gcp function
mv ml_data data
# delete old data file and move new one in
rm -rf ml_deploy/data
mv data ml_deploy