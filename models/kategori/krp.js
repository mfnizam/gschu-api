const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KrpSchema = mongoose.Schema({
  tglKeberangkatan  : { type: Date, required: true },
  tglKembali        : { type: Date, required: true },
  tempatTujuan      : { type: String, required: true },
  tempatPenjemputan : { type: String, required: true },
  waktuPenjemputan  : { type: Date, required: true },
  jumlahPenumpang   : { type: Number, required: true },
  jenisPelayanan    : { type: String, required: true },
  catatan           : { type: String }
})

module.exports = mongoose.model("krp", KrpSchema);