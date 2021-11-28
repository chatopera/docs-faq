#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const url = require('url');
const yaml = require('js-yaml');

program.version('0.1.0');

program
  .option('-t, --type <type>', 'output file type', 'yaml')
  .option('-r, --repo <repoName>', 'output file type', 'chatopera/*')
  .option(
    '--baseUrl <baseUrl>',
    'docs base url',
    'https://docs.chatopera.com/products/'
  )
  .requiredOption('-i, --input <input>', 'input dir path')
  .requiredOption('-o, --output <output>', 'output file path');

program.parse(process.argv);

const options = program.opts();

const basePath = options.input;
const baseUrl = options.baseUrl;

if (!fs.existsSync(basePath)) {
  console.log('input path path not exists');
  return;
}

function resolve(from, to) {
  const resolvedUrl = new URL(to, new URL(from, 'resolve://'));
  if (resolvedUrl.protocol === 'resolve:') {
    const { pathname, search, hash } = resolvedUrl;
    return pathname + search + hash;
  }
  return resolvedUrl.toString();
}

const faqList = [];

const parsePath = (dirPath, urlPath) => {
  const names = fs.readdirSync(dirPath);

  for (let name of names) {
    const targetPath = path.join(dirPath, name);
    const stat = fs.lstatSync(targetPath);
    if (stat.isDirectory()) {
      parsePath(path.join(dirPath, name), path.join(urlPath, name));
    } else if (stat.isFile() && /\.md$/.test(name)) {
      const url = resolve(
        baseUrl,
        path.join(urlPath, name.replace('.md', '.html'))
      );
      const mdStr = fs.readFileSync(targetPath, 'utf-8');
      const match = mdStr.match(/# (.+)/);
      if (match) {
        const title = match[1];
        faqList.push({ post: title, reply: url });
      }
    }
  }
};

parsePath(basePath, '');

const outputMap = {
  yaml() {
    const result = {};
    faqList.forEach((p) => {
      result[p.post] = { answers: [p.reply] };
    });

    return yaml.dump({ [options.repo]: result }, { lineWidth: -1 });
  },
  json() {
    const result = faqList.map((p) => {
      return {
        categories: [],
        enabled: true,
        post: p.post,
        replies: [
          {
            rtype: 'plain',
            content: p.reply,
          },
        ],
        similarQuestions: [],
      };
    });

    return JSON.stringify(result, null, 2);
  },
};

const outputFn = outputMap[options.type];

if (!outputFn) {
  console.log('output type undefined');
  return;
}

const outputStr = outputFn();

fs.writeFileSync(options.output, outputStr);
