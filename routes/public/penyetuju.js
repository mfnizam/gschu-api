const router = require('express').Router(),
  m = require('../../module'),
  User = require('../../models/user'),
  Notifikasi = require('../../models/notifikasi'),
  Fungsi = require('../../models/fungsi'),
  Permintaan = require('../../models/permintaan');

router.get('/beranda', async (req, res) => {
  try {
    let sort = req.query.sort || 'createAt',
      order = req.query.order || 'desc',
      size = Number(req.query.size) || undefined;

    let queryPermintaan = { user: req.user._id }
    let permintaan = await m.customModelFindByQuerySelectOptionPopulateLean(Permintaan, queryPermintaan, null, {
      sort: { [sort]: order == 'asc' ? 1 : -1 },
      limit: size
    }, ['permintaan']);
    let totalPermintaan = await Permintaan.count(queryPermintaan);

    let queryPersetujuan = {
      'disetujui.oleh': req.user._id,
      $and: [
        { $or: [{ 'diketahui.status': 1 }, { 'diketahui.disabled': true }] },
        { $or: [{ 'disetujui.status': { $lt: 1 } }, { 'disetujui.status': null }] }
      ],
      selesai: { $ne: true }
    }
    let persetujuan = await m.customModelFindByQuerySelectOptionLean(Permintaan, queryPersetujuan, null, {
      sort: { [sort]: order == 'asc' ? 1 : -1 },
      limit: size
    });
    let totalPersetujuan = await Permintaan.count(queryPersetujuan);

    let totalNotifikasi = await Notifikasi.count({ user: req.user._id, dibaca: { $in: [null, false] } })

    return res.json({ permintaan: { permintaan, total: totalPermintaan }, persetujuan: { persetujuan, total: totalPersetujuan }, totalNotifikasi })
  } catch (err) {
    return sendError(res, 500, err);
  }
})

router.get('/persetujuan/:_id', async (req, res) => {
  try {
    let permintaan = await m.customModelFindOneByQueryLean(Permintaan, {
      _id: req.params._id,
      $or: [{ 'diketahui.status': 1 }, { 'diketahui.disabled': true }]
    });
    // if(!permintaan) throw { field: 'status', msg: 'Permintaan tidak tersedia' }
    return res.json({ permintaan })
  } catch (err) {
    return sendError(res, 500, err);
  }
})
router.patch('/persetujuan/setuju', async (req, res) => {
  try {
    let permintaan = await m.customModelUpdateByQueryLean(Permintaan, {
      _id: req.body._id,
      $or: [{ 'diketahui.status': 1 }, { 'diketahui.disabled': true }],
      selesai: { $ne: true }
    }, { 'disetujui.status': 1 }, {})
    if (!permintaan) throw { field: 'status', msg: 'Permintaan tidak tersedia' }

    await Notifikasi.create({
      diperuntukkan: permintaan._id,
      jenis: 'permintaan',
      kategori: permintaan.kategori._id,
      user: permintaan.user._id,
      nama: 'Permintaan Disetujui ' + (permintaan.disetujui?.oleh?.fungsi?.nama || 'SCM & Asset'),
      konten: 'Permintaan ' + permintaan.kategori.nama + ' anda dengan No Surat ' + permintaan.noSurat + ' telah disetujui oleh ' + (permintaan.disetujui?.oleh?.fungsi?.nama || 'SCM & Asset') + ' - ' +
        capitalize(permintaan.disetujui?.oleh?.namaLengkap) + '( ' + permintaan.disetujui?.oleh?.jabatan?.nama + ' )' +
        ', Selanjutnya permintaan anda akan Diproses ',
      tombol: {
        link: '/detail/permintaan/' + permintaan._id,
        title: 'Lihat Detail Permintaan'
      }
    }).catch(() => null)

    return res.json(permintaan?.disetujui?.status == 1 ? true : false)
  } catch (err) {
    return sendError(res, 500, err);
  }
})
router.patch('/persetujuan/tolak', async (req, res) => {
  try {
    let permintaan = await m.customModelUpdateByQueryLean(Permintaan, {
      _id: req.body._id,
      $or: [{ 'diketahui.status': 1 }, { 'diketahui.disabled': true }],
      selesai: { $ne: true }
    }, { 'disetujui.status': 2, 'disetujui.catatan': req.body.catatan }, {})
    if (!permintaan) throw { field: 'status', msg: 'Permintaan tidak tersedia' }

    await Notifikasi.create({
      diperuntukkan: permintaan._id,
      jenis: 'permintaan',
      kategori: permintaan.kategori._id,
      user: permintaan.user._id,
      nama: 'Permintaan Ditolak ' + (permintaan.disetujui?.oleh?.fungsi?.nama || 'SCM & Asset'),
      konten: 'Permintaan ' + permintaan.kategori.nama + ' anda dengan No Surat ' + permintaan.noSurat + ' telah ditolak oleh ' + (permintaan.disetujui?.oleh?.fungsi?.nama || 'SCM & Asset') + ' - ' +
        capitalize(permintaan.disetujui?.oleh?.namaLengkap) + '( ' + permintaan.disetujui?.oleh?.jabatan?.nama + ' )' +
        ', Mohon untuk memperbaiki/revisi permintaan anda sesuai dengan catatan penolakan yang telah diberikan. Setelah permintaan selesai di perbaiki/revisi, permintaan anda akan di review ulang oleh ' +
        (permintaan.disetujui?.oleh?.fungsi?.nama || 'SCM & Asset'),
      tombol: {
        link: '/detail/permintaan/' + permintaan._id,
        title: 'Lihat Detail Permintaan'
      }
    }).catch(() => null)

    return res.json(permintaan?.disetujui?.status == 2 ? true : false)
  } catch (err) {
    return sendError(res, 500, err);
  }
})
router.patch('/persetujuan/selesai', async (req, res) => {
  try {
    let permintaan = await m.customModelUpdateByQueryLean(Permintaan, {
      _id: req.body._id,
      $or: [{ 'diketahui.status': 1 }, { 'diketahui.disabled': true }],
      'disetujui.status': 1,
      selesai: { $ne: true }
    }, { selesai: true }, {})
    if (!permintaan) throw { field: 'status', msg: 'Permintaan tidak tersedia' }

    await Notifikasi.create({
      diperuntukkan: permintaan._id,
      jenis: 'permintaan',
      kategori: permintaan.kategori._id,
      user: permintaan.user._id,
      nama: 'Permintaan Selesai',
      konten: 'Permintaan ' + permintaan.kategori.nama + ' anda dengan No Surat ' + permintaan.noSurat + ' telah selesai. Beri ulasan permintaan anda supaya dapat membantu kami untuk terus memberikan pelayanan terbaik.',
      tombol: {
        link: '/ulasan/' + permintaan._id,
        title: 'Beri Ulasan Permintaan'
      }
    }).catch(() => null)

    return res.json(permintaan.selesai)
  } catch (err) {
    return sendError(res, 500, err);
  }
})

