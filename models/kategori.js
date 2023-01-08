const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KategoriSchema = mongoose.Schema({
	kode     						: { type: String, required: true },
	nama  							: { type: String, required: true },
	atasan 							: { type: Boolean, required: true, default: true },
	diselesaikanPemohon	: { type: Boolean, required: true, default: false },
})

let escapeNewline = function(doc) {
	if(!doc) return;
	if(Array.isArray(doc)) {
		doc.forEach(v => { v.nama = v.nama.replace(/\\n/g, '\n') })
	} else {
		doc.nama = doc.nama.replace(/\\n/g, '\n')
	}
}

let allmiddleware = ['findOne', 'find', 'findOneAndDelete', 'findOneAndRemove', 'findOneAndReplace', 'findOneAndUpdate', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany']
KategoriSchema.post(allmiddleware, escapeNewline);


module.exports = mongoose.model("kategori", KategoriSchema);