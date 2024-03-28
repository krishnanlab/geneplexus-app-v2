#!/bin/bash

cd ml

gcloud functions deploy gpz-ml \
    --gen2 \
    --runtime=python311 \
    --region=us-central1 \
    --source=. \
    --entry-point=run_pipeline \
    --trigger-http \
    --allow-unauthenticated \
    --memory=8192MB \
    --service-account=logging-monitoring@gap-som-dbmi-geneplx-app-p0n.iam.gserviceaccount.com

