#!/bin/bash

# this function will get data generated in GenePlexus_Backend
# and add it to function and zip it to be moved to the cloud

# set dir to backend data
dir1=/Users/mancchri/Desktop/CIDA_unsorted/Arjun/GenePlexusZoo_webserver/gpdata_prop/regular

# make dir and move in data
mkdir convert-ids_data
cp $dir1/IDconversion*.json convert-ids_data
cp $dir1/NodeOrder*.txt convert-ids_data
# tar this dir (note this compresseed file is manually uploaded to GCP later)
tar -czvf convert-ids_data.tar.gz convert-ids_data
# rename the dir to be move into gcp function
mv convert-ids_data data
# delete old data file and move new one in
rm -rf convert_ids_deploy/data
mv data convert_ids_deploy