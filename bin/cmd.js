#!/usr/bin/env node

const { program } = require('commander');


program.version('0.1.0');

program
  .name("docsbot")
  .description('CLI to process markdown documents into Chatopera FAQ Format File. \n https://dwz.chatopera.com/754yr1')
  .option('-t, --type <type>', 'output file type', 'json')
  .option('-r, --repo <repoName>', 'output file type', 'chatopera/*')
  .option(
    '--baseurl <baseUrl>',
    'docs base url',
    'https://docs.chatopera.com/products/'
  )
  .option(
    '-s, --shorturl <shortUrl>',
    'docs short url provider',
    'https://dwz.chatopera.com'
  )
  .option('-f, --folders <folders>', 'scan folders in input dir, scan all if leave it empty')
  .requiredOption('-i, --input <input>', 'input dir path')
  .requiredOption('-o, --output <output>', 'output file path');

program.parse(process.argv);

const options = program.opts();

// main function
async function main() {
  await require("../index").parse(options);
}

// on main entry
if (require.main === module) {
  (async function () {
    try{
      await main();
      process.exit(0);
    } catch(e){
      console.error(e)
      process.exit(1)
    }
  })();
}
