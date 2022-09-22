const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JabatanSchema = mongoose.Schema({
	fungsi   		: { type: Schema.Types.ObjectId, ref: 'fungsi', required: true },
	nama  			: { type: String, required: true },

	atasan 			: { type: Schema.Types.ObjectId, ref: 'user' },

	delete 			: { type: Boolean },
	createAt 		: { type: Date, default: Date.now },
	updateAt 		: { type: Date, default: Date.now },
})

module.exports = mongoose.model("jabatan", JabatanSchema);