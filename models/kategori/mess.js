const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessSchema = mongoose.Schema({
  penanggungJawab   : { type: String, required: true },
  checkIn           : { type: Date, required: true },
  checkOut          : { type: Date, required: true },
  jumlahTamu        : { type: Number, required: true },
  jumlahKamar       : { type: Number, required: true },
  catatan           : { type: String }
})

module.exports = mongoose.model("mess", MessSchema);