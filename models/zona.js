const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ZonaSchema = mongoose.Schema({
	nama  			: { type: String, required: true },
	tipe 				: { type: String, default: 'zona'},

	delete 			: { type: Boolean }
})

module.exports = mongoose.model("zona", ZonaSchema);