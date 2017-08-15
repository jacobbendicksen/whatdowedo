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

//callback: user obj, message, success (1 = good to go, 2 = sign up again, 3 = login page)
function addUser(email, pw, confirmpw, name, twitter, cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return cb(undefined, "connection error", 2);
        }
        if (pw !== confirmpw) {
            console.log("bad password");
            return cb(undefined, "passwords don't match", 2);
        } else if (email === "") {
            console.log("bad email");
            return cb(undefined, "bad email", 2);
        } else if (pw === "") {
            console.log("bad password");
            return cb(undefined, "bad password", 2);
        } else if (name === "") {
            console.log("bad name");
            return cb(undefined, "bad name", 2);
        }
        email = email.toLowerCase();
        if (twitter) {
            if (twitter.substr(0,1) === "@") {
                twitter = twitter.substr(1);
            }
        }
        doesUserExist(email, (error, response) => {
            if (error){
                console.error(error);
                client.release();
                return cb(undefined, error, 2);
            }
            else if (response !== undefined) {
                client.release();
                return cb(response, "user already exists", 3);
            } else {
                client.query("INSERT INTO users (email, password, name, twitter, id, created) VALUES ($1, $2, $3, $4, $5, $6)", [email, sha1(pw), name, twitter, sha1(email), moment(new Date()).format("YYYY-MM-DD HH:mm:ss")], (error) => {
                    if (error) {
                        console.error(error);
                        client.release();
                        return cb(undefined, "insertion error", 2);
                    } else {
                        client.release();
                        getUserByID(sha1(email), (error, user) => {
                            if (error) {
                                return cb(undefined, "couldn't look up user", 3);
                            }
                            return cb(user, "user added successfully", 1);
                        });

                    }
                });
            }
        });
    });
}

function doesUserExist(email, cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        email = email.toLowerCase();
        client.query("SELECT * FROM users WHERE email=$1", [email], (error, response) => {
            if (error !== null) {
                console.error(error);
                client.release();
                return cb(error, undefined);
            }
            if (response.rows[0] !== undefined) {
                client.release();
                return cb(undefined, response.rows[0]);
            } else {
                client.release();
                return cb(undefined, undefined);
            }
        });
    });
}

function checkLogin(email, pw, cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        if (email === "" || pw === "") {
            return cb("bad email or password", undefined);
        }
        email = email.toLowerCase();
        client.query("SELECT * FROM users WHERE email=$1", [email], (error, response) => {
            if (error) {
                console.error(error);
                client.release();
                return cb(error, undefined);
            }
            if (response.rows[0] !== undefined && sha1(pw) === response.rows[0].password) {
                client.release();
                return cb(undefined, response.rows[0]);
            } else {
                client.release();
                return cb("bad combo", undefined);
            }
        });
    });
}

function getUserByID(id, cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        client.query("SELECT * FROM users WHERE id=$1", [id], (error, response) => {
            if (error) {
                console.error(error);
                client.release();
                return cb(error, undefined);
            } else {
                client.release();
                return cb(undefined, response.rows[0]);
            }
        });
    });
}

function updateUser(id, name, email, password, twitter, cb) {
    pool.connect((connectError, client) => {
        if (connectError) {
            console.error(connectError);
            client.release();
            return;
        }
        if (password === "" || password === undefined){
            client.query("UPDATE users SET name=$1, email =$2, twitter=$3 WHERE id=$4", [name, email, twitter, id], (error) => {
                if (error) {
                    console.error(error);
                    return cb("error updating", false);
                }
                return cb(undefined, true);
            });
        }
        else {
            client.query("UPDATE users SET name=$1, email =$2, password=$3, twitter=$4 WHERE id=$5", [name, email, sha1(password), twitter, id], (error) => {
                if (error) {
                    console.error(error);
                    return cb("error updating", false);
                }
                return cb(undefined, true);
            });
        }
    });
}

module.exports = {
    addUser: addUser,
    checkLogin: checkLogin,
    getUserByID: getUserByID,
    updateUser: updateUser
}
