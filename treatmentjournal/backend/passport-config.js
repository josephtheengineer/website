const redis = require('redis')
let client = redis.createClient()

// Find the user to check password
exports.findByEmail = function(email, cb) {
	process.nextTick(function() {
		client.get('user:' + email, function(err, id) {
			console.log('dbId: ' + id)

			// find user in database here
			client.hgetall('user:' + id, function(err, obj) {
				console.log('Full obj: ' + obj)

				if (obj.email === email) {
					return cb(null, obj);
				}
				return cb(null, null);
			})
		})
	});
}

exports.findById = function(id, cb) {
	process.nextTick(function() {
		// find user in database here
		client.hgetall('user:'+id, function(err, obj){
			if (obj) {
				cb(null, obj);
			} else {
				cb(new Error('User ' + id + ' does not exist'));
			}
		})
	});
}

//function initialize(passport, getUserByEmail, getUserById) {
//	const authenticateUser = async (email, password, done) => {
//		const user = getUserByEmail(email)
//		if (user == null) {
//			return done(null, false, { message: 'No user with that email' })
//		}
//
//		try {
//			if (await bcrypt.compare(password, user.password)) {
//				return done(null, user)
//			} else {
//				return done(null, false, { message: 'Password incorrect' })
//		}
//		} catch (e) {
//			return done(e)
//		}
//	}
//
//	passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
//	passport.serializeUser((user, done) => done(null, user.id))
//	passport.deserializeUser((id, done) => {
//		return done(null, getUserById(id))
//	})
//}

//module.exports = initialize
