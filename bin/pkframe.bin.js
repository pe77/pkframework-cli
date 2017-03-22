#!/usr/bin/env node
var app = require('../pkframe');

var static_dir = '.';

if (process.argv.length > 2) {
    static_dir = process.argv[2];
}

app.init(static_dir);