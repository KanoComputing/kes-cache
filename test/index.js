/* global describe it */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
const assert = require('chai').assert;
const Cache = require('../index');
const CI = require('../lib/CacheInstance');

describe('Cache', function () {
    describe('Cache creation test', function () {
        const cache = new Cache();
        cache.create('Users');
        it('returns a created cache by label', function () {
            assert(cache('Users') instanceof CI);
        });
        it('throws an error if the label does not represent a cache', function () {
            const err = Error('No model Shares registered');
            assert.throws(
                () => {
                    try {
                        cache('Shares');
                    } catch (e) {
                        throw e;
                    }
                },
                err.message,
            );
        });
    });
    describe('Add to cache', function () {
        const udata = [{
            id: 1,
            username: 'user1',
            roles: [],
            joined: '2018-04-19T08:51:57.981149',
            modified: '2018-04-19T08:51:57.981149',
            bio: 'Hi, see my creations!',
            avatar: {},
            following: [567, 654, 23, 16],
            followers: [16, 278, 480, 572],
        }, {
            id: 2,
            username: 'user2',
            roles: [],
            joined: '2018-04-19T08:51:57.981149',
            modified: '2018-04-19T08:51:57.981149',
            bio: "Hi, I'm here too!",
            avatar: {},
            following: [567, 654, 23, 16],
            followers: [16, 278, 480, 572],
        }];
        it('should store data to a cache', async function () {
            const cache = new Cache();
            cache.create('Users');
            await cache('Users').add(udata);
            const getData = await cache('Users')._cache.findOne({ id: 1 });
            assert.deepInclude(getData, udata[0]);
        });
        it('should return data that is stored', async function () {
            const cache = new Cache();
            cache.create('Users');
            await cache('Users').add(udata);
            const getData = await cache('Users').get({ id: 1 });
            assert.deepInclude(getData, udata[0]);
        });
    });
});

