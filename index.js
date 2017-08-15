"use strict";

var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');

var usersModel = require('./models/usersModel.js');
var postsModel = require('./models/postsModel.js');

var app = express();

app.engine('handlebars', exphbs({
    defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(session({
    secret: 'jfioewnaoiweanofwaon',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: 'auto'
    },
}));

app.use((req, res, next) => {
    if (req.session.userId) {
        usersModel.getUserByID(req.session.userId, (error, response) => {
            if (error) {
                console.error(error);
            } else {
                res.locals.currentUser = response;
            }
            next();
        });
    } else {
        next();
    }
});

function isLoggedIn(req, res, next) {
    if (res.locals.currentUser) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', (req, res) => {
    postsModel.getFeaturedPosts((error, response) => {
        if (error) {
            res.render('home', {
                user: res.locals.currentUser
            });
        } else {
            res.render('home', {
                posts: response.rows,
                user: res.locals.currentUser
            });
        }
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        user: res.locals.currentUser
    });
});

app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    usersModel.checkLogin(email, password, (error, response) => {
        if (error === undefined && response !== undefined) {
            req.session.userId = response.id;
            res.locals.currentUser = response;
            res.redirect('/');
        } else {
            res.render('login', {
                message: "Login failed - try again?"
            });
        }
    });
});

app.get('/signup', (req, res) => {
    var email = req.query.email;
    res.render('signup', {
        email: email
    });
});

app.post('/signup', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;
    var name = req.body.name;
    var twitter = req.body.twitter;
    usersModel.addUser(email, password, passwordConfirm, name, twitter, (user, message, success) => {
        if (success === 3) {
            res.redirect('/login');
        } else if (success === 2) {
            res.render('signup', {
                message: "Signup failed - try again?",
                user: res.locals.currentUser
            });
        } else {
            res.locals.currentUser = user;
            req.session.userId = user.id;
            console.log("Signed up " + name + ": " + email);
            res.redirect('/');
        }
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        user: res.locals.currentUser
    });
});

app.get('/community', (req, res) => {
    postsModel.getAllPosts((error, response) => {
        if (error) {
            res.render('/community', {
                message: "Couldn't load posts :(",
                user: res.locals.currentUser
            });
        } else {
            res.render('community', {
                posts: response.rows,
                user: res.locals.currentUser
            });
        }
    });
});

app.get('/post/:id', (req, res) => {
    var id = req.params.id;
    postsModel.getPost(id, (error, response) => {
        if (error) {
            res.redirect('/');
        } else {
            if (res.locals.currentUser !== undefined && response.rows[0].upvotes !== null && response.rows[0].upvotes.includes(res.locals.currentUser.id)) {
                response.rows[0].upvoted = true;
            }
            if (res.locals.currentUser !== undefined && res.locals.currentUser.id === response.rows[0].authorid) {
                res.render('post', {
                    post: response.rows[0],
                    user: res.locals.currentUser,
                    mine: true,
                    id: id
                });
            } else {
                res.render('post', {
                    post: response.rows[0],
                    user: res.locals.currentUser
                });
            }
        }
    });
});

