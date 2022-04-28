#! /bin/bash 
###########################################
#
###########################################

# constants
baseDir=$(cd `dirname "$0"`;pwd)
export PYTHONUNBUFFERED=1
export PATH=/opt/miniconda3/envs/venv-py3/bin:$PATH

# functions

# main 
[ -z "${BASH_SOURCE[0]}" -o "${BASH_SOURCE[0]}" = "$0" ] || return
cd $baseDir/..
source .env

if [ ! -d tmp ]; then
    mkdir tmp
fi

# DEBUG_STR=chatopera:* 
DEBUG_STR=""

DEBUG=$DEBUG_STR node ./bin/cmd.js -i $DOCS_HOME \
    -f $DOCS_FOLDER \
    -o $baseDir/../tmp/bot.faq.json \
    -s $SHORTURL_PROVIDER

# node ./bin/cmd.js -i $DOCS_HOME \
#     -f $DOCS_FOLDER \
#     -o $baseDir/../tmp/bot.faq.json \
#     -s $SHORTURL_PROVIDER