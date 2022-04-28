/**
 * 自然语言处理工具
 * Chatopera 机器人平台已经分词了，此处只需要分句
 * # 快速下载
 * npm install nodejieba --registry=https://registry.npm.taobao.org --nodejieba_binary_host_mirror=https://npm.taobao.org/mirrors/nodejieba
 */

// var nodejieba = require("nodejieba");
// nodejieba.load();
const basedir = __dirname;
const path = require('path');
const readlineq = require('readlineq');

const SENTENCE_SPLIT_TAGS = new Set(['?', '!', '？', '！', '。', '…']);

// other options
SENTENCE_SPLIT_TAGS.add(",")
SENTENCE_SPLIT_TAGS.add("，")

const PUNTS = new Set();
const EMOJI = new Set();
const STOPWORDS_CN = new Set();

(async function () {
    const PUNTS_FILE = await readlineq(path.join(basedir, "..", "wordseg", "punctuation.utf8"));
    for (let x of PUNTS_FILE) {
        PUNTS.add(x.trim())
    }
    const EMOJI_FILE = await readlineq(path.join(basedir, "..", "wordseg", "emoji.utf8"));
    for (let x of EMOJI_FILE) {
        EMOJI.add(x.trim())
    }
    const STOPWORDS_CN_FILE = await readlineq(path.join(basedir, "..", "wordseg", "zh_CN", "stop_words.utf8"));
    for (let x of STOPWORDS_CN_FILE) {
        STOPWORDS_CN.add(x.trim())
    }
})();

/**
 * split paragraph
 * @param {*} text 
 * @returns 
 */
function split(text) {
    let result = []
    let t = "";

    for (let x of text) {
        if (SENTENCE_SPLIT_TAGS.has(x)) {
            if (t) {
                result.push((' ' + t).slice(1))
                t = ""
            }
        } else {
            t += x
        }
    }

    if (t) {
        result.push(t)
    }

    return result
}

/**
 * Pure sentence
 * @param {*} sent 
 * @returns 
 */
function pure(sent) {
    let result = ""
    for (let x of sent) {
        if (PUNTS.has(x))
            continue

        if (EMOJI.has(x))
            continue

        if (STOPWORDS_CN.has(x))
            continue

        result += x
    }
    return result;
}


exports = module.exports = {
    split,
    pure
}