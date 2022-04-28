# Chatopera Docs BOT

Documentation as a Chatbot. You know, for chat.

Parse local markdown docs inside directory recursivly, generate FAQs File for Chatopera BOT Platform.

Further import into a BOT on Chatopera, details in [doc](https://dwz.chatopera.com/754yr1).

## Install

## Usage

```
docsbot --baseurl https://docs.chatopera.com/products/ \
    -i $DOCS_HOME \
    -f $DOCS_FOLDER \
    -o ./tmp/bot.faq.json
```

Assume your docs folders are like this:

```
$DOCS_HOME(Root dir)
├───chatbot-platform
│   ├───appendix
│   ├───contract
│   ├───explanations
│   ├───howto-guides
│   ├───references
│   │   ├───func-builtin
│   │   └───sdk
│   │       ├───chatbot
│   │       └───chatopera
│   └───tutorials
└───cskefu
    ├───channels
    │   └───messenger
    ├───osc
    └───work-chatbot
```

For example, `DOCS_HOME` is `~/chatopera/docs/docfx_project/products`, whose files are also hosted [here](https://github.com/chatopera/docs), the DOCS_FOLDER should be `chatbot-platform,cskefu`.

Further, the generate Urls are `{baseurl}\{docfoler}\{filepath}.html`.

- baseurl: set with command line
- docfoler: iterater with `DOCS_FOLDER`, split by `,`
- filepath: the markdown files in each `docfoler`, where extension `.md` is replaced with `.html`

### Others

```
docsbot --help
```

## Development

```
npm install
node bin/cmd.js --help
cp sample.env .env
./scripts/dev.sh
```

## License

[Apache2](./LICENSE)
