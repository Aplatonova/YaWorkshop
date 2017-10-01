const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
app.use(bodyParser.json()); 

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.send(`<!doctype html>
	<html>
		<head>
			<link rel="stylesheet" href="/style.css">
		</head>
		<body>
			<h1>Hello Smolny!</h1>
		</body>
	</html>`);
});

app.get('/error', (req, res) => {
	throw Error('Oops!');
});

app.get('/transfer', (req, res) => {
	const {amount, from, to} = req.query;
	res.json({
		result: 'success',
		amount,
		from,
		to
	});
});

//Получение всех карт из хранилища - GET /cards - должен возвращать список карт из хранилища

app.get('/cards', (req, res) =>
{
	fs.readFile('./source/cards.json', (err, data) => {
		if (err) throw err;
		const cardsJSon = JSON.parse(data);
		
		res.send(cardsJSon.map((item)=> item.cardNumber));
	  });

});

app.del('/cards/\\d+', (req, res) =>
{
	fs.readFile('./source/cards.json', (err, data) => {
		if (err) throw err;
		const cardsJSon = JSON.parse(data);
		let arrUrl = req.url.split('/');
		let index = Number.parseInt(arrUrl[2], 10);
		if(index<cardsJSon.length)
		{
			cardsJSon.splice(index,1);
		fs.writeFile('./source/cards.json', JSON.stringify(cardsJSon), (err) => {
			if (err)
			{ //throw err;
			res.sendStatus(404);
		}
		else res.send(200);
		  });
		}
		else res.send(404);

});
});
app.post('/cards', (req, res) => {
	fs.readFile('./source/cards.json', (err, data) => {
		if (err) throw err;
		const cardsJSon = JSON.parse(data);
		let addCard = req.body;
		if (addCard.cardNumber && addCard.balance) {
			let fun = IsValid(addCard);
			if (fun == true) {

				cardsJSon.push(addCard);

				fs.writeFile('./source/cards.json', JSON.stringify(cardsJSon), (err) => {
					if (err) { //throw err;
						res.sendStatus(400);
					}
					else res.send(addCard);
				});
			}
			else res.sendStatus(400);
		}
		else res.sendStatus(400);
	});
});



app.listen(3000, () => {
	console.log('YM Node School App listening on port 3000!');
});

function IsValid(card) {
	let value = card.cardNumber;
	// accept only digits, dashes or spaces
	if (/[^0-9-\s]+/.test(value)) return false;

	// The Luhn Algorithm. It's so pretty.
	var nCheck = 0,
		nDigit = 0,
		bEven = false;
	value = value.replace(/\D/g, "");

	for (var n = value.length - 1; n >= 0; n--) {
		var cDigit = value.charAt(n),
			nDigit = parseInt(cDigit, 10);

		if (bEven) {
			if ((nDigit *= 2) > 9) nDigit -= 9;
		}
		nCheck += nDigit;
		bEven = !bEven;
	}
	return (nCheck % 10) == 0;
}