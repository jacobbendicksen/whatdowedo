"use strict";

var path = require('path');
var express = require('express');
var app = express();
var router = express.Router();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
    console.log("loaded index.html\n");
});

app.get('/about.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/about.html'));
    console.log("loaded about.html\n");
});

app.get('/issues.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/issues.html'));
    console.log("loaded issues.html\n");
});

app.listen(process.env.PORT || 4000);
