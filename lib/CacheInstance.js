/**
 * lib/CacheInstance.js
 * Create an instance of a data cache
 */

const datastore = require('nedb-promise');

const CacheInstance = function CacheInstance(cacheName, options) {
    this.cacheName = cacheName;
    this._cache = datastore();

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
CacheInstance.prototype.get = async function get(searchKey, searchValues) {
    let result;
    const query = {};
    try {
        if (Array.isArray(searchValues)) {
            query[searchKey] = { $in: searchValues };
            result = await _getMany.call(this, query);
        } else {
            query[searchKey] = searchValues;
            result = await _getOne.call(this, query);
        }
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = CacheInstance;
