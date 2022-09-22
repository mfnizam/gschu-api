const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PeralatanSchema = mongoose.Schema({
	alamat 			  : { type: String, required: true },
	tgl           : { type: Date, required: true },
  peralatan     : [{
    nama        : { type: String, required: true },
    jumlah      : { type: Number, required: true },
    satuan      : { type: String, required: true },
  }],
  catatan       : { type: String }
})

module.exports = mongoose.model("peralatan", PeralatanSchema);