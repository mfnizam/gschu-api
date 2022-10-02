const
  router = require('express').Router(),
  mime = require('mime'),
  fs = require("fs"),
  axios = require('axios').default,
  FormData = require('form-data'),
  multer = require('multer')/* ,
  upload = multer({
    storage: multer.diskStorage({
      destination: function (r, f, callback) {
        const path = 'public/permintaan/'
        fs.mkdirSync(path, { recursive: true })
        return callback(null, path)
        // callback(null, 'public/permintaan/');
      },
      filename: function (req, file, callback) {
        callback(null, Date.now() + '.' + mime.getExtension(file.mimetype));
      }
    })
  }) */;

const otherServerUrl = "https://gschu.asnatsuroyya.com/";

//moduls
const m = require('../../module');

// models
const
  User = require('../../models/user'),
  Notifikasi = require('../../models/notifikasi'),
  Kategori = require('../../models/kategori'),
  Zona = require('../../models/zona'),
  Wilayah = require('../../models/wilayah'),
  Fungsi = require('../../models/fungsi'),
  Jabatan = require('../../models/jabatan'),
  Permintaan = require('../../models/permintaan'),
  Rdp = require('../../models/kategori/rdp'),
  Furniture = require('../../models/kategori/furniture'),
  Rumput = require('../../models/kategori/rumput'),
  Ac = require('../../models/kategori/ac'),
  Atk = require('../../models/kategori/atk'),
  Snack = require('../../models/kategori/snack'),
  Krp = require('../../models/kategori/krp'),
  Mess = require('../../models/kategori/mess'),
  Dokumen = require('../../models/kategori/dokumen'),
  Galon = require('../../models/kategori/galon'),
  Acara = require('../../models/kategori/acara'),
  Peralatan = require('../../models/kategori/peralatan');


router.get('/beranda', async (req, res) => {
  try {
    let sort = req.query.sort || 'createAt',
      order = req.query.order || 'desc',
      size = Number(req.query.size) || undefined;
      
    let query = { user: req.user._id }
    let permintaan = await m.customModelFindByQuerySelectOptionPopulateLean(Permintaan, query, null, {
      sort: { [sort]: order == 'asc' ? 1 : -1 },
      limit: size
    }, ['permintaan']);
    let total = await Permintaan.count(query);

    let totalNotifikasi = await Notifikasi.count({ user: req.user._id, dibaca: { $in: [null, false] } })

    return res.json({ permintaan: { permintaan, total }, totalNotifikasi })
  } catch (err) {
    return sendError(res, 500, err);
  }
})

router.get('/permintaan', async (req, res) => {
  try {
    let search = req.query.search,
      sort = req.query.sort || 'createAt',
      order = req.query.order || 'desc',
      page = Number(req.query.page),
      size = Number(req.query.size) || undefined,
      filter = JSON.parse(req.query.filter || null);

    // return res.status(500).json({ filter })
    // let permintaan = await m.customModelFindByQueryPopulateLean(Permintaan, {}, ['permintaan']);
    let query = { user: req.user._id }
    if (filter?.rangeTgl) query = { ...query, createAt: { $gte: filter.rangeTgl.dari, $lte: filter.rangeTgl.ke } }
    if (filter?.status === 1) query = { ...query, 'diketahui.disabled': { $in: [null, false] }, $or: [{ 'diketahui.status': { $lt: 1 } }, { 'diketahui.status': null }] }
    if (filter?.status === 2) query = { ...query, 'diketahui.status': 2 }
    if (filter?.status === 3) query = { ...query, $and: [{ $or: [{ 'diketahui.status': 1 }, { 'diketahui.disabled': true }] }, { $or: [{ 'disetujui.status': { $lt: 1 } }, { 'disetujui.status': null }] }] }
    if (filter?.status === 4) query = { ...query, $or: [{ 'diketahui.status': 1 }, { 'diketahui.disabled': true }], 'disetujui.status': 2 }
    if (filter?.status === 5) query = { ...query, $or: [{ 'diketahui.status': 1 }, { 'diketahui.disabled': true }], 'disetujui.status': 1, selesai: { $ne: true } }
    if (filter?.status === 6) query = { ...query, selesai: true }
    if (filter?.status === 7) query = { ...query, selesai: true, $or: [{ peringkat: { $lt: 1 } }, { peringkat: null }] }
    if (filter?.status === 8) query = { ...query, selesai: true, peringkat: { $gte: 1 } }

    let permintaan = await m.customModelFindByQuerySelectOptionPopulateLean(Permintaan, query, null, {
      sort: { [sort]: order == 'asc' ? 1 : -1 },
      limit: size
    }, ['permintaan']);
    let total = await Permintaan.count({ user: req.user._id });

    return res.json({ permintaan, total })
  } catch (err) {
    return sendError(res, 500, err);
  }
})
router.get('/permintaan/:_id', async (req, res) => {
  try {
    let permintaan = await m.customModelFindOneByQueryPopulateLean(Permintaan, { _id: req.params._id, user: req.user._id },
      [
        { path: 'user', populate: ['fungsi', 'jabatan'] },
        { path: 'diketahui.oleh', populate: 'jabatan' },
        { path: 'disetujui.oleh', populate: 'jabatan' },
        'permintaan']
    );
    return res.json({ permintaan })
  } catch (err) {
    return sendError(res, 500, err);
  }
})

