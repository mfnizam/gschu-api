const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Jabatan = require('./jabatan');

const FungsiSchema = mongoose.Schema({
	nama  						: { type: String, required: true },
	kode  						: { type: String, required: true },

	organisasi 		    : { type: Schema.Types.ObjectId, required: true, refPath: 'tipe' },
  tipe     		    	: { type: String, required: true, enum: ['zona', 'wilayah'] },

	ttdAtasan					: { type: Boolean }, // TODO: Kyk e ini ga dibutuhkan
	atasan 						: { type: Schema.Types.ObjectId, ref: 'user' },
	penyetuju 				: { type: Schema.Types.ObjectId, ref: 'user' },

	delete 						: { type: Boolean },
	createAt 					: { type: Date, default: Date.now },
	updateAt 					: { type: Date, default: Date.now },
})

let autoPopulateOrganisasi = function (next) {
	this.populate(['organisasi']); 
	// atasan dan penyetuju tidak dipupulate di sini karna dapat menimbumklan populate loop
	// contoh: USER --punya fungsi--> FUNGSI ---punya atasan (user)---> USER --punya fungsi--> FUNGSI dan seterusnya
	next();
};

let jumlahJabatah = async function (doc) {
	// if(doc) doc.jumlahJabatah = await Jabatan.count({ funsi: doc._id }) // ini tidak bisa karna array
}

let allmiddleware = ['findOne', 'find', 'findOneAndDelete', 'findOneAndRemove', 'findOneAndReplace', 'findOneAndUpdate', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany'];
FungsiSchema.pre(allmiddleware, autoPopulateOrganisasi);
FungsiSchema.post(allmiddleware, jumlahJabatah);

module.exports = mongoose.model("fungsi", FungsiSchema);