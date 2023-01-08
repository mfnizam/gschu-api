const router = require('express').Router(),
  m = require('../../module'),
  User = require('../../models/user'),
  Fungsi = require('../../models/fungsi'),
  Notifikasi = require('../../models/notifikasi'),
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
      'diketahui.oleh': req.user._id,
      'diketahui.disabled': { $in: [null, false] },
      $or: [{ 'diketahui.status': { $lt: 1 } }, { 'diketahui.status': null }]
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

// TODO: cegah pemohon menyetujui atau menolak permintaannya sendiri
router.get('/persetujuan/:_id', async (req, res) => {
  try {
    let permintaan = await m.customModelFindOneByQueryLean(Permintaan, { _id: req.params._id });
    return res.json({ permintaan })
  } catch (err) {
    return sendError(res, 500, err);
  }
})
router.patch('/persetujuan/setuju', async (req, res) => {
  try {
    let permintaan = await m.customModelUpdateByIdPopulateLean(Permintaan, req.body._id, { 'diketahui.status': 1 }, { new: true }, 'diketahui.oleh')
    if (!permintaan) throw { field: '_id', msg: 'Permintaan tidak tersedia' };

    await Notifikasi.create({
      diperuntukkan: permintaan._id,
      jenis: 'permintaan',
      kategori: permintaan.kategori._id,
      user: permintaan.user._id,
      nama: 'Permintaan Disetujui Atasan',
      konten: permintaan.kategori.nama + ' anda dengan No Surat ' + permintaan.noSurat + ' telah disetujui oleh atasan - ' +
        capitalize(permintaan.diketahui?.oleh?.namaLengkap) + '( ' + permintaan.diketahui?.oleh?.jabatan?.nama + ' )' +
        ', Selanjutnya permintaan anda akan diteruskan ke Fungsi ' +
        permintaan.disetujui?.oleh?.fungsi?.nama + ' untuk direview.',
      tombol: {
        link: '/detail/permintaan/' + permintaan._id,
        title: 'Lihat Detail Permintaan'
      }
    }).catch(() => null)

    return res.json(permintaan?.diketahui?.status == 1 ? true : false)
  } catch (err) {
    return sendError(res, 500, err);
  }
})
router.patch('/persetujuan/tolak', async (req, res) => {
  try {
    let permintaan = await m.customModelUpdateByIdLean(Permintaan, req.body._id, { 'diketahui.status': 2, 'diketahui.catatan': req.body.catatan }, {})
    if (!permintaan) throw { field: 'status', msg: 'Permintaan tidak tersedia' }

    await Notifikasi.create({
      diperuntukkan: permintaan._id,
      jenis: 'permintaan',
      kategori: permintaan.kategori._id,
      user: permintaan.user._id,
      nama: 'Permintaan Ditolak Atasan',
      konten: permintaan.kategori.nama + ' anda dengan No Surat ' + permintaan.noSurat + 'telah ditolak oleh atasan - ' +
        capitalize(permintaan.diketahui?.oleh?.namaLengkap) + '( ' + permintaan.diketahui?.oleh?.jabatan?.nama + ' )' +
        ', Mohon untuk memperbaiki/revisi permintaan anda sesuai dengan catatan penolakan yang diberikan oleh atasan. Setelah permintaan selesai di perbaiki/revisi, permintaan anda akan di review ulang oleh atasan anda.',
      tombol: {
        link: '/detail/permintaan/' + permintaan._id,
        title: 'Lihat Detail Permintaan'
      }
    }).catch(() => null)

    return res.json(permintaan?.diketahui?.status == 2 ? true : false)
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

    let query = {
      'diketahui.oleh': req.user._id,
      'diketahui.disabled': { $in: [null, false] },
      $or: [{ 'diketahui.status': { $lt: 1 } }, { 'diketahui.status': null }]
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
router.get('/disetujui', async (req, res) => {
  try {
    let
      search = req.query.search,
      sort = req.query.sort || 'createAt',
      order = req.query.order || 'desc',
      page = Number(req.query.page),
      size = Number(req.query.size) || undefined;

    let query = { 'diketahui.oleh': req.user._id, 'diketahui.status': 1 }
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

    let query = { 'diketahui.oleh': req.user._id, 'diketahui.status': 2 }
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