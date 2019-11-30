const app = express.Router()

app.get('/', checkAuthenticated, (req, res) => {
	res.render('dashboard', {
		title: 'Notes!',
		name: req.user.first_name
	})
})

app.get('/notes', checkAuthenticated, function(req, res, next){
	res.render('notes', {
		title: 'New - Notes!',
		date: getHumanDate(),
		notes_template: req.query.template
	})
})

app.get('/notes/intake', checkAuthenticated, function(req, res, next){
	res.render('notes/intake', {
		title: 'Intake Form - Notes!',
		date: getHumanDate(),
		notes_template: req.query.template
	})
})


app.get('/notes/soap', function(req, res, next){
	res.render('notes/soap', {
		title: 'SOAP - Notes!',
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

module.exports = app
