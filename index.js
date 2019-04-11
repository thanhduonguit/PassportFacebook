const express = require('express')
// const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('passport')
const passportfb = require('passport-facebook').Strategy
// const LocalStrategy = require('passport-local').Strategy
// const fs = require('fs')
const db = require('./db.js')
const app = express()
const port = 3000;

app.set('views', './views')
app.set('view engine', 'ejs')

// app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: "mysecret"
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => res.send('wellcome to my website'))

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/auth/fb', passport.authenticate('facebook', { scope: ['email'] }))

app.get('/auth/fb/cb', passport.authenticate('facebook', {
    failureRedirect: '/', successRedirect: '/'
}))

passport.use(new passportfb (
    {
        clientID: "303750820318842",
        clientSecret: "e8d7299ca3539e3c18bbf1d17df5fd8e",
        callbackURL: "http://localhost:3000/auth/fb/cb",
        profileFields: ['email', 'gender', 'locale', 'displayName']
    },
    ( accessToken, refreshToken, profile, done ) => {
        console.log(profile)
        
        db.findOne({ id: profile._json.id}, (err, user) => {
            if (err) return done(err)
            if (user) return done(null, user)
            const newUser = new db({
                id: profile._json.id,
                name: profile._json.name,
                email: profile._json.email
            })
            newUser.save( (err) => {
                return done(null, newUser)
            })
        })
    }
))

passport.serializeUser( (user, done) => {
    done(null, user.id)
})

passport.deserializeUser( (id, done) => {
    db.findOne( { id }, (err, user) => {
        done(null, user)
    })                                       //id dau tien: id trong database
})

app.listen(port, () => console.log(`Server is starting on port ${port}`));