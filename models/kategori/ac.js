const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AcSchema = mongoose.Schema({
	alamat 			: { type: String, required: true },
	tgl         : { type: Date, required: true },
  perbaikan   : [{
    jenis : { type: String, required: true },
    foto  : { type: String }
  }],
  catatan     : { type: String }
})

module.exports = mongoose.model("ac", AcSchema);