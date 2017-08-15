"use strict";

const Pool = require('pg-pool');
const sha1 = require('sha1');
const moment = require('moment');

const pool = new Pool({
    user: 'qbmbmvrrheihvz',
    password: '49f436f05008da5bee101f7ac2ed0bfa42351cf55f4cfa35ea676930688319c4',
    database: 'd4o2efvkeed31p',
    port: 5432,
    host: 'ec2-54-227-252-202.compute-1.amazonaws.com',
    ssl: true,
});

function addPost(title, contents, author, featured, tags, cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        // contents = contents.replace(/\n/g, "<br>");
        contents = contents.replace(/\r/g, "<br><br>");
        for (var x = 0; x < tags.length; x++){
            tags[x] = tags[x].toLowerCase();
        }
        for (var x = tags.length; x<5; x++){
            tags[x] = "";
        }
        client.query("INSERT INTO posts (title, contents, postid, authorid, featured, time, tag1, tag2, tag3, tag4, tag5, upvotes_int, upvotes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)", [title, contents, sha1(title + author + contents), author, featured, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), tags[0], tags[1], tags[2], tags[3], tags[4], 0, ""], (error) => {
            if (error) {
                console.error(error);
                client.release();
                return cb("insertion error", false);
            } else {
                client.release();
                return cb("post added successfully", true);
            }
        });
    });
}

function getAllPosts(cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        client.query("SELECT * FROM posts JOIN users ON authorid = id ORDER BY time ASC", (error, response) => {
            if (error) {
                console.error(error);
                client.release();
                return;
            }
            client.release();
            if (response.rows !== undefined) {
                response.rows.reverse();
            }
            cb(error, response);
        });
    });
}

function getPost(id, cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        client.query("SELECT * FROM posts JOIN users ON authorid = id WHERE postid=$1 ORDER BY time ASC", [id], (error, response) => {
            if (error) {
                console.error(error);
                client.release();
                return;
            }
            client.release();
            if (response.rows !== undefined) {
                response.rows.reverse();
            }
            cb(error, response);
        });
    });
}

function getFeaturedPosts(cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        client.query("SELECT * FROM posts JOIN users ON authorid = id WHERE featured=$1 ORDER BY time ASC", [true], (error, response) => {
            if (error) {
                console.error(error);
                client.release();
                return;
            }
            client.release();
            if (response.rows !== undefined) {
                response.rows.reverse();
            }
            cb(error, response);
        });
    });
}

function getPostsByUser(user, cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        client.query("SELECT * FROM posts JOIN users ON authorid = id WHERE authorid=$1 ORDER BY time ASC", [user], (error, response) => {
            if (error) {
                console.error(error);
                client.release();
                return;
            }
            client.release();
            if (response.rows !== undefined) {
                response.rows.reverse();
            }
            cb(error, response);
        });
    });
}

function search(tag, cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        if (tag !== undefined && tag !== ""){
            tag = tag.toLowerCase();
            client.query("SELECT * FROM posts JOIN users ON authorid = id WHERE tag1=$1 OR tag2=$1 OR tag3=$1 OR tag4=$1 OR tag5=$1 OR LOWER(title) LIKE $2 ORDER BY time ASC", [tag, '%' + tag + '%'], (error, response) => {
                if (error) {
                    console.error(error);
                    client.release();
                    return;
                }
                client.release();
                if (response.rows !== undefined) {
                    response.rows.reverse();
                }
                return cb(error, response);
            });
        }
        else {
            return cb("nothing", undefined);
        }
    });
}

function updatePost(id, title, contents, tags, cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        var tagslist = tags.split(" ");
        for (var x = tagslist.length; x<5; x++){
            tagslist[x] = "";
        }
        contents = contents.replace(/\r/g, "<br><br>");
        client.query("UPDATE posts SET title=$1, contents=$2, tag1=$3, tag2=$4, tag3=$5, tag4=$6, tag5=$7, time=$8 WHERE postid=$9", [title, contents, tagslist[0], tagslist[1], tagslist[2], tagslist[3], tagslist[4], moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), id], (error) => {
            if (error) {
                console.error(error);
                return cb("error updating", false);
            }
            return cb(undefined, true);
        });
    });
}

function upvote(postid, userid, cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        client.query("SELECT * FROM posts WHERE postid=$1", [postid], (error, response) => {
            if (error) {
                console.error(error);
                return cb("error upvoting", false);
            }
            var newUpvoters = response.rows[0].upvotes + " " + userid;
            var newNum = response.rows[0].upvotes_int + 1;
            client.query("UPDATE posts SET upvotes=$1, upvotes_int=$2 WHERE postid=$3", [newUpvoters, newNum, postid], (err) => {
                if (err) {
                    console.error(err);
                    return cb("error upvoting", false);
                }
                return cb("good to go", true);
            });
        });
    });
}

function deletePost(id, cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        client.query("DELETE FROM posts WHERE postid=$1", [id], (error) => {
            if (error) {
                console.error(error);
                return cb("error deleting", false);
            }
            return cb(undefined, true);
        });
    });
}
module.exports = {
    addPost: addPost,
    getAllPosts: getAllPosts,
    getPost: getPost,
    getFeaturedPosts: getFeaturedPosts,
    getPostsByUser: getPostsByUser,
    search: search,
    updatePost: updatePost,
    upvote: upvote,
    deletePost: deletePost
}
