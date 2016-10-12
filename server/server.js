const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const process = require('process');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt'));
const Authentication = require('./Authentication');
const ensureLogin = require('connect-ensure-login');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const serverConfig = require('./config.json');

const env = process.env.NODE_ENV || 'development';
const secret = process.env.NODE_ENV === 'production' ? process.env.APP_SECRET : 'dev-secret';
if (!secret) {
    throw new Error('Unable to start in production mode with no APP_SECRET set!');
}


const forceSsl = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
};

if (env === 'production') {
    app.use(forceSsl);
}

function addBcryptType(err) {
    err.type = 'bcryptError';
    throw err;
}
const config = {
    poolSize: 20, // max number of clients in the pool
    host: process.env.PGHOST || 'localhost'
};
const db = pgp(config);

function setupAuth() {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieSession({
        secret: secret,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        secureProxy: env === 'production'
    }));
    const auth = new Authentication(db, passport);
    passport.use(new LocalStrategy(auth.authenticate));
    app.use(passport.initialize());
    app.use(passport.session());
}

setupAuth();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/../public/'));

app.set('forceSSLOptions', {
    enable301Redirects: true,
    trustXFPHeader: false,
    httpsPort: 443,
    sslRequiredMessage: 'SSL Required.'
});

app.get('/api/generatehash/:password', function(req, res) {
    Promise.try(function() {
        return bcrypt.hashAsync(req.params.password, 10).catch(addBcryptType);
    }).then(function(hash) {
        res.json({password: req.params.password, hahs: hash});
    });
});
app.get('/api/testpassword/:password/:hash', function(req, res) {
    Promise.try(function() {
        return bcrypt.compareAsync(req.params.password, req.params.hash).catch(addBcryptType);
    }).then(function(valid) {
        if(valid) {
            res.json({success: true});
            return;
        } else {
            res.json({success: false});
            return;
        }
    });
});
app.get('/api/questions', function(req, res) {
    db.manyOrNone('select * from questions')
        .then(questions => res.send(questions))
        .catch(err => res.status(500).send({success: false, error: err}));
});

app.post('/api/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login-failed.html'
}));

app.get('/api/user', function(req, res) {
    res.send({
        logged: req.user !== undefined,
        username: req.user ? req.user.username : null,
        role: req.user ? req.user.role : null
    });
});

// restricted endpoints below

const restricted = () => ensureLogin.ensureLoggedIn(serverConfig.login);

app.post('/api/logout', restricted(), function(req, res) {
    req.session = null;
    res.redirect('/');
});

app.get('/profile', restricted(), function(req, res) {
    res.send('yay, logged in!');
});

app.post('/api/questions', restricted(), function(req, res) {
    db.one('insert into questions(question, answer, creator) values ($1, $2, $3) returning id',
        [req.body.question, req.body.answer, req.user.username])
        .then((result) => {
            res.send(result);
        }).catch(err =>
            console.log('error happened', err) ||
            res.status(500).send(err)
        );
});

app.delete('/api/questions/:id', restricted(), function(req, res) {
    db.none('delete from questions where id = $1', req.params.id)
        .then(() => {
            res.send({success: true});
        }).catch(err =>
            console.log('error happened', err) ||
            res.status(500).send(err)
        );
});

app.put('/api/users/updatepassword', restricted(), function(req, res) {
    Promise.try(() => bcrypt.hashAsync(req.body.password, 2)
        .catch(addBcryptType))
        .then(hash => db.none('UPDATE users set password = $1 where username = $2', [hash, req.body.username]))
        .then(() => res.json({success: true})
    ).catch(err => res.status(500).json({success: false, error: err}));
});

// admin-only endpoints
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).send({success: false, message: 'Insufficient privileges'});
    }
};

app.get('/api/users', restricted(), adminOnly, function(req, res) {
    db.manyOrNone('select * from users')
        .then(users => res.send(users))
        .catch(err =>
            console.log('error happened', err) ||
            res.status(500).send(err)
        );
});

app.post('/api/users', restricted(), adminOnly, function(req, res) {
    const role = 'user';
    db.one('select count(username) from users where username = $1', req.body.username)
        .then(result => {
            console.log(result);
            if (result.count === '0') {
                Promise.try(() => bcrypt.hashAsync(req.body.password, 2)
                    .catch(addBcryptType))
                    .then(hash => db.none('INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', [req.body.username, hash, role]))
                    .then(() => res.json({success: true})
                ).catch(err => res.status(500).json({success: false, error: err}));
            } else {
                res.status(400).send({success: false, error: 'User with an identical name already exists'});
            }
        }).catch(err => {
            res.status(500).send({success: false, error: err});
        });
});

app.delete('/api/users/:username', restricted(), adminOnly, function(req, res) {

    // disallow deleting self
    if (req.user.username === req.params.username) {
        res.status(400).send({success: false, error: 'Unable to delete self'});
    } else {
        db.none('delete from users where username = $1', req.params.username)
            .then(() => {
                res.send({success: true});
            }).catch(err =>
                console.log('error happened', err) ||
                res.status(500).send(err)
            );
    }
});

app.post('/api/logout', restricted(), function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            res.send('Error when logging out.');
            return;
        }
        res.redirect('/');
    });
});

// end restricted endpoints

// no catchall for /api/ requests
app.get('/api/*', function(req, res) {
    console.log('API 404');
    res.status(404).send({message: 'API endpoint not found'});
});

// catchall endpoint for history.pushState support
app.get('*', function(request, response) {
    response.sendFile('./public/index.html', {root: __dirname + '/../'});
});

app.listen(process.env.PORT || 8080);
