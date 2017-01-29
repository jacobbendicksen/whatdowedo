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

app.get('/issues/conflicts.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/issues/conflicts.html'));
    console.log("loaded conflicts\n");
});

app.get('/issues/idk.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/issues/idk.html'));
    console.log("loaded idk\n");
});

app.get('/issues/lgbt.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/issues/lgbt.html'));
    console.log("loaded lgbt\n");
});

app.get('/issues/racism.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/issues/racism.html'));
    console.log("loaded racism\n");
});

app.get('/issues/reproductiverights.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/issues/reproductiverights.html'));
    console.log("loaded reproductiverights\n");
});

app.get('/issues/refugees.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/issues/refugees.html'));
    console.log("loaded refugees\n");
});

app.listen(process.env.PORT || 4000);
