#!/usr/bin/env node
// -*- coding: utf-8 -*-
//===============================================================================
//
// Copyright (c) 2020 <> All Rights Reserved
//
//
// File: /f/chatopera/docs.bot/lib/shortutl.js
// Author: Hai Liang Wang
// Date: 2022-04-28:14:47:42
//
//===============================================================================
/**
 *
 */
const basedir = __dirname;
const axios = require('axios').default;
const debug = require("debug")("chatopera:docsbot:shorturl");
const querystring = require('querystring');

async function create(shortUrlProvider, longUrl) {
  const data = new URLSearchParams();
  data.append('longUrl', longUrl)
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: data,
    url: shortUrlProvider + "/create",
  };
  let resp = await axios(options);
  // console.log(JSON.stringify(resp.data))
  return resp.data
}

class Shorturl {

  constructor(provider = "https://dwz.chatopera.com") {
    this.provider = provider
  }

  async create(longUrl) {
    let resp = await create(this.provider, longUrl);
    return resp;
  }

  setProvider(provider) {
    if (provider.endsWith("/")) {
      provider = provider.slice(0, provider.lastIndexOf('/'));
    }

    this.provider = provider;
  }

  getProvider() {
    return this.provider;
  }

}


// main function
async function main() {
  let resp = await create("https://dwz.chatopera.com", "https://gitlab.chatopera.com/chatopera/chatopera.shorturl/issues/1")
  // {"shortUrl":"https://dwz.chatopera.com/86548j<br>","shortUrlIds":["86548j"]}
  console.log(resp)
}

// on main entry
if (require.main === module) {
  (async function () {
    await main();
    process.exit(0);
  })();
}


exports = module.exports = {
  create,
  Shorturl
}
