/**
 * cache/index.js
 * Entry point to cache module
 */
const CI = require('./lib/CacheInstance');

function Cache(options) {
    const caches = {};
    const gc = function getCache(cacheName) {
        const cache = this._caches[cacheName];
        if (cache) {
            return cache;
        }
        throw new Error(`No model ${cacheName} registered`);
    }.bind({ _caches: caches });
    gc._options = options;
    gc._caches = caches;
    Object.setPrototypeOf(gc, Cache.prototype);
    return gc;
}

Cache.prototype.create = function createCache(cacheName, options) {
    this._caches[cacheName] = new CI(cacheName, options);
};

module.exports = Cache;
