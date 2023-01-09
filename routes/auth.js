const router = require('express').Router(),
	jwt = require('jsonwebtoken'),
	passport = require('passport'),
	secret = require('../secret'),
	transporter = require('../nodemail');

// TODO
// - penerapan accessToken dan refreshToken
// - rubah jwt sign secret (accessToken dan refreshToken secret harus berbeda)
// - terapkan Refresh Token Rotation

//moduls
const m = require('../module');

// models
const Otp = require('../models/otp');
const User = require('../models/user');

router.post('/daftar', async (req, res) => {
	try {
		const namaLengkap = req.body.namaLengkap,
			email = req.body.email,
			sandi = req.body.sandi;

		if (!namaLengkap || !email || !sandi) return res.status(400).json({ message: 'Mohon Isikan Nama Lengkap, Email dan Sandi' });

		let user = await m.customModelFindOneByQueryLean(User, { email });

		// if(user) return sendError(res, 400, { field: 'email', msg: 'Email sudah terdaftar' });
		if (user) throw { field: 'email', msg: 'Email/Sandi sudah terdaftar' }


		user = await User.create({
			namaLengkap: namaLengkap,
			inisial: namaLengkap.match(/(^\S\S?|\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase(),
			email: email,
			sandi: await m.generatePassHash(sandi)
		})

		user = user.toJSON();
		// delete user.sandi;
		// delete user.__v;
		const accessToken = jwt.sign(user, secret.secretOrKey, {
			expiresIn: 60 * 60 * 24 * 30
		});
		return res.json({ success: true, accessToken: accessToken });
	} catch (err) {
		return sendError(res, 500, err);
	}
})

router.post('/masuk', async (req, res) => {
	try {
		const email = req.body.email,
			sandi = req.body.sandi;

		if (!email || !sandi) return res.status(401).json({ message: 'Mohon Isikan Email dan Sandi' });

		let user = await m.customModelFindOneByQuerySelectOptionLean(User, { email: email }, '+sandi', null);

		if (!user) throw { code: 422, field: 'email', msg: 'Email/Sandi tidak terdaftar' }
		// if(!user) return sendError(res, 401, { field: 'email', msg: 'Email/Sandi tidak terdaftar' });


		let isMatch = await m.comparePassHash(sandi, user.sandi);
		if (!isMatch) throw { code: 422, field: 'sandi', msg: 'Email/Sandi tidak terdaftar' }
		// if(!isMatch) return sendError(res, 401, { field: 'sandi', msg: 'Email/Sandi tidak terdaftar' });

		// delete user.sandi;
		// delete user.__v;
		const accessToken = jwt.sign(user, secret.secretOrKey, {
			expiresIn: 60 * 60 * 24 * 30
		});
		return res.json({ success: true, accessToken: accessToken, user });

	} catch (err) {
		return sendError(res, (err.code || 500), err);
	}
})

router.get('/refresh-access-token', passport.authenticate('jwt', { session: false }), async (req, res) => {
	let user = await m.customModelFindByIdLean(User, req.user._id);
	// delete user.sandi;
	// delete user.__v;
	const accessToken = jwt.sign(user, secret.secretOrKey, {
		expiresIn: 60 * 60 * 24 * 30
	});
	return res.json({ success: true, accessToken: accessToken });
})

// TODO: kirimkan kode ke email dengan library NODEMAIL
router.post('/lupasandi', async (req, res) => {
	try {
		let cekemail = await m.customModelFindOneByQueryLean(User, { email: req.body.email });
		if(!cekemail) throw { field: 'email', msg: 'Email tidak terdaftar' }

		// delete semua otp pada email, karna hanya berlaku 1 otp pada setiap email.
		await Otp.deleteMany({ email: req.body.email })
		let email = req.body.email;
		let kode = await m.generateRandonNum(Otp, 'kode', { kadaluarsa: { $gte: new Date() }, status: { $nin: [0, 3] }}, 1111, 9999);
		let otp = await Otp.create({
			email,
			kode,
			keperluan: 0,
			kadaluarsa: new Date(new Date().getTime() + (15*60000))
		})

		let emailBody = `
			Hai ${email},
			<br>
			<br>
			Kami menerima permintaan kode sekali pakai yang akan digunakan dengan akun GSCHU Anda.
			<br>
			<br>
			Kode sekali pakai Anda adalah: <h2>${kode}</h2>
			<br>
			<br>
			Jika Anda tidak meminta kode ini, Anda dengan aman dapat mengabaikan email ini. Orang lain mungkin telah salah dalam mengetik alamat email.
			<br>
			<br>
			<br>
			Terima kasih,
			<br>
			Tim GSCHU Zona 1
		`

		let emailSend = await sendEmail(email, emailBody, 'Reset Password');
		
		return res.json( { success: otp.kode? true : false, kadaluarsa: otp.kadaluarsa, emailRes: emailSend } );
	} catch (err) {
		console.log(err)
		return sendError(res, (err.code || 500), err);
	}
})
router.get('/lupasandikadaluarsa', async (req, res) => {
	try {
		let otp = await m.customModelFindOneByQuery(Otp, { email: req.query.email, kadaluarsa: { $gte: new Date() }, keperluan: 0 })
		return res.json({ email: otp?.email? true: false, kadaluarsa: otp?.kadaluarsa })
	} catch (err) {
		return sendError(res, (err.code || 500), err);
	}
})
router.post('/lupasandiverifikasikode', async (req, res) => {
	try {
		let otp = await m.customModelUpdateByQueryLean(Otp, { 
			email: req.body.email, 
			kode: Number(req.body.kode), 
			kadaluarsa: { $gte: new Date() }, 
			keperluan: 0 
		}, { status: 1, kadaluarsa: new Date() })
		if(!otp) throw { msg: 'Kode Verifikasi Tidak Valid', field: 'kode', code: 422 }
		return res.json({ success: otp?.status == 1 })
	} catch (err) {
		return sendError(res, (err.code || 500), err);
	}
})
router.get('/lupasandikodeterverifikasi', async (req, res) => {
	try {
		let otp = await m.customModelFindOneByQuery(Otp, { 
			email: req.query.email, 
			status: 1,
			keperluan: 0
		})
		return res.json({ email: otp?.email? true: false })
	} catch (err) {
		return sendError(res, (err.code || 500), err);
	}
})
router.post('/sandibaru', async (req, res) => {
	try {
		let otp = await m.customModelFindOneByQueryLean(Otp, { email: req.body.email, status: 1, keperluan: 0 })
		if(!otp) throw { msg: 'Ubah sandi tidak valid. Ulangi proses ubah sandi', field: 'kode', code: 422, show: 'alert' }

		let user = await m.customModelUpdateByQueryLean(User, { email: req.body.email }, {
			sandi: await m.generatePassHash(req.body.sandi)
		})
		return res.json({ success: true });
	} catch (err) {
		return sendError(res, (err.code || 500), err);
	}
})

// format err: { msg: String, field: String }
function sendError(res, code, err = {}) {
	res.statusMessage = err.msg || 'Terjadi kesalahan, coba lagi.';
	res.statusText = err.msg || 'Terjadi kesalahan, coba lagi.';
	return res.status(code).json(err);
}

function sendEmail(to, text, subject){
	return new Promise((resolve, reject) => {
		let mailOptions = {
			from: '"GSCHU Pertamina Zona 1" <noreply@gschuz1.com>', // sender address
			to, //req.body.to, // list of receivers
			subject, //req.body.subject, // Subject line
			// text, //req.body.body, // plain text body
			html: text // html body
		};

		transporter.sendMail(mailOptions, (error, info) => {
			console.log(error, info)
			if (error) return reject(error)
			return resolve(info)
		});
	})


}

module.exports = router;