const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SnackSchema = mongoose.Schema({
	judul 			: { type: String, required: true },
	tempat 			: { type: String, required: true },
	jumlah 			: { type: Number, required: true },
	tgl         : { type: Date, required: true },
	pengambilan	: { type: String, required: true },
	perihal   	: { type: {
		snack_pagi	: { type: Boolean },
		makan_siang: { type: Boolean },
		snack_sore	: { type: Boolean },
		makan_malam: { type: Boolean },
	}, required: true },
	costCenter	: { type: String },
	GLAccount 	: { type: String },
	pic        	: { type: String },
  catatan     : { type: String }
})

module.exports = mongoose.model("snack", SnackSchema);