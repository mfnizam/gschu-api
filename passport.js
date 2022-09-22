const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('./models/user');
const m = require('./module');
const secret = require('./secret');

module.exports = function (passport) {
	let opts = {};

	// jwtFromRequest: ExtractJwt.fromAuthHeader(),
	// secretOrKey: config.secret,
	// passReqToCallback: true

	opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
	opts.secretOrKey = secret.secretOrKey;
	opts.passReqToCallback = true;

	passport.use(new JwtStrategy(opts, async (req, jwt_payload, done) => {
		try {
			let user = await m.customModelFindByIdLean(User, jwt_payload._id);
			// if(!user) throw 'pengguna tidak terdaftar';
			return done(null, user);
		} catch (err) {
			return done(err, false);
		}
	}));
};
