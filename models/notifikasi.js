const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotifikasiSchema = mongoose.Schema({
  diperuntukkan   : { type: Schema.Types.ObjectId, required: true, refPath: 'jenis' },
  jenis           : { type: String, enum: ['permintaan'], default: 'permintaan' }, // enum ini dapat ditambahkan ketika jenis notifikasi bertabah
	user            : { type: Schema.Types.ObjectId, ref: 'user', required: true },
  nama            : { type: String, required: true },
	konten          : { type: String, required: true },

  tombol          : {
    link          : { type: String },
    title         : { type: String },
  },

  dibaca          : { type: Boolean, default: false },

	delete          : { type: Boolean },
  createAt 		    : { type: Date, default: Date.now },
})

let autoPopulateAll = function (next) {
	this.populate(['diperuntukkan']);
	next();
};

let findmiddleware = ['findOne', 'find', 'findOneAndReplace', 'findOneAndUpdate']
let updatemiddleware = ['findOneAndUpdate', 'update', 'updateOne', 'updateMany']
NotifikasiSchema.pre([...findmiddleware, ...updatemiddleware], autoPopulateAll);

module.exports = mongoose.model("Notifikasi", NotifikasiSchema);