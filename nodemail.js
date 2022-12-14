let nodeMailer = require('nodemailer');

let transporter = nodeMailer.createTransport({
	name: 'GSCHU Pertamina Zona 1',
	host: 'gschuz1.com',
	port: 465,
	secure: true,
	auth: {
		user: 'noreply@gschuz1.com',
		pass: '(gschuz1)'
	}
});
transporter.verify(function (error, success) {
	if (error) { console.log(error) } else { console.log('Server is ready to take our messages', success); }
});

module.exports = transporter;