router.post('/permintaan', /* upload.any(), */ multer().any(), async (req, res) => {
  try {
    let permintaan;
    let fungsi = req.user?.fungsi;
    let jabatan = req.user?.jabatan;
    let kategori = await m.customModelFindByIdLean(Kategori, req.body.kategori);
    
    if (!fungsi) throw { field: 'fungsi', msg: 'Tidak dapat menambahkan permintaan karena anda belum memilih fungsi' }
    if (!jabatan) throw { field: 'jabatan', msg: 'Tidak dapat menambahkan permintaan karena anda belum memilih jabatan' }
    // if (!jabatan) throw { field: 'jabatan', msg: 'Tidak dapat menambahkan permintaan karena jabatan anda tidak memiliki atasan penyetuju. Hubungi Admin' }
    if (!kategori) throw { field: 'kategori', msg: 'Tidak dapat menambahkan permintaan karena jenis permintaan tidak terdaftar' }

    let upload;
    let destination = 'images/permintaan';
    if (req.file || req.files.length > 0) {
      let form = new FormData();
      req.files.forEach((file, i) => {
        form.append('file[' + i + ']', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype
        });
      })
      form.append('destination', destination);

      upload = await axios.post(otherServerUrl + 'upload.php', form, {
        headers: form.getHeaders()
      });


      if (upload.data?.success?.some(v => !v)) throw { msg: 'Gagal upload gambar permintaan', field: 'file' }
    }

    let variasi = req.body.variasi?.map((v, i) => {
      let foto = upload?.data?.path?.find(p => p.replace(destination + '/', '').split('-')[0] == v.fotoNama) // medapatkan nama file
      return { ...v, _id: v._id || null, ...foto ? { foto: otherServerUrl + foto } : {} }
    })

    // return res.status(500).json({ variasi, body: req.body })

    if (kategori.kode == 'rdp') {
      permintaan = await Rdp.create({ ...req.body, perbaikan: variasi });
      // perbaikan: req.body.variasi?.map((v, i) => ({ ...v, foto: req.files.find(v => v.originalname == i.toString())?.path }))
    } else if (kategori.kode == 'furniture') {
      permintaan = await Furniture.create({ ...req.body, furniture: req.body.variasi });
    } else if (kategori.kode == 'rumput') {
      permintaan = await Rumput.create({ ...req.body, pemotongan: variasi });
    } else if (kategori.kode == 'ac') {
      permintaan = await Ac.create({ ...req.body, perbaikan: variasi });
    } else if (kategori.kode == 'atk') {
      permintaan = await Atk.create({ ...req.body, atk: req.body.variasi });
    } else if (kategori.kode == 'snack') {
      permintaan = await Snack.create({ ...req.body, perihal: Object.entries(req.body.perihal).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {}) /* hapus key value yg kosong  */ });
    } else if (kategori.kode == 'krp') {
      permintaan = await Krp.create(req.body);
    } else if (kategori.kode == 'mess') {
      permintaan = await Mess.create(req.body);
    } else if (kategori.kode == 'dokumen') {
      permintaan = await Dokumen.create(req.body);
    } else if (kategori.kode == 'galon') {
      permintaan = await Galon.create(req.body);
    } else if (kategori.kode == 'acara') {
      permintaan = await Acara.create({ ...req.body, kebutuhan: req.body.variasi });
    } else if (kategori.kode == 'peralatan') {
      permintaan = await Peralatan.create({ ...req.body, peralatan: req.body.variasi });
    }

    let totalPermintaan = await Permintaan.count({});
    let newPermintaan = await Permintaan.create({
      noSurat: String(Number(totalPermintaan) + 1).padStart(4, '0') + '/' + (fungsi.kode || '-') + '/' + new Date().getFullYear(),
      user: req.user._id,
      kategori: kategori._id,
      permintaan: permintaan._id,
      jenis: kategori.kode,
      // TODO: Please refactor this code.. its ugly
      ...fungsi.atasan && (!req.user._id.equals(fungsi.atasan) || req.user._id.equals(fungsi.penyetuju)) ? {
        diketahui: { oleh: fungsi.atasan }
      } :
      jabatan.atasan && (!req.user._id.equals(jabatan.atasan) || req.user._id.equals(jabatan.penyetuju)) ? {
        diketahui: { oleh: jabatan.atasan }
      } : {
        diketahui: { disabled: true }
      },
      ...fungsi.penyetuju ? {
        disetujui: {
          oleh: req.user.fungsi.penyetuju,
          ...req.user._id.equals(fungsi.penyetuju) ? { status: 1 } : {}
        }
      } : {}
    })

    return res.json({ permintaan: newPermintaan })
  } catch (err) {
    return sendError(res, 500, err);
  }
})
// TODO: disable ubah permintaan ketika permintaan tidak ditolak
router.patch('/permintaan', /* upload.any(), */ multer().any(), async (req, res) => {
  try {
    let permintaan = await m.customModelFindOneByQueryLean(Permintaan, { permintaan: req.body._id });
    if (!permintaan) throw { field: '_id', msg: 'Permintaan tidak tersedia' }

    // return res.status(500).json({ files: req.files, body: req.body })

    let upload;
    let destination = 'images/permintaan';
    if (req.file || req.files.length > 0) {
      let form = new FormData();
      req.files.forEach((file, i) => {
        form.append('file[' + i + ']', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype
        });
      })
      form.append('destination', destination);

      upload = await axios.post(otherServerUrl + 'upload.php', form, {
        headers: form.getHeaders()
      });


      if (upload.data?.success?.some(v => !v)) throw { msg: 'Gagal upload gambar permintaan', field: 'file' }
    }

    let variasi = req.body.variasi?.map((v, i) => {
      let foto = upload?.data?.path?.find(p => p.replace(destination + '/', '').split('-')[0] == v.fotoNama) // medapatkan nama file
      return { ...v, _id: v._id || null, ...foto ? { foto: otherServerUrl + foto } : {} }
    })

    let update;
    if (permintaan.kategori.kode == 'rdp') {
      update = await m.customModelUpdateByIdLean(Rdp, req.body._id, { ...req.body, perbaikan: variasi });
      // perbaikan: req.body.variasi?.map((v, i) => ({ ...v, ...req.files.find(v => v.originalname == i.toString())?.path ? { foto: req.files.find(v => v.originalname == i.toString())?.path } : {} }))
    } else if (permintaan.kategori.kode == 'furniture') {
      update = await m.customModelUpdateByIdLean(Furniture, req.body._id, { ...req.body, furniture: variasi });
    } else if (permintaan.kategori.kode == 'rumput') {
      update = await m.customModelUpdateByIdLean(Rumput, req.body._id, { ...req.body, pemotongan: variasi });
    } else if (permintaan.kategori.kode == 'ac') {
      update = await m.customModelUpdateByIdLean(Ac, req.body._id, { ...req.body, perbaikan: variasi });
    } else if (permintaan.kategori.kode == 'atk') {
      update = await m.customModelUpdateByIdLean(Atk, req.body._id, { ...req.body, atk: variasi });
    } else if (permintaan.kategori.kode == 'snack') {
      update = await m.customModelUpdateByIdLean(Snack, req.body._id, { ...req.body, perihal: Object.entries(req.body.perihal).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {}) /* hapus key value yg kosong  */ });
    } else if (permintaan.kategori.kode == 'krp') {
      update = await m.customModelUpdateByIdLean(Krp, req.body._id, req.body);
    } else if (permintaan.kategori.kode == 'mess') {
      update = await m.customModelUpdateByIdLean(Mess, req.body._id, req.body);
    } else if (permintaan.kategori.kode == 'dokumen') {
      update = await m.customModelUpdateByIdLean(Dokumen, req.body._id, req.body);
    } else if (permintaan.kategori.kode == 'galon') {
      update = await m.customModelUpdateByIdLean(Galon, req.body._id, req.body);
    } else if (permintaan.kategori.kode == 'acara') {
      update = await m.customModelUpdateByIdLean(Acara, req.body._id, { ...req.body, kebutuhan: variasi });
    } else if (permintaan.kategori.kode == 'peralatan') {
      update = await m.customModelUpdateByIdLean(Peralatan, req.body._id, { ...req.body, peralatan: variasi });
    }

    let updatedpermintaan = await m.customModelUpdateByQueryLean(Permintaan, { permintaan: req.body._id }, {
      ...permintaan.diketahui.status == 2 ? { 'diketahui.status': 0, 'diketahui.catatan': null } :
        permintaan.disetujui.status == 2 ? { 'disetujui.status': 0, 'disetujui.catatan': null } : {}
    }, {})
    return res.json({ permintaan: updatedpermintaan })
  } catch (err) {
    return sendError(res, 500, err);
  }
})
router.post('/ulasan', async (req, res) => {
  try {
    let ulasan = await m.customModelUpdateByIdLean(Permintaan, req.body._id, {
      peringkat: req.body.peringkat,
      ulasan: req.body.ulasan
    }, { new: true })
    return res.json(!!ulasan.peringkat)
  } catch (err) {
    return sendError(res, 500, err);
  }
})

