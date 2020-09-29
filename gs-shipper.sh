#!/bin/zsh

# depends on terminal notifier and gsutil

if [[ $# -eq 0 ]] ; then
    echo 'no path argument, you had one job!'
    exit 0
fi
if [ -f "$1" ]; then # file exists
	FILEPATH=$1
	FILENAME=$(basename $FILEPATH)
	/Applications/google-cloud-sdk/bin/gsutil -m cp "$FILEPATH" gs://serveon-site
	/usr/local/bin/terminal-notifier -open "https://serveon.site/$FILENAME" -message "https://serveon.site/$FILENAME" -title "served on site" -subtitle="https://serveon.site/$1"
fi
if [ -d "$1" ]; then # directory exists
	FOLDERPATH=$1
	FOLDERNAME="$(basename $FOLDERPATH)"
	gsutil -m cp -r "$FOLDERPATH" gs://serveon-site # remove leading slash
	/usr/local/bin/terminal-notifier -open "https://serveon.site/$FOLDERNAME" -message "https://serveon.site/$FOLDERNAME/" -title "served on site" -subtitle="https://serveon.site/$1"
fi
