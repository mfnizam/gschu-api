const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DokumenSchema = mongoose.Schema({
  namaPengirim      : { type: String, required: true },
  alamatPengirim    : { type: String, required: true },
  noTlpPengirim     : { type: String, required: true },
  namaPenerima      : { type: String, required: true },
  alamatPenerima    : { type: String, required: true },
  noTlpPenerima     : { type: String, required: true },
  jenisDokumen      : { type: String, required: true },
  tglPengiriman     : { type: Date, required: true },
  catatan           : { type: String }
})

module.exports = mongoose.model("dokumen", DokumenSchema);