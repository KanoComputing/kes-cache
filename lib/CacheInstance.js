/**
 * lib/CacheInstance.js
 * Create an instance of a data cache
 */

const datastore = require('nedb-promise');

function split(obj) {
    const items = [];
    const keys = Object.keys(obj);
    keys.forEach((k) => {
        const kv = {};
        kv.key = k;
        kv.value = obj[k];
        items.push(kv);
    });
    return items[0];
}
const CacheInstance = function CacheInstance(cacheName, options) {
    this.cacheName = cacheName;
    this._cache = datastore();

    if (options) {
        const { searchFields, ttl } = options;
        if (searchFields) {
            searchFields.forEach((idx) => {
                this._cache.ensureIndex({ fieldName: idx });
            });
        }
        if (ttl) {
            this._cache.ensureIndex({
                fieldName: ttl.field,
                expireAfterSeconds: ttl.duration,
            });
        }
    }
};

async function _getOne(query) {
    let result;
    try {
        result = await this._cache.findOne(query, { _id: 0 });
        return result;
    } catch (error) {
        throw error;
    }
}
async function _getMany(query) {
    let result;
    try {
        result = await this._cache.find(query, { _id: 0 });
        return result;
    } catch (error) {
        throw error;
    }
}

CacheInstance.prototype.add = async function add(doc) {
    let nd;
    try {
        nd = await this._cache.insert(doc);
        return nd;
    } catch (error) {
        throw error;
    }
};
CacheInstance.prototype.addToSet = async function addToSet(query, valuesToAdd) {
    const q = {};
    let vals = {};
    const opts = { multi: false };
    let result;

    const { key: searchBy, value: searchValues } = split(query);
    if (Array.isArray(searchValues)) {
        q[searchBy] = { $in: searchValues };
        opts.multi = true;
    } else {
        q[searchBy] = searchValues;
    }

    const { key: propToAddTo, value: values } = split(valuesToAdd);
    if (Array.isArray(values)) {
        vals[propToAddTo] = { $each: values };
    } else {
        vals = valuesToAdd;
    }
    try {
        result = await this._cache.update(q, { $addToSet: vals }, opts);
        return result;
    } catch (error) {
        throw error;
    }
};
CacheInstance.prototype.get = async function get(query) {
    let result;
    const q = {};
    const { key: searchBy, value: searchValues } = split(query);
    try {
        if (Array.isArray(searchValues)) {
            q[searchBy] = { $in: searchValues };
            result = await _getMany.call(this, q);
        } else {
            q[searchBy] = searchValues;
            result = await _getOne.call(this, q);
        }
        return result;
    } catch (error) {
        throw error;
    }
};
CacheInstance.prototype.pushToArray = async function pushToArray(query, valuesToPush) {
    const q = {};
    let vals = {};
    const opts = { multi: false };
    let result;

    const { key: searchBy, value: searchValues } = split(query);
    if (Array.isArray(searchValues)) {
        q[searchBy] = { $in: searchValues };
        opts.multi = true;
    } else {
        q[searchBy] = searchValues;
    }

    const { key: propToPushTo, value: values } = split(valuesToPush);
    if (Array.isArray(values)) {
        vals[propToPushTo] = { $each: values };
    } else {
        vals = valuesToPush;
    }
    try {
        result = await this._cache.update(q, { $push: vals }, opts);
        return result;
    } catch (error) {
        throw error;
    }
};
CacheInstance.prototype.remove = async function remove(query, options) {
    const q = {};
    const opts = options || {};
    let result;
    const { key: searchBy, value: searchValues } = split(query);
    if (Array.isArray(searchValues)) {
        q[searchBy] = { $in: searchValues };
        opts.multi = true;
    } else {
        q[searchBy] = searchValues;
    }
    try {
        result = await this._cache.remove(q, opts);
        return result;
    } catch (error) {
        throw error;
    }
};
CacheInstance.prototype.removeFromArray = async function removeFromArray(query, valuesToRemove) {
    const q = {};
    let vals = {};
    const opts = { multi: false };
    let result;

    const { key: searchBy, value: searchValues } = split(query);
    if (Array.isArray(searchValues)) {
        q[searchBy] = { $in: searchValues };
        opts.multi = true;
    } else {
        q[searchBy] = searchValues;
    }

    const { key: propToRemoveFrom, value: values } = split(valuesToRemove);
    if (Array.isArray(values)) {
        vals[propToRemoveFrom] = { $in: values };
    } else {
        vals = valuesToRemove;
    }
    try {
        result = await this._cache.update(q, { $pull: vals }, opts);
        return result;
    } catch (error) {
        throw error;
    }
};
CacheInstance.prototype.replace = async function replace(query, valuesToUpdate) {
    const { key: searchBy, value: searchValues } = split(query);
    const q = {};
    const opts = { multi: false };
    let result;

    if (Array.isArray(searchValues)) {
        q[searchBy] = { $in: searchValues };
        opts.multi = true;
    } else {
        q[searchBy] = searchValues;
    }

    try {
        result = await this._cache.update(q, valuesToUpdate, opts);
        return result;
    } catch (error) {
        throw error;
    }
};
CacheInstance.prototype.update = async function update(query, valuesToUpdate) {
    const { key: searchBy, value: searchValues } = split(query);
    const q = {};
    const opts = { multi: false };
    let result;

    if (Array.isArray(searchValues)) {
        q[searchBy] = { $in: searchValues };
        opts.multi = true;
    } else {
        q[searchBy] = searchValues;
    }

    try {
        result = await this._cache.update(q, { $set: valuesToUpdate }, opts);
        return result;
    } catch (error) {
        throw error;
    }
};
module.exports = CacheInstance;
