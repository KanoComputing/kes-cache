/* global describe it beforeEach */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
const assert = require('chai').assert;
const Cache = require('../index');
const CI = require('../lib/CacheInstance');

describe('Cache', function () {
    const cache = new Cache();
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
    beforeEach(async function () {
        cache.create('Users');
        await cache('Users').add(JSON.parse(JSON.stringify(udata)));
    });
    describe('Cache creation test', function () {
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
        it('should store data to a cache', async function () {
            const getData = await cache('Users')._cache.findOne({ id: 1 });
            assert.deepInclude(getData, udata[0]);
        });
        it('should return, by id, data that is stored', async function () {
            const getData = await cache('Users').get({ id: 1 });
            assert.deepEqual(getData, udata[0]);
        });
        it('should return, by username, data that is stored', async function () {
            const getData = await cache('Users').get({ username: 'user1' });
            assert.deepEqual(getData, udata[0]);
        });
        it('should return null if no data is stored for that username', async function () {
            const getData = await cache('Users').get({ username: 'user3' });
            assert.isNull(getData);
        });
        it('should return an array of data that is stored if get by id list', async function () {
            const getData = await cache('Users').get({ id: [1, 2, 3] });
            assert.isArray(getData);
            assert.sameDeepMembers(getData, udata);
        });
        it('should return an array of data if list contains ids that do and don\'t exists', async function () {
            const getData = await cache('Users').get({ id: [1, 2, 3] });
            assert.isArray(getData);
            assert.sameDeepMembers(getData, udata);
        });
        it('should return an empty array if no data is stored for that list of ids', async function () {
            const getData = await cache('Users').get({ id: [3, 4, 5] });
            assert.isEmpty(getData);
        });
        it('should return an array of data that is stored if get by username list', async function () {
            const getData = await cache('Users').get({ username: ['user1', 'user2'] });
            assert.isArray(getData);
            assert.sameDeepMembers(getData, udata);
        });
        it('should return an empty array if no data is stored for that list of usernames', async function () {
            const getData = await cache('Users').get({ username: ['user3', 'user4'] });
            assert.isEmpty(getData);
        });
    });
    describe('Update cache', function () {
        it('should update a single property of a single object', async function () {
            await cache('Users').update({ username: 'user1' }, { bio: 'I create art!' });
            const getData = await cache('Users').get({ username: 'user1' });
            assert.equal(getData.bio, 'I create art!');
        });
        it('should update a single property of a set of objects', async function () {
            await cache('Users').update({ username: ['user1', 'user2'] }, { bio: 'I create art!' });
            const getData = await cache('Users').get({ username: ['user1', 'user2'] });
            assert.equal(getData[0].bio, 'I create art!');
            assert.equal(getData[1].bio, 'I create art!');
        });
        it('should update multiple properties of a single object', async function () {
            const updateData = {
                bio: 'I create art!',
                avatar: { head: 'happy' },
            };
            await cache('Users').update({ username: 'user1' }, updateData);
            const getData = await cache('Users').get({ username: 'user1' });
            assert.equal(getData.bio, 'I create art!');
            assert.equal(getData.avatar.head, 'happy');
        });
        it('should update multiple properties of a set of objects', async function () {
            const updateData = {
                bio: 'I create art!',
                avatar: { head: 'happy' },
            };
            await cache('Users').update({ username: ['user1', 'user2'] }, updateData);
            const getData = await cache('Users').get({ username: ['user1', 'user2'] });
            assert.equal(getData[0].bio, 'I create art!');
            assert.equal(getData[0].avatar.head, 'happy');
            assert.equal(getData[1].bio, 'I create art!');
            assert.equal(getData[1].avatar.head, 'happy');
        });
        it('should update an array property of a single object', async function () {
            await cache('Users').pushToArray({ username: 'user1' }, { followers: 888 });
            const getData = await cache('Users').get({ username: 'user1' });
            assert.include(getData.followers, 888, 'followers contains new id');
        });
        it('should update an array property of a single object only if item does not exist in array', async function () {
            await cache('Users').addToSet({ username: 'user1' }, { followers: 888 });
            await cache('Users').addToSet({ username: 'user1' }, { followers: 888 });
            const getData = await cache('Users').get({ username: 'user1' });
            assert.include(getData.followers, 888, 'followers contains new id');
            const compareArray = JSON.parse(JSON.stringify(udata[0].followers));
            compareArray.push(888);
            assert.deepEqual(getData.followers, compareArray, 'followers contains new id');
        });
        it('should replace a single object', async function () {
            const currObj = await cache('Users')._cache.findOne({ id: 1 });
            const currObjId = currObj._id;
            const newObj = { username: 'user3', bio: 'I create art!' };
            await cache('Users').replace({ id: 1 }, newObj);
            const getData = await cache('Users').get({ _id: currObjId });
            assert.notDeepEqual(getData, udata[0]);
            assert.deepEqual(getData, newObj);
        });
    });
    describe('Remove from cache', function () {
        it('should remove a single object from the cache', async function () {
            let getData = await cache('Users').get({ id: 1 });
            assert.deepEqual(getData, udata[0], 'record 1 exists');
            let getData2 = await cache('Users').get({ id: 2 });
            assert.deepEqual(getData2, udata[1], 'record 2 exists');

            await cache('Users').remove({ id: 1 });

            getData = await cache('Users').get({ id: 1 });
            assert.isNull(getData, 'record 1 is removed');
            getData2 = await cache('Users').get({ id: 2 });
            assert.deepEqual(getData2, udata[1], 'record 2 still exists');
        });
        it('should remove all objects from the cache in a list of ids', async function () {
            const getData = await cache('Users').get({ id: [1, 2] });
            assert.sameDeepMembers(getData, udata, 'does the data to be deleted exist?');
            await cache('Users').remove({ id: [1, 2] });
            const getData2 = await cache('Users').get({ id: [1, 2] });
            assert.isEmpty(getData2, 'get returns an empty array, records removed');
        });
        it('should remove an item from an array property on an single cached object', async function () {
            let getData = await cache('Users').get({ id: 1 });
            assert.include(getData.following, 567, 'follower 567 is in the following array');
            await cache('Users').removeFromArray({ id: 1 }, { following: 567 });
            getData = await cache('Users').get({ id: 1 });
            assert.notInclude(getData.following, 567, 'follower 567 is removed');
        });
        it('should remove all items in a list from an array property on an single cached object', async function () {
            let getData = await cache('Users').get({ id: 1 });
            assert.includeMembers(getData.following, [567, 654], 'follower 567 and 654 are in the following array');
            await cache('Users').removeFromArray({ id: 1 }, { following: [567, 654] });
            getData = await cache('Users').get({ id: 1 });
            assert.notIncludeMembers(getData.following, [567, 654], 'follower 567 and 654 are removed');
        });
        it('should remove all items in a list from an array property on all cached object in a list', async function () {
            let getData = await cache('Users').get({ id: 1 });
            assert.includeMembers(getData.following, [567, 654], 'doc1: follower 567 and 654 are in the following array');
            let getData2 = await cache('Users').get({ id: 2 });
            assert.includeMembers(getData2.following, [567, 654], 'doc2: follower 567 and 654 are in the following array');

            await cache('Users').removeFromArray({ id: [1, 2] }, { following: [567, 654] });
            getData = await cache('Users').get({ id: 1 });
            assert.notIncludeMembers(getData.following, [567, 654], 'doc1: follower 567 and 654 are removed');
            getData2 = await cache('Users').get({ id: 2 });
            assert.notIncludeMembers(getData2.following, [567, 654], 'doc2: follower 567 and 654 are removed');
        });
    });
});
