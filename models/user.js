const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Fungsi = require('./fungsi');
const Jabatan = require('./jabatan');

const UserSchema = mongoose.Schema({
	namaLengkap		: { type: String, required: true },
	inisial 			: { type: String, },
	email 				: { type: String, required: true, lowercase: true, unique: true },
	sandi 			: { type: String, required: true, select: false },
	kodeNoTlp 		: { type: String, default: '+62'},
	noTlp 				: { type: String },
	tglLahir			: { type: Date },
	jenisKelamin	: { type: Number },
	noPegawai			: { type: String },

	fungsi				: { type: Schema.Types.ObjectId, ref: 'fungsi' },
	jabatan				: { type: Schema.Types.ObjectId, ref: 'jabatan' },
	
	foto        	: { type: String },
	delete 				: { type: Boolean },
	admin 				: { type: Boolean/* , select: false */ }, // todo: tambah select: false, hanya di tampilkan pada passport.js untuk verifikasi isadmin pada server.js, ketika ingin menjadikan jwt ambil data ulang dengan field tanpa admin(defauldnya). dan pada frondend request secara mandiri cek apakah user adalah admin. dan beri guard pada halaman admin (dengan request)
	
	tokenNotif 		: [{ type: String }],
	
	createAt 			: { type: Date, default: Date.now },
	updateAt 			: { type: Date, default: Date.now },
	__v 					: { select: false }
})

let autoPopulateAll = async function (next) {
	this.populate(['fungsi', 'jabatan']).select('-__v');
	// this.select(['-sandi', '-__v']);
	next();
};
let setUpdateAt = function (next) {
	this.set({ updateAt: new Date() })
	next();
};
let cekAtasanPenyetuju = async function(doc) {
	if(!doc) return;
	if(Array.isArray(doc)) {
		for(let i = 0; i < doc.length; i++){
			doc[i].atasan = (await Fungsi.exists({ atasan: doc[i]._id })) || (await Jabatan.exists({ atasan: doc[i]._id }))? true : undefined;
			doc[i].penyetuju = (await Fungsi.exists({ penyetuju: doc[i]._id }))? true : undefined;	
		}
	} else {
		doc.atasan = (await Fungsi.exists({ atasan: doc._id })) || (await Jabatan.exists({ atasan: doc._id }))? true : undefined;
		doc.penyetuju = (await Fungsi.exists({ penyetuju: doc._id }))? true : undefined;
	}
}

let findmiddleware = ['findOne', 'find', 'findOneAndReplace', 'findOneAndUpdate']
let updatemiddleware = ['findOneAndUpdate', 'update', 'updateOne', 'updateMany']
UserSchema.pre([...findmiddleware, ...updatemiddleware], autoPopulateAll);
UserSchema.pre(updatemiddleware, setUpdateAt);
UserSchema.post([...findmiddleware, ...updatemiddleware], cekAtasanPenyetuju);

// UserSchema.virtual('biodata', {
//   ref: 'Penduduk',
//   localField: 'nik',
//   foreignField: 'nik',
//   justOne: true
// });
// UserSchema.set('toObject', { virtuals: true });
// UserSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("user", UserSchema);