app.get('/user/:id', (req, res) => {
    var id = req.params.id;
    postsModel.getPostsByUser(id, (error, posts) => {
        if (error) {
            res.redirect('/');
        } else {
            usersModel.getUserByID(id, (err, user) => {
                if (err || user === undefined) {
                    res.redirect('/');
                } else {
                    if (res.locals.currentUser !== undefined && user.id === res.locals.currentUser.id) {
                        res.render('user', {
                            me: true,
                            profile: user,
                            posts: posts.rows,
                            user: res.locals.currentUser
                        });
                    } else {
                        res.render('user', {
                            profile: user,
                            posts: posts.rows,
                            user: res.locals.currentUser
                        });
                    }
                }
            });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/search', (req, res) => {
    res.render('search', {
        user: res.locals.currentUser
    });
});

app.post('/search', (req, res) => {
    var thing = req.body.thing;
    postsModel.search(thing, (error, response) => {
        if (error === "nothing") {
            res.render('search', {
                user: res.locals.currentUser
            });
        } else if (error) {
            res.render('search', {
                user: res.locals.currentUser,
                message: "Search failed - try again?"
            });
        } else {
            res.render('search', {
                user: res.locals.currentUser,
                posts: response.rows
            });
        }
    });
});

app.get('/tag/:thing', (req, res) => {
    var thing = req.params.thing;
    postsModel.search(thing, (error, response) => {
        if (error) {
            res.render('search', {
                user: res.locals.currentUser,
                message: "Search failed - try again?"
            });
        } else {
            res.render('search', {
                user: res.locals.currentUser,
                posts: response.rows
            });
        }
    });
});

app.use(isLoggedIn);

app.get('/newpost', (req, res) => {
    res.render('newpost', {
        user: res.locals.currentUser
    });
});

app.post('/newpost', (req, res) => {
    var title = req.body.title;
    var contents = req.body.contents;
    var tags = req.body.tags;
    var author = res.locals.currentUser.id;
    var anonymous = req.body.anonymous;


        console.log(req.body);

        console.log(anonymous);

    if (anonymous === 'on') {
        anonymous = true;
    } else {
        anonymous = false;
    }

    var tagslist = tags.split(" ");

    if (title === "" && contents === "") {
        res.render('newpost', {
            message: "Add some content, then post :)",
            user: res.locals.currentUser
        });
        return;
    } else if (title === "") {
        res.render('newpost', {
            message: "Your post needs a title :)",
            contents: contents,
            user: res.locals.currentUser
        });
        return;
    } else if (contents === "") {
        res.render('newpost', {
            message: "Your post needs some content :)",
            title: title,
            user: res.locals.currentUser
        });
        return;
    }

    postsModel.addPost(title, contents, author, false, tagslist, anonymous, (message, success) => {
        if (success) {
            postsModel.getAllPosts((error, response) => {
                if (error) {
                    res.redirect('/');
                } else {
                    res.render('community', {
                        posts: response.rows,
                        user: res.locals.currentUser
                    });
                }
            });
        } else {
            res.render("newpost", {
                message: "Posting failed - try again?",
                user: res.locals.currentUser
            });
        }
    });
});

app.get('/update/post/:id', (req, res) => {
    var id = req.params.id;

    postsModel.getPost(id, (error, response) => {
        if (error) {
            res.redirect('/post/' + id);
        } else {
            var post = response.rows[0];
            if (post.authorid !== res.locals.currentUser.id) {
                res.redirect('/post/' + id);
                return;
            }
            var tags = post.tag1 + ' ' + post.tag2 + ' ' + post.tag3 + ' ' + post.tag4 + ' ' + post.tag5;
            tags = tags.trim();
            post.contents = post.contents.replace(/<br><br>/g, "\r");

            res.render('updatepost', {
                title: post.title,
                contents: post.contents,
                tags: tags,
                id: id,
                user: res.locals.currentUser,
                anonymous: post.anonymous
            });
        }
    });
});

app.post('/update/post/:id', (req, res) => {
    var id = req.params.id;
    var title = req.body.title;
    var contents = req.body.contents;
    var tags = req.body.tags;
    var anonymous = req.body.anonymous;

    console.log(req.body);

    console.log(anonymous);

    if (anonymous === 'on') {
        anonymous = true;
    } else {
        anonymous = false;
    }
    postsModel.updatePost(id, title, contents, tags, anonymous, (message, success) => {
        res.redirect('/post/' + id);
    });
});

app.get('/delete/post/:id', (req, res) => { // GET request is sloppy here
    var id = req.params.id;

    postsModel.deletePost(id, (message, success) => {
        res.redirect('/community');
    });
});

app.get('/update/user/', (req, res) => {
    var id = res.locals.currentUser.id;

    usersModel.getUserByID(id, (error, response) => {
        if (error) {
            res.redirect('/user/' + id);
        } else {
            res.render('updateuser', {
                name: res.locals.currentUser.name,
                email: res.locals.currentUser.email,
                twitter: res.locals.currentUser.twitter,
                id: id,
                user: res.locals.currentUser
            });
        }
    });
});

app.post('/update/user', (req, res) => {
    var id = res.locals.currentUser.id;
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;
    var twitter = req.body.twitter;

    if (password !== passwordConfirm) {
        res.render('updateuser', {
            name: res.locals.currentUser.name,
            email: res.locals.currentUser.email,
            twitter: res.locals.currentUser.twitter,
            id: id,
            message: "Passwords didn't match - try again?",
            user: res.locals.currentUser
        });
        return;
    } else if (email === "") {
        res.render('updateuser', {
            name: res.locals.currentUser.name,
            email: res.locals.currentUser.email,
            twitter: res.locals.currentUser.twitter,
            id: id,
            message: "Email can't be blank - try again?",
            user: res.locals.currentUser
        });
        return;
    } else if (name === "") {
        res.render('updateuser', {
            name: res.locals.currentUser.name,
            email: res.locals.currentUser.email,
            twitter: res.locals.currentUser.twitter,
            id: id,
            message: "Name can't be blank - try again?",
            user: res.locals.currentUser
        });
        return;
    }

    usersModel.updateUser(id, name, email, password, twitter, (message, success) => {
        res.redirect('/user/' + id);
        //needs error handling
    });
});

app.get('/post/:id/upvote', (req, res) => {
    var postid = req.params.id;
    postsModel.upvote(postid, res.locals.currentUser.id, (message, good) => {
        res.redirect('/post/' + postid);
    });
});

var port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log('server running on port ' + port);
});
