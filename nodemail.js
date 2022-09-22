let nodeMailer = require('nodemailer');

let transporter = nodeMailer.createTransport({
	name: 'Asna Tsuroyya',
	host: 'asnatsuroyya.com',
	port: 465,
	secure: true,
	auth: {
		user: 'noreply@asnatsuroyya.com',
		pass: '(1asnatsuroyyanoreply1)'
	}
});
transporter.verify(function (error, success) {
	if (error) { console.log(error) } else { console.log('Server is ready to take our messages', success); }
});

module.exports = transporter;