const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MsgSchema =  mongoose.Schema({
  title         : { type: String },
  msg           : { type: String },
  buttons       : [{ 
    text: { type: String, dafault: 'Update Sekarang' },
    role: { type: String, default: 'ok' } 
  }]
}, { _id: false })

const VersiSchema = mongoose.Schema({
	versi 				: { type: String, required: true, unique: true },
  status        : { type: Boolean, default: false },
  majorMsg      : { type: MsgSchema },
  minorMsg      : { type: MsgSchema }
})

module.exports = mongoose.model("versi", VersiSchema);
