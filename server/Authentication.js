'use strict';
const bcrypt = require('bcrypt');

const invalidAuthMessage = 'Incorrect username or password.';


function Authentication(db, passport) {
    passport.serializeUser((user, cb) => {
        cb(null, user.username);
    });

    passport.deserializeUser((username, cb) =>
        db.oneOrNone('SELECT * FROM public.users WHERE username = $1', username)
            .then(data => cb(null, data))
            .catch(err => cb(err))
    );

    this.authenticate = function(username, password, cb) {
        return db.oneOrNone('SELECT * FROM public.users WHERE username = $1', username)
            .then(user => {
                if (user) {
                    return bcrypt.compare(password, user.password, function(err, res) {
                        if (err) {
                            return cb(err);
                        }

                        if (res === true) {
                            return cb(null, user);
                        } else {
                            return cb(null, false, { message: invalidAuthMessage });
                        }
                    });
                } else {
                    return cb(null, false, { message: invalidAuthMessage});
                }
            }).catch(err => cb(err));
    };

}

module.exports = Authentication;
