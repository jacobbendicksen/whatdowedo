"use strict";

var path = require('path');
var express = require('express');
var app = express();
var router = express.Router();
var legcontact = require('./legcontact.js');
var bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

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

app.get('/events.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/events.html'));
    console.log("loaded events.html\n");
});

app.get('/stream.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/stream.html'));
    console.log("loaded stream\n");
});

app.get('/news.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/news.html'));
    console.log("loaded news\n");
});

app.get('/donate.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/donate.html'));
    console.log("loaded donate\n");
});

app.get('/legcontact.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/legcontact.html'));
    console.log("loaded legcontact\n");
});

app.get('/legcontact.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/legcontact.js'));
    console.log("loaded legcontact.js\n");
});

var reps;
app.post('/leginfo', function(req,res){
    console.log("posting reps");
    var addr = req.body.addr;
    var doctoredAddress = addr.replace(" ", "+");
    reps = legcontact.getReps(doctoredAddress);
    console.log(reps);
    // res.json(reps);
    // res.sendFile(path.join(__dirname + '/legcontact.html'));
});

app.get('/leg', function(req,res){
    console.log("getting reps");
    res.json(reps);
})

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

app.get('/issues/women.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/issues/women.html'));
    console.log("loaded reproductiverights\n");
});

app.get('/issues/refugees.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/issues/refugees.html'));
    console.log("loaded refugees\n");
});

app.get('/issues/climatechange.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/issues/climatechange.html'));
    console.log("loaded climatechange\n");
});

app.listen(process.env.PORT || 4000);
