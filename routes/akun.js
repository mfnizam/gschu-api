const router = require('express').Router(),
	jwt = require('jsonwebtoken'),
	secret = require('../secret'),
	ObjectId = require('mongoose').Types.ObjectId,
	mime = require('mime'),
	fs = require("fs"),
	axios = require('axios').default,
  FormData = require('form-data'),
	multer = require('multer')/* ,
	upload = multer({
		storage: multer.diskStorage({
			destination: function (r, f, callback) {
				const path = 'public/foto/'
				fs.mkdirSync(path, { recursive: true })
				return callback(null, path)
				// callback(null, 'public/foto/');
			},
			filename: function (req, file, callback) {
				callback(null, Date.now() + '.' + mime.getExtension(file.mimetype));
			}
		})
	}) */;

const otherServerUrl = "https://gschu.asnatsuroyya.com/";

//moduls
const m = require('../module');

// models
const
	User = require('../models/user'),
	Fungsi = require('../models/fungsi');

router.get('/akun', async (req, res) => {
	try {
		let user = await m.customModelFindByIdLean(User, req.user._id);
		const accessToken = jwt.sign(user, secret.secretOrKey, {
			expiresIn: 60 * 60 * 24 * 30
		});
		return res.json({ success: true, accessToken: accessToken });
	} catch (err) {
		return sendError(res, 500, { msg: 'Terjadi kesalahan. Coba beberapa saat lagi.' });
	}
})

router.post('/ubah', async (req, res) => {
	try {
		let user = await m.customModelUpdateByIdLean(User, req.user._id, {
			...req.body, 
			...req.user.namaLengkap != req.body.namaLengkap? { 
				inisial: req.body.namaLengkap?.match(/(^\S\S?|\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase()
			} : {}
		}, {});

		const accessToken = jwt.sign(user, secret.secretOrKey, {
			expiresIn: 60 * 60 * 24 * 30
		});
		return res.json({ success: true, accessToken: accessToken });
	} catch (err) {
		return sendError(res, 500, { msg: 'Terjadi kesalahan. Coba beberapa saat lagi.' });
	}
})

router.post('/ubah/foto', /* upload.single('file'), */ multer().single('file'), async (req, res) => {
	try {
		if (!req.file) throw { msg: 'Gagal Upload Foto', field: 'foto' }

		let upload;
		let destination = 'images/foto';
		let form = new FormData();
		form.append('file', req.file.buffer, {
			filename: req.file.originalname,
			contentType: req.file.mimetype
		});
		form.append('destination', destination);

		upload = await axios.post(otherServerUrl + 'upload.php', form, {
			headers: form.getHeaders()
		});

		if (!upload.data?.success) throw { msg: 'Gagal upload gambar permintaan', field: 'file' }

		let user = await m.customModelUpdateByIdLean(User, req.user._id, {
			foto: otherServerUrl + upload.data?.path
		}, {});

		// delete user.sandi; sudah di exclude di schema
		// delete user.__v;
		const accessToken = jwt.sign(user, secret.secretOrKey, {
			expiresIn: 60 * 60 * 24 * 30
		});
		return res.json({ success: true, accessToken: accessToken });
	} catch (err) {
		return sendError(res, 500, err);
	}
})

/*  TODO
	- saat ini tokenNotif berisi array dari sting token notifikasi, ini bertujuan agar akun dapat login lebih dari 1 device dan semuanya mendapatkan notifikasi
	- tapi ketika AUTH menerapkan accessToken, refreshToken dan Refresh Token Rotation maka tidak memungkinkan akun login lebih dari 1 device
 */
router.post('/tokennotif/simpan', async (req, res) => { // firebase registration token
	try {
		let cekTokenNotif = await m.customModelFindOneByQueryLean(User, { _id: req.user._id, tokenNotif: req.body.tokenNotif })
		if (!cekTokenNotif) {
			await m.customModelUpdateByIdLean(User, req.user._id, { $push: { tokenNotif: req.body.tokenNotif } })
			return res.json(true);

			// let user = await m.customModelUpdateByIdPopulateLean(User, req.user._id, { $push: { tokenNotif: req.body.tokenNotif }}, {}, 'penumpang')
			// delete user.sandi;
			// delete user.__v;
			// const accessToken = jwt.sign(user, secret.secretOrKey, {
			// 	expiresIn: 60 * 60 * 24 * 30
			// });
			// return res.json({ success: true, accessToken: accessToken });
		} else {
			return res.json({ success: false, msg: 'Token sudah terdaftar' })
		}
	} catch (err) {
		return sendError(res, 500, { msg: 'Terjadi kesalahan. Coba beberapa saat lagi.' });
	}
})
router.post('/tokennotif/hapus', async (req, res) => { // firebase registration token
	try {
		await m.customModelUpdateByIdLean(User, req.user._id, { $pullAll: { tokenNotif: [req.body.tokenNotif] } })
		return res.json(true);
	} catch (err) {
		return sendError(res, 500, { msg: 'Terjadi kesalahan. Coba beberapa saat lagi.' });
	}
})

router.get('/', (req, res) => {
	res.json('incorrect check point')
})

// format err: { msg: String, field: String }
function sendError(res, code, err = {}) {
	res.statusMessage = err.msg || 'Terjadi kesalahan, coba lagi.';
	res.statusText = err.msg || 'Terjadi kesalahan, coba lagi.';
	return res.status(code).json(err);
}

module.exports = router;