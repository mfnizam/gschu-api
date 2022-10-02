const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const crypto = require("crypto");

const mainModuleExports = module.exports = {};

// create module
mainModuleExports.generalCreateDoc = (doc) => {
	return doc.save();
}
mainModuleExports.customModelInsertMany = (model, docArr) => {
	return model.insertMany(docArr);
}
mainModuleExports.customModelInsertManyLean = (model, docArr) => {
	return model.insertMany(docArr, { lean: true });
}


// find module
mainModuleExports.customModelFindById = (model, id) => {
	return model.findById(id);
}
mainModuleExports.customModelFindByIdLean = (model, id) => {
	return model.findById(id).lean().exec();
}
mainModuleExports.customModelFindByIdPopulate = (model, id, populate) => {
	return model.findById(id).populate(populate).exec();
}
mainModuleExports.customModelFindByIdPopulateLean = (model, id, populate) => {
	return model.findById(id).populate(populate).lean().exec();
}
mainModuleExports.customModelFindOneByQuery = (model, query) => {
	return model.findOne(query).exec();
}
mainModuleExports.customModelFindOneByQueryLean = (model, query) => {
	return model.findOne(query).lean().exec();
}
mainModuleExports.customModelFindOneByQueryPopulate = (model, query, populate) => {
	return model.findOne(query).populate(populate).exec();
}
mainModuleExports.customModelFindOneByQueryPopulateLean = (model, query, populate) => {
	return model.findOne(query).populate(populate).lean().exec();
}
mainModuleExports.customModelFindOneByQuerySelectOption = (model, query, select, option) => {
	return model.findOne(query, select, { ...option, new: true }).exec();
}
mainModuleExports.customModelFindOneByQuerySelectOptionLean = (model, query, select, option) => {
	return model.findOne(query, select, { ...option, new: true }).lean().exec();
}
mainModuleExports.customModelFindOneByQuerySelectOptionPopulate = (model, query, select, option, populate) => {
	return model.findOne(query, select, { ...option, new: true }).populate(populate).exec();
}
mainModuleExports.customModelFindOneByQuerySelectOptionPopulateLean = (model, query, select, option, populate) => {
	return model.findOne(query, select, { ...option, new: true }).populate(populate).lean().exec();
}

mainModuleExports.customModelFindByQuery = (model, query) => {
	return model.find(query).exec();
}
mainModuleExports.customModelFindByQueryLean = (model, query) => {
	return model.find(query).lean().exec();
}
mainModuleExports.customModelFindByQueryPopulate = (model, query, populate) => {
	return model.find(query).populate(populate).exec();
}
mainModuleExports.customModelFindByQueryPopulateLean = (model, query, populate) => {
	return model.find(query).populate(populate).lean().exec();
}
mainModuleExports.customModelFindByQuerySelectOption = (model, query, select, option) => {
	return model.find(query, select, { ...option, new: true }).exec();
}
mainModuleExports.customModelFindByQuerySelectOptionLean = (model, query, select, option) => {
	return model.find(query, select, { ...option, new: true }).lean().exec();
}
mainModuleExports.customModelFindByQuerySelectOptionPopulate = (model, query, select, option, populate) => {
	return model.find(query, select, { ...option, new: true }).populate(populate).exec();
}
mainModuleExports.customModelFindByQuerySelectOptionPopulateLean = (model, query, select, option, populate) => {
	return model.find(query, select, { ...option, new: true }).populate(populate).lean().exec();
}
mainModuleExports.customModelFindByQueryDistinct = (model, query, distinct) => {
	return model.find(query).distinct(distinct).exec();
}
mainModuleExports.customModelFindByQueryDistinctLean = (model, query, distinct) => {
	return model.find(query).distinct(distinct).lean().exec();
}

// update module
mainModuleExports.customModelUpdateById = (model, id, update, option) => {
	return model.findByIdAndUpdate(id, update, option);
}
mainModuleExports.customModelUpdateByIdLean = (model, id, update, option) => {
	return model.findByIdAndUpdate(id, update, { ...option, new: true }).lean().exec();
}
mainModuleExports.customModelUpdateByIdPopulate = (model, id, update, option, populate) => {
	return model.findByIdAndUpdate(id, update, { ...option, new: true }).populate(populate).exec();
}
mainModuleExports.customModelUpdateByIdPopulateLean = (model, id, update, option, populate) => {
	return model.findByIdAndUpdate(id, update, { ...option, new: true }).populate(populate).lean().exec();
}
mainModuleExports.customModelUpdateByQuery = (model, query, update, option) => {
	return model.findOneAndUpdate(query, update, option)
}
mainModuleExports.customModelUpdateByQueryLean = (model, query, update, option) => {
	return model.findOneAndUpdate(query, update, { ...option, new: true }).lean().exec();
}
mainModuleExports.customModelUpdateManyByQuery = (model, query, update, option) => {
	return model.updateMany(query, update, option)
}
mainModuleExports.customModelUpdateManyByQueryLean = (model, query, update, option) => {
	return model.updateMany(query, update, { ...option, new: true }).lean().exec();
}


// aggregate module
mainModuleExports.customModelAggregate = (model, aggregate) => {
	return model.aggregate(aggregate)
}


//Other
mainModuleExports.generatePassHash = (pass) => {
	return bcrypt.hash(pass, 10)
}
mainModuleExports.comparePassHash = (pass, hash) => {
	return bcrypt.compare(pass, hash);
}
mainModuleExports.generateRandonNum = (model, keyfind, queryFind, min = 1, max = 9999, retryTimes = (max - min)) => {
	return new Promise(async (resolve, reject) => {
		try {
			let counter = 0;
			async function run() {
				counter++;
				let num = await crypto.randomInt(min, max);
				let query = {};

				if (keyfind) query[keyfind] = num;

				let cek = await model.findOne({ $and: [query, ...queryFind ? [queryFind] : []] });
				// if (cek && new Date < cek.kadaluarsa) {
				if (cek) {
					if (counter >= retryTimes) {
						reject("gagal membaut nomer acak");
					} else {
						run();
					}
				} else {
					resolve(num);
				}
			}
			run();
		} catch (err) {
			reject()
		}
	})
}

mainModuleExports.generateRandonString = (model, keyfind, queryFind = { status: { $lt: 3 } }, length = 3) => {
	return new Promise(async (resolve, reject) => {
		try {
			let nopatterns = [
				'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
				'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
				// 'A','B','C','D','E','F','G','H','I','J','K','L','M',
				// 'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
				/* 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 , */ 0,
				'=', '+', '/'
			]
			async function run() {
				let num = await crypto.randomBytes(length).toString('base64').slice(0, length);
				let isValid = true;
				for (no of nopatterns) {
					if (num.indexOf(no) !== -1) {
						isValid = false;
						break;
					}
				}

				if (!isValid) {
					return await run();
				}

				let query = {};
				query[keyfind] = num;
				let cek = await model.findOne({ $and: [query, queryFind] });
				if (cek && new Date < cek.kadaluarsa) run();
				else resolve(num);
			}
			run();
		} catch (err) {
			reject()
		}
	})
}