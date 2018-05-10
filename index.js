/**
 * cache/index.js
 * Entry point to cache module
 */
const Cache = require('./lib/CacheInstance');

const caches = {};

module.exports = function getCache(cacheName) {
    const cache = caches[cacheName];
    if (cache) {
        return cache;
    }
    throw new Error(`No model ${cacheName} registered`);
};

module.exports.create = function createCache(cacheName) {
    caches[cacheName] = new Cache(cacheName);
};
