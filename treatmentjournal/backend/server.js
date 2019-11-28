if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const express = require('express')
const expressHbs = require('express-handlebars')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const path = require('path')
const bodyParser = require('body-parser')
const redis = require('redis')

const Strategy = require('passport-local').Strategy

const port = 3000
const app = express()

// setup Redis
let client = redis.createClient()

client.on('connect', function(){
	console.log('Connected to Redis')
})

// view engine
app.engine('.hbs', expressHbs({defaultLayout:'main', extname:'.hbs'}))
app.set('view engine', '.hbs')

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
app.use(passport.initialize())
app.use(passport.session())

// passport setup what is happening?????
const initializePassport = require('./passport-config')

//initializePassport(
//	passport,
//
//	var dbId, dbEmail, dbPassword
//
//	client.hget('user:' + user.email, function(err, obj){
//		dbId = obj
//	})
//
//	//find user in database here
//	client.hgetall(dbId, function(err, obj){
//		dbEmail = obj.email
//		dbPassword = obj.password
//	})
//
//	email => user.email === db.email,
//	id => user.id === dbId
//)


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


// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy({ usernameField: 'email' },
function(email, password, cb) {
	initializePassport.findByEmail(email, function(err, user) {
		if (err) { return cb(err); }
		if (!user) { return cb(null, false); }
		if (!bcrypt.compare(user.password, password)) { return cb(null, false); }
		return cb(null, user);
	});
}));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
	cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
	initializePassport.findById(id, function (err, user) {
		if (err) { return cb(err); }
		cb(null, user);
	});
});





// allows the use of DELETE method in forms
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
	res.render('index', {
		name: req.user.email
	})
})



app.get('/login', (req, res) => {
	res.render('login')
})

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}))



app.get('/register', (req, res) => {
	res.render('register')
})

app.post('/register', async (req, res) => {
	try {
		const userId = Date.now().toString()
		const userString = user + userId
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

				client.hset(userString, [
					'id', userId,
					'name', name,
					'first_name', firstName,
					'email', email,
					'password', hashedPassword
				], function(err, reply) {
					if(error) {
						console.log(err)
					}
					console.log(reply)
				})

				break
			case 2:
				firstName = fullName.slice(0).join(' ')
				lastName = fullName.slice(-1).join(' ')


				client.hset(userString, [
					'id', userId,
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
				})

				break
			case 3:
				firstName = fullName.slice(0).join(' ')
				middleName = fullName.slice(1).join(' ')
				lastName = fullName.slice(-1).join(' ')

				client.hset(userString, [
					'id', userId,
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
				})

				break
			default:
				console.log('Error fullName.length invalid')
		}

		client.set('user:' + email, userId,
			function (err, reply) {
				if(err) {
					console.log(err)
				}
				console.log(reply)
		})


		res.redirect('/')

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

app.get('/dashboard', function(req, res, next){
	res.render('dashboard')
})

app.get('/notes', function(req, res, next){
	res.render('notes', {
		layout: 'notes',
		date: getHumanDate(),
		notes_template: req.query.template
	})
})

app.get('/notes/intake', function(req, res, next){
	res.render('notes/intake', {
		layout: 'notes',
		date: getHumanDate(),
		notes_template: req.query.template
	})
})


app.get('/notes/soap', function(req, res, next){
	res.render('notes/soap', {
		layout: 'notes',
		date: getHumanDate(),
		notes_template: req.query.template
	})
})

function getHumanDate(){
	var dateObj = new Date();
	var month = dateObj.getUTCMonth() + 1; //months from 1-12
	var day = dateObj.getUTCDate();
	var year = dateObj.getUTCFullYear();

	console.log(year + "-" + month + "-" + day)
	return year + "-" + month + "-" + day;
}

app.post('/notes', async (req, res) => {
	try {
		const date = encodeURIComponent(req.body.date)
		const template = encodeURIComponent(req.body.template)
		const title = encodeURIComponent(req.body.title)

		res.redirect('/notes/' + template + '?date='+date + '&template='+template + '&title='+title);

	} catch (e) {
		console.log(e)
		res.redirect('/')
	}
})

app.listen(port, function(){
	console.log('Server started on port '+port)
})
