const express = require('express'),
	// esm = require('express-status-monitor'),
	path = require('path'),
	cors = require('cors'),
	passport = require('passport'),
	mongoose = require('mongoose'),
	secret = require('./secret');

const m = require('./module')

process.env.TZ = 'Etc/Universal'; // UTC +00:00
console.log(new Date())

const app = express();
// app.use(esm())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.options('*', cors());
app.use(passport.initialize());
app.use(passport.session());
require('./passport')(passport);

// ========= Setup Nodemailer ======
require('./nodemail')

// ========= MongoDB Setup ==========
mongoose.connect(
	secret.databaseUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	keepAlive: true,
});

mongoose.connection.on('connected', () => { console.log('database connected'); });
mongoose.connection.on('error', (err) => { console.log('database error ' + err); });

// API Middleware
let isadmin = (req, res, next) => req.user?.admin ? next() : res.status(401).json('Access Denied');
let isatasan = (req, res, next) => req.user?.atasan ? next() : res.status(401).json('Access Denied');
let ispenyetuju = (req, res, next) => req.user?.penyetuju ? next() : res.status(401).json('Access Denied');

// API
app.use('/api', require('./routes/api'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/akun', passport.authenticate('jwt', { session: false }), require('./routes/akun'));
app.use('/api/admin', passport.authenticate('jwt', { session: false }), isadmin, require('./routes/admin'));

app.use('/api/atasan', passport.authenticate('jwt', { session: false }), isatasan, require('./routes/public/atasan'));
app.use('/api/penyetuju', passport.authenticate('jwt', { session: false }), ispenyetuju, require('./routes/public/penyetuju'));
app.use('/api/public', passport.authenticate('jwt', { session: false }), require('./routes/public/public'));

app.use('/api/**', (req, res) => { res.status(404).json('not found') })

// Frondend
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use('/', (req, res) => { res.send('welcome to GSCHU') })
// app.use('/', (req, res) => { res.sendFile(path.join(__dirname, 'public/index.html')); });

app.listen(process.env.PORT || 8080, function () {
	console.log('App listening at port 8080');
});