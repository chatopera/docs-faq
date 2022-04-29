#!/usr/bin/env node
// -*- coding: utf-8 -*-
//===============================================================================
//
// Copyright (c) 2020 <> All Rights Reserved
//
//
// File: /c/Users/Administrator/chatopera/docs.bot/index.js
// Author: Hai Liang Wang
// Date: 2022-04-28:13:33:30
//
//===============================================================================
/**
 *
 */
const basedir = __dirname;
const workdir = process.cwd();
const debug = require("debug")("chatopera:docs:bot");
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const readlineq = require("readlineq");
const tokenizer = require("./lib/tokenizer")
const { Shorturl } = require("./lib/shorturl")
const { hash, occurrences } = require("./lib/utils")


const shorturl = new Shorturl();


/**
 * 一级目录说明
 */
const ROOT_CATEGORIES = {
  "chatbot-platform": "Chatopera",
  "cskefu": "春松客服"
}
function mapRootCategory(rootCategory) {
  if (ROOT_CATEGORIES[rootCategory]) {
    return ROOT_CATEGORIES[rootCategory]
  }
  return rootCategory
}

/**
 * 忽略的问题
 * 一下内容不作为问题
 */
const FILTER_OUT_POSTS = new Set();
FILTER_OUT_POSTS.add("下一步")
FILTER_OUT_POSTS.add("感谢您")
FILTER_OUT_POSTS.add("感谢你")
FILTER_OUT_POSTS.add("可能遇到的问题")

/**
 * Resolve URL
 * @param {*} from 
 * @param {*} to 
 * @returns 
 */
function resolveUrl(from, to) {
  const resolvedUrl = new URL(to, new URL(from, 'resolve://'));
  if (resolvedUrl.protocol === 'resolve:') {
    const { pathname, search, hash } = resolvedUrl;
    return pathname + search + hash;
  }
  return resolvedUrl.toString();
}

/**
 * 将 FAQ 按照约定格式输出为字符串
 * @param {*} faqsMetadata 
 * @param {*} outputType 
 * @returns 
 */
function renderOutputData(faqsMetadata, outputType, repoName) {
  const outputMap = {
    yaml() {
      const result = {};
      faqsMetadata.forEach((p) => {
        result[p.post] = { answers: [p.reply] };
      });

      return yaml.dump({ [repoName]: result }, { lineWidth: -1 });
    },
    json() {
      const result = faqsMetadata.map((p) => {
        return p
      });

      return JSON.stringify(result, null, 2);
    },
  };

  const outputFn = outputMap[outputType];

  if (!outputFn) {
    console.log('output type undefined');
    return;
  }

  const outputStr = outputFn();

  // debug("outputStr ", outputStr)
  return outputStr
}

/**
 * Get file title in H1 format
 * @param {*} targetPath 
 * @returns 
 */
