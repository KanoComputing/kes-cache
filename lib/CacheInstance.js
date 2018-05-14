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
CacheInstance.prototype.get = async function get(query) {
    let result;
    const q = {};
    const { key: searchKey, value: searchValues } = split(query);
    try {
        if (Array.isArray(searchValues)) {
            q[searchKey] = { $in: searchValues };
            result = await _getMany.call(this, q);
        } else {
            q[searchKey] = searchValues;
            result = await _getOne.call(this, q);
        }
        return result;
    } catch (error) {
        throw error;
    }
};
CacheInstance.prototype.update = async function update(query, valuesToUpdate) {
    const { key: searchKey, value: searchValues } = split(query);
    const q = {};
    let result;

    if (Array.isArray(searchValues)) {
        q[searchKey] = { $in: searchValues };
    } else {
        q[searchKey] = searchValues;
    }

    try {
        result = await this._cache.update(q, valuesToUpdate);
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = CacheInstance;
