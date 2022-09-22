const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermintaanSchema = mongoose.Schema({
  user   			    : { type: Schema.Types.ObjectId, ref: 'user', required: true },
  noSurat         : { type: String },
  kategori        : { type: Schema.Types.ObjectId, ref: 'kategori' },
  permintaan      : { type: Schema.Types.ObjectId, required: true, refPath: 'jenis' },
  jenis           : { type: String, required: true, enum: ['rdp', 'furniture', 'rumput', 'ac', 'atk', 'snack', 'krp', 'mess', 'dokumen', 'galon', 'acara', 'peralatan'] },
	diketahui       : { type: mongoose.Schema({
    disabled      : { type: Boolean }, // enable jika permintaaan tidak memerlukan persetujuan atasan
    oleh          : { type: Schema.Types.ObjectId, ref: 'user', required: function() { return !this.disabled } },
    status        : { type: Number, required: function() { return !this.disabled }, default: function() { return this.disabled? undefined : 0  } }, // 0 belum di ketahui, 1 dikethui, 2 ditolak
    tgl           : { type: Date, required: true, default: Date.now },
    catatan       : { type: String }
  }) },
  disetujui       : { type: mongoose.Schema({
    oleh          : { type: Schema.Types.ObjectId, ref: 'user', required: true },
    status        : { type: Number, required: true, default: 0 }, // 0 belum di ketahui, 1 dikethui, 2 ditolak
    tgl           : { type: Date, required: true, default: Date.now },
    catatan       : { type: String }
  }) },

  selesai         : { type: Boolean },

  peringkat       : { type: Number },
  ulasan          : { type: String },

  createAt        : { type: Date, default: Date.now },
})

let autoPopulateAll = async function (next) {
	this.populate([{
    path: 'user',
    select: '-admin'
  }, { 
    path: 'diketahui.oleh',
    select: '-admin'
  }, {
    path: 'disetujui.oleh',
    select: '-admin'
  }, 'kategori', 'permintaan']);
	next();
};

let allmiddleware = ['findOne', 'find', 'findOneAndDelete', 'findOneAndRemove', 'findOneAndReplace', 'findOneAndUpdate', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany']
PermintaanSchema.pre(allmiddleware, autoPopulateAll);

module.exports = mongoose.model("permintaan", PermintaanSchema);