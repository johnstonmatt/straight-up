# straight-up

This tool installs a macOS Automator workflow in `~/Library/Services` which can
be invoked with a right-click to upload a file to an object store, currently
only S3 is supported.

## usage

1. install the workflow by running;

   ```bash
   npx straight-up setup s3://mybucketname
   ```

2. Right-Click on a file in Finder and select `Services` ->
   `Upload to S3 - mybucketname` to upload your file
