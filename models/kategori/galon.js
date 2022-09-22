const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GalonSchema = mongoose.Schema({
  jumlah            : { type: Number, required: true },
  lokasi            : { type: String, required: true },
  waktu             : { type: Date, required: true },
  tgl               : { type: Date, required: true },
  jenisPelayanan    : { type: String, required: true },
  catatan           : { type: String }
})

module.exports = mongoose.model("galon", GalonSchema);