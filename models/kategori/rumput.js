const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RumputSchema = mongoose.Schema({
	// alamat 			: { type: String, required: true },
	tgl         : { type: Date, required: true },
  pemotongan  : [{
    lokasi    : { type: String, required: true },
    foto      : { type: String }
  }],
  catatan     : { type: String }
})

module.exports = mongoose.model("rumput", RumputSchema);