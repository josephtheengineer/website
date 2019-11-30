const app = express.Router()

app.get('/', checkAuthenticated, function(req, res, next){
	res.render('notes', {
		title: 'New - Notes!',
		date: getHumanDate(),
		notes_template: req.query.template
	})
})

app.get('/intake', checkAuthenticated, function(req, res, next){
	res.render('notes/intake', {
		title: 'Intake Form - Notes!',
		date: getHumanDate(),
		notes_template: req.query.template
	})
})


app.get('/soap', function(req, res, next){
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

app.post('/', async (req, res) => {
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

module.exports = app