function resolveTitle(targetPath) {
  const mdStr = fs.readFileSync(targetPath, 'utf-8');
  const match = mdStr.match(/# (.+)/);
  if (match) {
    const title = match[1];
    return title
  }
}

/**
 * Generate FAQ data with markdown file
 * @param {*} targetPath 
 * @param {*} title 
 * @param {*} url 
 * @returns 
 */
async function processMdFileAsFaq(targetPath, url, title, rootCategory) {
  const MKS_MARKER = "<!-- markup:skip-line -->"
  debug("[processMdFileAsFaq] targetPath %s, url %s, title %s, rootCategory %s", targetPath, url, title, rootCategory)
  const result = [];

  const lines = await readlineq(targetPath)
  let currentSection = title; // 当前所在的标题
  let isInCodeBlock = false;  // 当前是否在代码中
  let isInCodeBlockCount = 0;
  let isSectionLine = false;

  for (let x of lines) {
    debug("%s: %s", title, x)

    // remove specific contents
    x = x.trim()
    x = x.replace(MKS_MARKER, "")

    // resolve current section
    let blockcount = occurrences(x, "```")
    isInCodeBlockCount += blockcount;

    if (isInCodeBlockCount % 2 == 0) {
      isInCodeBlock = false
    } else {
      isInCodeBlock = true
    }

    if (isInCodeBlock == false) {
      // 识别是否是标题
      if (x.startsWith("#")) {
        isSectionLine = true
        let z = x.replace(/#/g, "").trim()
        if (z) {
          currentSection = z
        }
      } else {
        // 不是标题
        isSectionLine = false
      }
    } else {
      // 忽略代码中内容
      continue;
    }

    // #TODO 如需全文都处理，去掉这个判断条件
    if (!isSectionLine) {
      // 减少数据，优化体验，只将标题处理为问答对
      continue;
    }

    let sents = tokenizer.split(x)
    for (let y of sents) {

      let pure = tokenizer.pure(y)

      if (!pure) continue

      // check post
      let post = y.replace(/#/g, "").trim();
      if (!post) continue;

      // resolve category
      let categories = [];
      if (rootCategory)
        categories.push(mapRootCategory(rootCategory))

      categories.push(title)

      if (currentSection != title)
        categories.push(currentSection)

      let link = `${url}#${currentSection}`
      let docId = hash(y + title + link)

      try {
        let ret = await shorturl.create(link)

        if (ret && ret.shortUrlIds && ret.shortUrlIds.length > 0) {
          link = shorturl.getProvider() + "/" + ret.shortUrlIds[0]
        } else {
          // error
          console.error(ret);
          throw new Error("Error with shortUrl Service")
        }
      } catch (e) {
        // bypass
        continue;
      }

      let categoriesCopy = JSON.parse(JSON.stringify(categories));

      // Link with Thumbnail
      result.push({
        docId: docId,
        post: post,
        replies: [
          {
            "rtype": "hyperlink",
            "thumbnail": "https://bot.chatopera.com/file/626b17379a63490018d128d2",
            "title": `${post != currentSection ? (post.length > 20 ? (post.slice(0, 20) + "|") : (post + "|")) : ""}${categories.length > 2 ? categoriesCopy.reverse().slice(0, 2).join("|") : categoriesCopy.reverse().join("|")}`,
            "content": "查看详情，快戳我~",
            "url": link
          }
        ],
        categories: categories,
        enabled: true,
      })

      // Text
      // result.push({
      //   docId: docId,
      //   post: post,
      //   replies: [
      //     {
      //       "rtype": "plain",
      //       "content": `${post != currentSection ? (post.length > 20 ? (post.slice(0, 20) + "|") : (post + "|")) : ""}${categories.length > 2 ? categoriesCopy.reverse().slice(0, 2).join("|") : categoriesCopy.reverse().join("|")}，访问详情 ${link}`
      //     },
      //   ],
      //   categories: categories,
      //   enabled: true,
      // })
    }
  }

  return result;
}


/**
 * Main entry
 * @param {*} options 
 */
async function parse(options) {

  const basePath = options.input;
  const baseUrl = options.baseurl.endsWith("/") ? options.baseurl : options.baseurl + "/";
  const baseFolders = options.folders ? options.folders.split(",") : null;
  const shortUrlProvider = options.shorturl;

  if (shortUrlProvider) {
    shorturl.setProvider(shortUrlProvider)
  }

  if (baseFolders) {
    for (let x of baseFolders) {
      if (!fs.existsSync(path.join(basePath, x))) {
        throw new Error(`Check base folder: ${path.join(basePath, x)} not exist.`)
      }
    }
  }

  if (!fs.existsSync(basePath)) {
    throw new Error("input path path not exists")
  }

  const faqs = [];
  const faqsPostDedup = new Set(); // 根据问题进行去重

  const parsePath = async (dirPath, urlPath, rootCategory) => {
    debug("parsePath %s, urlPath %s, rootCategory %s", dirPath, urlPath, rootCategory)
    const names = fs.readdirSync(dirPath);

    for (let name of names) {
      const targetPath = path.join(dirPath, name);
      const stat = fs.lstatSync(targetPath);
      if (stat.isDirectory()) {
        await parsePath(path.join(dirPath, name), path.join(urlPath, name), rootCategory);
      } else if (stat.isFile() && /\.md$/.test(name)) {
        console.log("parsing file ", targetPath, "...")
        const url = resolveUrl(
          baseUrl,
          path.join(urlPath, name.replace('.md', '.html'))
        );

        let title = resolveTitle(targetPath);
        let result = await processMdFileAsFaq(targetPath, url, title, rootCategory);
        for (let y of result) {
          if (FILTER_OUT_POSTS.has(y.post))
            continue

          if (faqsPostDedup.has(y.post)) {
            // 已经包含该问题了
            console.log("parse dedup", rootCategory, "-", y.post)
            continue;
          } else {
            faqs.push(y) // { post: title, reply: url }
            faqsPostDedup.add(y.post)
          }
        }

        // fast output for every file
        let outputData = renderOutputData(faqs, options.type, options.repo);
        fs.writeFileSync(options.output, outputData);
      }
    }
  };

  if (baseFolders.length > 0) {
    for (let x of baseFolders) {
      let f = path.join(basePath, x);
      await parsePath(f, x, x);
    }
  } else {
    await parsePath(basePath, '');
  }

  console.log("File generated", options.output)
}

exports = module.exports = {
  parse
}