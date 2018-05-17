/**
 * cache/index.js
 * Entry point to cache module
 */
const Collection = require('./lib/Collection');

function Cache(options) {
    const collections = {};
    const gc = function getCollection(collectionName) {
        const collection = this._collections[collectionName];
        if (collection) {
            return collection;
        }
        throw new Error(`No cache collection ${collectionName} registered`);
    }.bind({ _collections: collections });
    gc._options = options;
    gc._collections = collections;
    Object.setPrototypeOf(gc, Cache.prototype);
    return gc;
}

Cache.prototype.create = function createCache(collectionName, options) {
    if (this._collections[collectionName]) {
        throw new Error(`Cache collection ${collectionName} already exists`);
    }
    this._collections[collectionName] = new Collection(collectionName, options);
};

module.exports = Cache;
