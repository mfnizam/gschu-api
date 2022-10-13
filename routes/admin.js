const router = require('express').Router(),
	mongoose = require('mongoose'),
	ObjectId = require('mongoose').Types.ObjectId;

// Moduls
const m = require('../module');

// Models
const User = require('../models/user'),
	Versi = require('../models/versi'),
	Zona = require('../models/zona'),
	Wilayah = require('../models/wilayah'),
	Fungsi = require('../models/fungsi'),
	Jabatan = require('../models/jabatan'),
	Kategori = require('../models/kategori'),
	Permintaan = require('../models/permintaan');

router.get('/master/semuatotal', async (req, res) => {
	try {
		let filter = { delete: { $in: [null, false] } };
		let zona = await Zona.count(filter);
		let wilayah = await Wilayah.count(filter);
		let organisasi = zona + wilayah
		let fungsi = await Fungsi.count(filter);
		let jabatan = await Jabatan.count(filter);
		let user = await User.count(filter);

		return res.json({ total: { zona, wilayah, organisasi, fungsi, jabatan, user } })
	} catch (err) {
		return sendError(res, 500, err);
	}
})
router.get('/master/:jenis', async (req, res) => {
	try {
		let jenis = req.params?.jenis,
			filter = JSON.parse(req.query.filter);

		let master = [];
		let jabatanHasAtasan = [];
		if (jenis == 'zona') {
			master = await m.customModelFindByQueryLean(Zona, { delete: { $in: [null, false] }, ...filter });
		} else if (jenis == 'wilayah') {
			master = await m.customModelFindByQueryLean(Wilayah, { delete: { $in: [null, false] }, ...filter });
		} else if (jenis == 'organisasi') {
			let zonamaster = await m.customModelFindByQueryLean(Zona, { delete: { $in: [null, false] }, ...filter });
			let wilayahmaster = await m.customModelFindByQueryLean(Wilayah, { delete: { $in: [null, false] }, ...filter });
			master = [...zonamaster, ...wilayahmaster]
		} else if (jenis == 'fungsi') {
			master = await m.customModelFindByQuerySelectOptionPopulateLean(Fungsi, { delete: { $in: [null, false] }, ...filter }, null, {
				sort: {
					organisasi: 1,
					// atasan: -1, 
					// penyetuju: -1, 
					// ttdAtasan: -1 
				}
			}, ['atasan', 'penyetuju']);

			jabatanHasAtasan = await m.customModelFindByQueryDistinctLean(Jabatan, { atasan: { $nin: [null, undefined] } }, 'fungsi')
			master = master.map(m => ({ ...m, ...jabatanHasAtasan.find(v => v._id.toString() == m._id.toString()) ? { jabatanHasAtasan: true } : {} }))

		} else if (jenis == 'jabatan') {
			master = await m.customModelFindByQueryPopulateLean(Jabatan, { delete: { $in: [null, false] }, ...filter }, [{ path: 'fungsi', populate: 'atasan' }, 'atasan']);
		} else if (jenis == 'user') {
			master = await m.customModelFindByQuerySelectOptionLean(User, { delete: { $in: [null, false] }, ...filter }, ['-admin'], null);
			master = master?.map(v => {
				delete v.atasan;
				delete v.penyetuju;
				return v
			})
		} /* else if (jenis == 'atasan') {
			master = await m.customModelFindByQuerySelectOptionLean(User, { delete: { $in: [null, false] }, atasan: true }, ['fungsi', 'jabatan'], '-admin', null);
		} else if (jenis == 'penyetuju') {
			master = await m.customModelFindByQuerySelectOptionLean(User, { delete: { $in: [null, false] }, penyetuju: true }, ['fungsi', 'jabatan'], '-admin', null);
		} else if (jenis == 'kategori') {
			master = await m.customModelFindByQueryPopulateLean(Kategori, { delete: { $in: [null, false] }, ...filter }, null);
		}  */else {
			throw { msg: 'Jenis data tidak tersedia' };
		}

		return res.json({ [jenis]: master, jabatanHasAtasan })
	} catch (err) {
		return sendError(res, 500, err);
	}
})
router.get('/master/:jenis/total', async (req, res) => {
	try {
		let
			jenis = req.params?.jenis,
			filter = { delete: { $in: [null, false] } };

		let total = 0;
		if (jenis == 'zona') {
			total = await Zona.count(filter);
		} else if (jenis == 'wilayah') {
			total = await Wilayah.count(filter);
		} else if (jenis == 'organisasi') {
			let zonatotal = await Zona.count(filter);
			let wilayahtotal = await Wilayah.count(filter);
			total = zonatotal + wilayahtotal
		} else if (jenis == 'fungsi') {
			total = await Fungsi.count(filter);
		} else if (jenis == 'jabatan') {
			total = await Jabatan.count(filter);
		} else if (jenis == 'user') {
			total = await User.count(filter);
		} else {
			throw { msg: 'Total data tidak tersedia' };
		}

		return res.json({ total })
	} catch (err) {
		return sendError(res, 500, err);
	}
})
router.post('/master/:jenis', async (req, res) => {
	try {
		let jenis = req.params?.jenis;
		let master;
		let cekMaster;

		if (jenis == 'zona') {
			cekMaster = await m.customModelFindByQueryLean(Zona, {
				nama: { $regex: new RegExp(req.body.nama, "i") },
				delete: { $in: [null, false] },
			})
			if (cekMaster.length > 0) throw { msg: 'Nama Sudah Digunakan', field: 'nama', type: 'tidaktersedia' }
			master = await Zona.create(req.body);
		} else if (jenis == 'wilayah') {
			cekMaster = await m.customModelFindByQueryLean(Wilayah, {
				nama: { $regex: new RegExp(req.body.nama, "i") },
				delete: { $in: [null, false] },
			})
			if (cekMaster.length > 0) throw { msg: 'Nama Sudah Digunakan', field: 'nama', type: 'tidaktersedia' }
			master = await Wilayah.create(req.body);
		} else if (jenis == 'fungsi') {
			cekMaster = await m.customModelFindByQueryLean(Fungsi, {
				nama: { $regex: new RegExp(req.body.nama, "i") },
				delete: { $in: [null, false] },
				organisasi: req.body.organisasi
			})
			if (cekMaster.length > 0) throw { msg: 'Nama Sudah Digunakan', field: 'nama', type: 'tidaktersedia' }
			let organisasi;
			for (const model of [Zona, Wilayah]) {
				organisasi = await m.customModelFindById(model, req.body.organisasi)
				if (organisasi) break;
			}
			master = await Fungsi.create({ ...req.body, tipe: organisasi.tipe });
		} else if (jenis == 'jabatan') {
			cekMaster = await m.customModelFindByQueryLean(Jabatan, {
				fungsi: req.body.fungsi,
				delete: { $in: [null, false] },
				nama: { $regex: new RegExp(req.body.nama, "i") }
			})
			if (cekMaster.length > 0) throw { msg: 'Nama Sudah Digunakan', field: 'nama', type: 'tidaktersedia' }
			master = await Jabatan.create(req.body);
		} /* else if (jenis == 'kategori') {
			cekMaster = await m.customModelFindByQueryLean(Kategori, {
				kode: { $regex: new RegExp(req.body.kode, "i") },
				delete: { $in: [null, false] },
			})
			if (cekMaster.length > 0) throw { msg: 'Kode Sudah Digunakan', field: 'kode', type: 'tidaktersedia' }
			master = await Kategori.create(req.body);
		} else if (jenis == 'atasan' || jenis == 'penyetuju') {
			master = await m.customModelUpdateById(User, req.body.user, { [jenis]: true }, {}); // tambah select '-admin'
		}  */else {
			throw { msg: 'Jenis data tidak tersedia' };
		}
		return res.json({ success: true, master })
	} catch (err) {
		return sendError(res, 500, err);
	}
})
router.put('/master/:jenis', async (req, res) => {
	try {
		let jenis = req.params?.jenis;
		let master;
		let cekMaster;

		// return res.status(500).json(req.body)
		// todo: cek nama apakah sudah digunakan
		if (jenis == 'zona') {
			master = await m.customModelUpdateByIdLean(Zona, req.body._id, req.body, {});
			if (!master) throw { msg: 'Data Zona tidak ditemukan.' }
		} else if (jenis == 'wilayah') {
			master = await m.customModelUpdateByIdLean(Wilayah, req.body._id, req.body, {});
			if (!master) throw { msg: 'Data Wilayah tidak ditemukan.' }
		} else if (jenis == 'fungsi') {
			let organisasi;
			for (const model of [Zona, Wilayah]) {
				organisasi = await m.customModelFindById(model, req.body.organisasi)
				if (organisasi) break;
			}
			master = await m.customModelUpdateByIdLean(Fungsi, req.body._id, {
				...req.body,
				tipe: organisasi.tipe
			}, {});

			if (!master) throw { msg: 'Data fungsi tidak ditemukan.' }
			// deleting all atasan on jabatan that has fungsi (master._id)
			if (master.atasan._id) {
				await m.customModelUpdateManyByQueryLean(Jabatan, { fungsi: req.body._id }, { $unset: { atasan: 1 } })
			}
		} else if (jenis == 'jabatan') {
			master = await m.customModelUpdateByIdLean(Jabatan, req.body._id, req.body, {});
			if (!master) throw { msg: 'Data jabatan tidak ditemukan.' }
		} /* else if (jenis == 'kategori') {
			cekMaster = await m.customModelFindByQueryLean(Kategori, {
				kode: { $regex: new RegExp(req.body.kode, "i") }
			})
			if (cekMaster.length > 0) throw { msg: 'Kode Sudah Digunakan', field: 'kode', type: 'tidaktersedia' }
			master = await Kategori.create(req.body);
		} else if (jenis == 'atasan' || jenis == 'penyetuju') {
			master = await m.customModelUpdateById(User, req.body.user, { [jenis]: true }, {});
		}  */else {
			throw { msg: 'Jenis data tidak tersedia' };
		}
		return res.json({ success: true, master })
	} catch (err) {
		return sendError(res, 500, err);
	}
})
router.patch('/master/:jenis', async (req, res) => {
	try {
		let jenis = req.params?.jenis;
		let master;
		let cekMaster;

		// return res.status(500).json(req.body)
		// todo: cek nama apakah sudah digunakan
		if (jenis == 'zona') {
			master = await m.customModelUpdateByIdLean(Zona, req.body._id, req.body, {});
			if (!master) throw { msg: 'Data Zona tidak ditemukan.' }
		} else if (jenis == 'wilayah') {
			master = await m.customModelUpdateByIdLean(Wilayah, req.body._id, req.body, {});
			if (!master) throw { msg: 'Data Wilayah tidak ditemukan.' }
		} else if (jenis == 'fungsi') {
			let organisasi;
			for (const model of [Zona, Wilayah]) {
				organisasi = await m.customModelFindById(model, req.body.organisasi)
				if (organisasi) break;
			}
			master = await m.customModelUpdateByIdLean(Fungsi, req.body._id, {
				...req.body,
				tipe: organisasi.tipe
			}, {});

			if (!master) throw { msg: 'Data fungsi tidak ditemukan.' }
			// deleting all atasan on jabatan that has fungsi (master._id)
			if (master.atasan) {
				await m.customModelUpdateManyByQueryLean(Jabatan, { fungsi: req.body._id }, { $unset: { atasan: 1 } }, { new: true })
			}
		} else if (jenis == 'jabatan') {
			master = await m.customModelUpdateByIdLean(Jabatan, req.body._id, req.body, {});
			if (!master) throw { msg: 'Data jabatan tidak ditemukan.' }
		} /* else if (jenis == 'kategori') {
			cekMaster = await m.customModelFindByQueryLean(Kategori, {
				kode: { $regex: new RegExp(req.body.kode, "i") }
			})
			if (cekMaster.length > 0) throw { msg: 'Kode Sudah Digunakan', field: 'kode', type: 'tidaktersedia' }
			master = await Kategori.create(req.body);
		} else if (jenis == 'atasan' || jenis == 'penyetuju') {
			master = await m.customModelUpdateById(User, req.body.user, { [jenis]: true }, {});
		}  */else {
			throw { msg: 'Jenis data tidak tersedia' };
		}
		return res.json({ success: true, master })
	} catch (err) {
		return sendError(res, 500, err);
	}
})
router.delete('/master/:jenis', async (req, res) => {
	try {
		let jenis = req.params.jenis,
			_id = req.query._id,
			hapus;

		if (jenis == 'zona') {
			hapus = await m.customModelUpdateByIdLean(Zona, _id, { delete: true, updateAt: new Date() }, {})
		} else if (jenis == 'wilayah') {
			hapus = await m.customModelUpdateByIdLean(Wilayah, _id, { delete: true, updateAt: new Date() }, {})
		} else if (jenis == 'fungsi') {
			hapus = await m.customModelUpdateByIdLean(Fungsi, _id, { delete: true, updateAt: new Date() }, {})
		} else if (jenis == 'jabatan') {
			hapus = await m.customModelUpdateByIdLean(Jabatan, _id, { delete: true, updateAt: new Date() }, {})
		} else if (jenis == 'atasan' || jenis == 'penyetuju') {
			hapus = await m.customModelUpdateByIdLean(User, _id, { $unset: { [jenis]: 1 }, updateAt: new Date() }, {})
		} else {
			throw { msg: 'Jenis data tidak tersedia' };
		}

		return res.json(!!hapus)
	} catch (err) {
		return sendError(res, 500, err);
	}
})

