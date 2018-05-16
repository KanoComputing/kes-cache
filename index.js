/**
 * cache/index.js
 * Entry point to cache module
 */
const Collection = require('./lib/Collection');

function Cache(options) {
    const caches = {};
    const gc = function getCache(cacheName) {
        const cache = this._caches[cacheName];
        if (cache) {
            return cache;
        }
        throw new Error(`No cache collection ${cacheName} registered`);
    }.bind({ _caches: caches });
    gc._options = options;
    gc._caches = caches;
    Object.setPrototypeOf(gc, Cache.prototype);
    return gc;
}

Cache.prototype.create = function createCache(cacheName, options) {
    if (this._caches[cacheName]) {
        throw new Error(`Cache collection ${cacheName} already exists`);
    }
    this._caches[cacheName] = new Collection(cacheName, options);
};

module.exports = Cache;
