const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AcarakSchema = mongoose.Schema({
	nama  			: { type: String, required: true },
	jenis 			: { type: String, required: true },
	costCenter	: { type: String },
	GLAccount 	: { type: String },
	tgl         : { type: Date, required: true },
	waktu       : { type: Date, required: true },
	tempat 			: { type: String, required: true },
	jumlah 			: { type: Number, required: true },
	pic        	: { type: String },
	noTlpPic   	: { type: String },
  kebutuhan   : [{
    nama      : { type: String, required: true },
    jumlah    : { type: Number, required: true },
		satuan 		: { type: String, required: true },
    tgl       : { type: Date, required: true },
  }],

  catatan     : { type: String }
})

module.exports = mongoose.model("acara", AcarakSchema);