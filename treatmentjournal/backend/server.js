if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const express = require('express')
const exphbs = require('express-handlebars')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const path = require('path')
const bodyParser = require('body-parser')
const redis = require('redis')

const port = 3000
const app = express()

// setup Redis
let client = redis.createClient()

client.on('connect', function(){
	console.log('Connected to Redis')
})

// view engine
app.engine('handlebars', exphbs({defaultLayout:'main'}))
app.set('view engine', 'handlebars')

// body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

//app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}))

// passport setup
const initializePassport = require('./passport-config')
initializePassport(
	passport,

	var dbId, dbEmail, dbPassword

	client.hget('user:' + user.email, function(err, obj){
		dbId = obj
	})

	//find user in database here
	client.hgetall(dbId, function(err, obj){
		dbEmail = obj.email
		dbPassword = obj.password
	})

	email => user.email === db.email,
	id => user.id === dbId)
)

app.use(passport.initialize())
app.use(passport.session())

// allows the use of DELETE method in forms
app.use(methodOverride('_method'))

//passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
//	function(email, password, done) {
//
//		var dbId, dbEmail, dbPassword
//
//		client.hget('user:' + email, function(err, obj){
//			dbId = obj
//		})
//
//		//find user in database here
//		client.hgetall(id, function(err, obj){
//			//if(!obj){
//			//	res.render('searchusers', {
//			//	error: 'user does not exist'
//			//	})
//			//} else {
//			dbEmail = obj.email
//			dbPassword = obj.password
//		})
//		var user = {id: 1, email:'test', password:'pass'};
//		return done(null, user);
//	}
//));

app.get('/', checkAuthenticated, (req, res) => {
	res.render('index', { name: req.user.name })
})



app.get('/login', checkNotAuthenticated, (req, res) => {
	res.render('login')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}))



app.get('/register', checkNotAuthenticated, (req, res) => {
	res.render('register')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
	try {
		const userId = 'user:' + Date.now().toString()
		const name = req.body.name
		const email = req.body.email
		const hashedPassword = await bcrypt.hash(req.body.password, 10)

		const fullName = req.body.full_name.split(' ')
		var firstName = ""
		var middleName = ""
		var lastName = ""

		switch(fullName.length) {
			case 1:
				firstName = fullName

				client.hset(userId, [
					'name', name,
					'first_name', firstName,
					'email', email,
					'password', hashedPassword
				], function(err, reply) {
					if(error) {
						console.log(err)
					}
					console.log(reply)
					res.redirect('/')
				})

				break
			case 2:
				firstName = fullName.slice(0).join(' ')
				lastName = fullName.slice(-1).join(' ')


				client.hset(userId, [
					'name', name,
					'first_name', firstName,
					'last_name', lastName,
					'email', email,
					'password', hashedPassword
				], function(err, reply) {
					if(err) {
						console.log(err)
					}
					console.log(reply)
					res.redirect('/')
				})

				break
			case 3:
				firstName = fullName.slice(0).join(' ')
				middleName = fullName.slice(1).join(' ')
				lastName = fullName.slice(-1).join(' ')

				client.hset(userId, [
					'name', name,
					'first_name', firstName,
					'middle_name', middleName,
					'last_name', lastName,
					'email', email,
					'password', hashedPassword
				], function(err, reply) {
					if(err) {
						console.log(err)
					}
					console.log(reply)
					res.redirect('/')
				})

				break
			default:
				console.log('Error fullName.length invalid')
		}

		client.hset('user:' + email, userId,
			function (err, reply) {
				if(err) {
					console.log(err)
				}
				console.log(reply)
				res.redirect('/')
		})

	} catch (e) {
		console.log(e)
		res.redirect('/register')
	}
})

app.delete('/logout', (req, res) => {
	req.logOut()
	res.redirect('/login')
})

app.get('/searchusers', function(req, res, next){
	res.render('searchusers')
})

app.post('/searchusers', function(req, res, next){
	let id = req.body.id

	client.hgetall(id, function(err, obj){
		if(!obj){
			res.render('searchusers', {
				error: 'user does not exist'
			})
		} else {
			obj.id = id
			res.render('searchusers', {
				user: obj
			})
		}
	})
})

function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next()
	}

	res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/')
	}
	next()
}

app.listen(port, function(){
	console.log('Server started on port '+port)
})
