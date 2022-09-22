const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WilayahSchema = mongoose.Schema({
	zona: { type: Schema.Types.ObjectId, ref: 'zona', required: true },
	nama: { type: String, required: true },
	tipe: { type: String, default: 'wilayah'},

	delete: { type: Boolean }
})

let autoPopulateZona = function (next) {
	this.populate('zona');
	next();
};

WilayahSchema.pre(['find', 'findOne'], autoPopulateZona);

module.exports = mongoose.model("wilayah", WilayahSchema);