router.get('/permintaan', async (req, res) => {
	try {
		let
			search = req.query.search,
			sort = req.query.sort || 'createAt',
			order = req.query.order || 'desc',
			page = Number(req.query.page),
			size = Number(req.query.size) || undefined;

		let query = {
			// TODO: add query to filter by fungsi, kategori and date
		}
		let permintaan = await m.customModelFindByQuerySelectOptionLean(Permintaan, query, null, {
			sort: { [sort]: order == 'asc' ? 1 : -1 },
			limit: size
		});
		let total = await Permintaan.count(query);

		return res.json({ permintaan, total })
	} catch (err) {
		return sendError(res, 500, err);
	}
})

router.get('/cekfungsipenyetuju', async (req, res) => {
	try {
		let penyetuju = await m.customModelFindOneByQueryLean(Fungsi, { wilayah: req.query.wilayah, penyetuju: true });
		return res.json({ tersedia: penyetuju ? false : true, penyetuju })
	} catch (err) {
		return sendError(res, 500, err);
	}
})


router.get('/', (req, res) => {
	res.json('incorrect check point')
})

// format err: { msg: String, field: String, type: String (ex: 'tidaktersedia', 'tidaksesuai') }
function sendError(res, code, err = {}) {
	res.statusMessage = err.msg || 'Terjadi kesalahan, coba lagi.';
	res.statusText = err.msg || 'Terjadi kesalahan, coba lagi.';
	return res.status(code).json(err);
}

module.exports = router;