router.get('/menunggu', async (req, res) => {
  try {
    let
      search = req.query.search,
      sort = req.query.sort || 'createAt',
      order = req.query.order || 'desc',
      page = Number(req.query.page),
      size = Number(req.query.size) || undefined;

    // match: { age: { $gte: 21 } } ganti user dengan populate match
    let query = {
      'disetujui.oleh': req.user._id,
      $and: [
        { $or: [{ 'diketahui.status': 1 }, { 'diketahui.disabled': true }] },
        { $or: [{ 'disetujui.status': { $lt: 1 } }, { 'disetujui.status': null }] }
      ],
      selesai: { $ne: true }
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
router.get('/disetujui', async (req, res) => { // data disetujui atasan sama dengan data diproses.. karna setelah disetujui langsung di proses
  try {
    let
      search = req.query.search,
      sort = req.query.sort || 'createAt',
      order = req.query.order || 'desc',
      page = Number(req.query.page),
      size = Number(req.query.size) || undefined;

    let query = {
      'disetujui.oleh': req.user._id,
      $or: [{ 'diketahui.status': 1 }, { 'diketahui.disabled': true }],
      'disetujui.status': 1,
      selesai: { $ne: true }
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
router.get('/ditolak', async (req, res) => {
  try {
    let
      search = req.query.search,
      sort = req.query.sort || 'createAt',
      order = req.query.order || 'desc',
      page = Number(req.query.page),
      size = Number(req.query.size) || undefined;

    let query = {
      'disetujui.oleh': req.user._id,
      $or: [{ 'diketahui.status': 1 }, { 'diketahui.disabled': true }],
      'disetujui.status': 2,
      selesai: { $ne: true }
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
router.get('/diproses', async (req, res) => {
  try {
    let
      search = req.query.search,
      sort = req.query.sort || 'createAt',
      order = req.query.order || 'desc',
      page = Number(req.query.page),
      size = Number(req.query.size) || undefined;

    let query = {
      'disetujui.oleh': req.user._id,
      $or: [{ 'diketahui.status': 1 }, { 'diketahui.disabled': true }],
      'disetujui.status': 1,
      selesai: { $ne: true }
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
router.get('/selesai', async (req, res) => {
  try {
    let
      search = req.query.search,
      sort = req.query.sort || 'createAt',
      order = req.query.order || 'desc',
      page = Number(req.query.page),
      size = Number(req.query.size) || undefined;
    let query = {
      'disetujui.oleh': req.user._id,
      selesai: true
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

router.get('/', (req, res) => {
  res.json('incorrect check point')
})

// format err: { msg: String, field: String }
function sendError(res, code, err = {}) {
  res.statusMessage = err.msg || 'Terjadi kesalahan, coba lagi.';
  res.statusText = err.msg || 'Terjadi kesalahan, coba lagi.';
  return res.status(code).json(err);
}

function capitalize(str) {
  return str.toLowerCase().replace(/([^a-z])([a-z])(?=[a-z]{2})|^([a-z])/g, function (_, g1, g2, g3) {
    return (typeof g1 === 'undefined') ? g3.toUpperCase() : g1 + g2.toUpperCase();
  })
}

module.exports = router;