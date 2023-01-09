const router = require('express').Router(),
			passport = require('passport'),
			ObjectId = require('mongoose').Types.ObjectId,
			{ firebase } = require('../firebase/config'),
			transporter = require('../nodemail');

// DONE
// - all is async-await

//moduls
const m 	= require('../module');

// models
const Versi			= require('../models/versi'),
			User 			= require('../models/user'),
			Wilayah   = require('../models/wilayah'),
			Fungsi    = require('../models/fungsi'),
			Jabatan   = require('../models/jabatan'),
			Kategori = require('../models/kategori');


router.get('/kategori', async (req, res) => {
	try {		
		let kategori = await m.customModelFindByQueryLean(Kategori, {});
		return res.json({ kategori })
	} catch (err) {
		return sendError(res, 500, err);
	}
})

router.get('/wilayah', async (req, res) => {
	try {		
		let wilayah = await m.customModelFindByQueryLean(Wilayah, {});
		return res.json({ wilayah })
	} catch (err) {
		return sendError(res, 500, err);
	}
})

router.get('/fungsi', async (req, res) => {
	try {		
		let fungsi = await m.customModelFindByQueryLean(Fungsi, JSON.parse(req.query.filter));
		return res.json({ fungsi })
	} catch (err) {
		return sendError(res, 500, err);
	}
})

router.get('/jabatan', async (req, res) => {
	try {		
		let jabatan = await m.customModelFindByQueryLean(Jabatan, JSON.parse(req.query.filter));
		return res.json({ jabatan })
	} catch (err) {
		return sendError(res, 500, err);
	}
})

router.get('/testnotif/admin', async (req, res) => {
	try {
		let admin = await m.customModelFindOneByQueryLean(User, { admin: true });
		if(admin?.tokenNotif?.length > 0){
			let notif = await firebase.messaging().sendMulticast({
				tokens: admin.tokenNotif,
				data: {
					channelId: 'pemesanan',
					route: '/transaksi'
				},
				notification: {
					title: 'Test Notifikasi Admin - Server',
					body: 'Ini adalah test notifikasi dari server. Mohon abaikan jika anda menerima notifikasi ini',
				},
				android: {
					priority: 'high',
					notification: {
						// tag: 'transaksi-01294913',
						visibility: 'public',
						channelId: 'pemesanan',
						// imageUrl: 'https://www.layspeed.com/assets/icon-text.png',
						priority: 'max',
						// defaultVibrateTimings: true,
						// defaultSound: true,
						sound: 'default',
					}
				}
			})
			return res.json(notif)
		}else {
			return res.json('Tidak ada data admin')
		}

		// let data = await firebase.messaging().send({
		// 	token: 'dtDnDTgcRMiocGR1yaCHOX:APA91bFLL03znPq-u8SgCk4Gs_2e5hwcuRCWIThIS9mLZ7fBT9_INTBovG6WDYFQifIkVsfJi9WcvJjtKzTw1cRqkXddwA2LpOKnEW_K05rr1BR06nbJyk-p-Nt1mRz2ik3dzbRN1X5Y',
		// 	data: {
		// 		idnotif: 'a22k4h42hkj34kjh'
		// 	}
		// })
		// return res.json(data)

	} catch (err) {
		return res.status(500).json(err)		
	}
})

router.get('/testnotif', async (req, res) => {
	try {
		let notif = await firebase.messaging().send({
			token: 'f0yhmW41T2Cl9I7Ueg583P:APA91bGYunqMQUosB7wXo11WI6iTZ06Wrkx_hmEtoMeZKS-R07Tsz44GLxY6kmlE8hf3Jfnc_SjJxl7AI6wEFBa1URzobm4tUT3UuQ_kNNe2NNakObcESSIxyCPPGWESloTGbsXMcbNu',
			notification: {
				title: 'Test Notifikasi - Server',
				body: 'Ini adalah test notifikasi dari server. Mohon abaikan jika anda menerima notifikasi ini',
			},
			android: {
				notification: {
					tag: 'transaksi-01294913',
					visibility: 'public',
					channelId: 'transaksi',
					// imageUrl: 'https://www.layspeed.com/assets/icon-text.png',
					ticker: 'test ticker'
				}
			}
		})
		return res.json(notif)

		// let data = await firebase.messaging().send({
		// 	token: 'dtDnDTgcRMiocGR1yaCHOX:APA91bFLL03znPq-u8SgCk4Gs_2e5hwcuRCWIThIS9mLZ7fBT9_INTBovG6WDYFQifIkVsfJi9WcvJjtKzTw1cRqkXddwA2LpOKnEW_K05rr1BR06nbJyk-p-Nt1mRz2ik3dzbRN1X5Y',
		// 	data: {
		// 		idnotif: 'a22k4h42hkj34kjh'
		// 	}
		// })
		// return res.json(data)

	} catch (err) {
		return res.status(500).json(err)
	}
})

router.get('/testemail', async (req, res) => {
	let mailOptions = {
		from: '"GSCHU Pertamina Zona 1" <noreply@gschuz1.com>', // sender address
		to: 'fatikhunnizam@gmail.com', //req.body.to, // list of receivers
		subject: 'Reset Password', //req.body.subject, // Subject line
		text: 'Test email dari server untuk reset password', //req.body.body, // plain text body
		html: '<b>NodeJS Email Test</b>' // html body
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return res.json(error);
		}
		// console.log('Message %s sent: %s', info.messageId, info.response);
		res.json(`Message ${info.messageId} sent: ${info.response}`,);
	});
})

router.get('/versi', async (req, res) => {
	try {
		let versi = await m.customModelFindOneByQuerySelectOptionLean(Versi, {
			delete: { $in: [null, false] },
			status: true
		}, ['-__v', '-_id'], { sort: '-createAt' });
		return res.status(200).json({ versi })
	} catch (err) {
		return sendError(res, 500, { msg: 'Terjadi kesalahan, coba lagi.' });
	}
})

// format err: { msg: String, field: String }
function sendError(res, code, err = {}) {
	res.statusMessage = err.msg || 'Terjadi kesalahan, coba lagi.';
	res.statusText = err.msg || 'Terjadi kesalahan, coba lagi.';
	return res.status(code).json(err);
}

module.exports = router;