router.get('/organisasi', async (req, res) => {
  try {
    let zonamaster = await m.customModelFindByQueryLean(Zona, { delete: { $in: [null, false] }, ...JSON.parse(req.query.filter) });
    let wilayahmaster = await m.customModelFindByQueryLean(Wilayah, { delete: { $in: [null, false] }, ...JSON.parse(req.query.filter) });
    organisasi = [...zonamaster, ...wilayahmaster]

    return res.json({ organisasi, filter: JSON.parse(req.query.filter) })
  } catch (err) {
    return sendError(res, 500, err);
  }
})

router.get('/fungsi', async (req, res) => {
  try {
    let fungsi = await m.customModelFindByQueryLean(Fungsi, { delete: { $in: [null, false] }, ...JSON.parse(req.query.filter) });
    return res.json({ fungsi })
  } catch (err) {
    return sendError(res, 500, err);
  }
})

router.get('/jabatan', async (req, res) => {
  try {
    let jabatan = await m.customModelFindByQueryLean(Jabatan, { delete: { $in: [null, false] }, ...JSON.parse(req.query.filter) });
    return res.json({ jabatan })
  } catch (err) {
    return sendError(res, 500, err);
  }
})

router.get('/notifikasi', async (req, res) => {
  try {
    let
      search = req.query.search,
      sort = req.query.sort || 'createAt',
      order = req.query.order || 'desc',
      page = Number(req.query.page),
      size = Number(req.query.size) || undefined;

    let notifikasi = await m.customModelFindByQuerySelectOptionLean(Notifikasi, { user: req.user._id }, null, {
      sort: { [sort]: order == 'asc' ? 1 : -1 },
      limit: size
    })
    return res.json({ notifikasi })
  } catch (err) {
    return sendError(res, 500, err);
  }
})
router.get('/notifikasi/total', async (req, res) => {
  try {
    let total = await Notifikasi.count({
      user: req.user._id,
      dibaca: { $in: [null, false] }
    })
    return res.json({ total })
  } catch (err) {
    return sendError(res, 500, err);
  }
})
router.patch('/notifikasi/dibaca', async (req, res) => {
  try {
    let notifikasi = await m.customModelUpdateById(Notifikasi, req.body._id, {
      user: req.user._id,
      dibaca: true
    }, { new: true })
    return res.json(notifikasi.dibaca)
  } catch (err) {
    return sendError(res, 500, err);
  }
})
router.get('/notifikasi/:_id', async (req, res) => {
  try {
    let notifikasi = await m.customModelFindOneByQueryLean(Notifikasi, {
      user: req.user._id,
      _id: req.params._id,
    })
    return res.json({ notifikasi })
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

module.exports = router;