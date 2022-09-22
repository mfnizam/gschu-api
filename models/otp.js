const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OtpSchema = mongoose.Schema({
	email 			: { type: String, required: true },
	// noTlp 			: { type: String },
	kode 				: { type: Number, required: true },
	kadaluarsa 	: { type: Date, required: true, expires: '15m' },
	status 			: { type: Number, default: 0 }, // 0 belum dipakai, 1 sudah dipakai, 2 tidak terpakai
	keperluan   : { type: Number, required: true } // 0 ubahsandi
})

// OtpSchema.index({ kadaluarsa: 1 }, { expireAfterSeconds: 60 })

module.exports = mongoose.model("otp", OtpSchema);
