# 🚧 Not used in production.
Russell: "This is a library I wrote to use for middle tier caching on worldapi. I never got round to using it, but I guarantee it would increase the load the api could take by a huge amount. I will cover what it was meant to do in another section"

# Kano Services Middle Tier Caching
A caching library for use in kano service development.

Any service that returns relatively non-volatile data should make use of caching throughout the service stack. This library is intended for use on the middle tier of a data producing service as an in memory cache for responding to data request.
## Getting started
Add the lib as a dependency to your kano service project
```json
{
    "dependencies": {
        "ks-cache": "KanoComputing/ks-cache#semver:^v1.0"
    }
}
```
Then you can set up a cache
```js
const Cache = require('ks-cache');

const cache = new Cache();
cache.create('Users');

/* Now we can access our cache by the label we gave it in order to add data */
cache('myCache').add({ id: 3456, username: 'cacheMeQuick' })
    .then(async () => {
    /* And now if we need it we can go get it! */
        let user = await cache('myCache').get({ id: 3456 });
        console.log(user);
        /* { id: 3456, username: "cacheMeQuick" } */

        user = await cache('myCache').get({ username: 'cacheMeQuick' });
        console.log(user);
    /* { id: 3456, username: "cacheMeQuick" } */
    });
```
## API
The current implementation uses an in memory javascript db called [nedb](). For this reason the api, with the exception of `Cache#create`, is asynchronous and all operations return a promise.
* [Instantiating the Cache library](#instantiating-the-cache-library)
* [Creating a cache instance](#creating-a-cache-instance)
* [Adding data](#adding-data)
* [Retrieving data](#retrieving-data)
* [Update existing data](#update-existing-data)
* [Removing data](#removing-data)
### Instantiating the Cache library
The cache library is instantiated to allow for a configuration to be passed to each instance. Most likely you will only need one instance of the cache library, but in the case you want to allocate different options to different cachable data it is possible to instantiate the library multiple times.

The constructor is used as follows, `new Cache(options)` where options is an object with the following fields:
* `limit` (optional): A limit to the number of entries in all caches created with this instance of the library.
* `timestampData` (optional):  timestamp the insertion and last update of all items in the cache, with the fields createdAt and updatedAt. If the data stored in the cache already contains these fields those values will take precedence and this option will be ignored.

```js
const Cache = require('ks-cache');

const options = {
    limit: 10000,
    timestampData: false
}
global.cache = new Cache(options);
```
### Creating a cache instance
Data can be cached in "collections" to facilitate easy of searching and retrieving. Create a cache by passing a string that can be used to identify the cache when it is needed.
```js
cache.create('myCache');
cache('myCache'); // returns a Collection object instance
```
If you try to create a collection with a label that is already registered the `create` function will throw and error. Equally if you try to retrieve a collection that has not been created, an error is thrown.

`Cache#create` is used as `cache.create(options)` where options is an object with the following properties:
* `searchFields` (optional): An array of properties on objects stored in the cache that you are going to search the cache on. This will internally add an index to those fields and improve search efficiency.
* `ttl` (optional): Add a time to live on all objects in the cache that contain the `field` property given below.
    * `field`: The field that is used to calculate ttl expiry (must be a `date`)
    * `duration`: The time in seconds from the date given in the `field` above before the data is expired.
```js
/** Create a cache with indexes on id and username.
  * Remove documents one second after the date stored in the TTL field */
const options = {
    searchFields: ['id', 'username'],
    ttl: { field: 'TTL', duration: 1 },
};
cache.create('myCache', options);

/* If we add a document with a TTL data of now */
cache('myCache').add({ id: 3456, username: 'cacheMeQuick', TTL: new Date() })
    .then(async () => {

        /* We can get that document back*/
        const user = await cache('myCache').get({ id: 3456 });
        console.log(user);
        /* { id: 3456, username: 'cacheMeQuick', TTL: '2018-05-16T13:39:48.670Z') } */

        /* But after one second it is removed from the cache.*/
        setTimeout(async () => {
            const expiredUser = await cache('myCache').get({ id: 3456 });
            console.log(expiredUser);
            /* null */
        }, 1500);
    });
```
### Adding data
The native types are String, Number, Boolean, Date and null. You can also use arrays and objects. __Please note that if a field is undefined, it will not be saved__. Field names cannot begin by '$' or contain a '.'.
```js
const doc = {
    hello: 'world'
    n: 5,
    today: new Date(),
    trueOrFalse: true,
    notThere: null,
    notToBeSaved: undefined  // Will not be saved,
    fruits: [ 'apple', 'orange', 'pear' ],
    infos: { name: 'ks-cache' },
};
cache('myCache').add(doc)
    .then((cachedDoc) => {
        /* cachedDoc does not contain a field notToBeSaved as its value is undefined */
    });
```
You can also add an array of documents to the cache. This operation is atomic, meaning that if one insert fails for any reason all changes are rolled back.
```js
cache('myCache').add({ $id: 3456 }, { id: 10 })
    .catch(async (e) => {
        console.log(e.message); // Field names cannot begin with the $ character

        const user = await cache('myCache').get({ id: 10 });
        console.log(user); // null
    });
```
### Retrieving data
Data is retrieved from the cache by a simple search on one of the properties on the stored data object. Properties are matched on equality to a search value or one of a list of search values, give as an array.
```js
/** Our cache contains the following collection */
// { id: 1, username: 'user1', bio: 'Hi, see my creations!', following: [567, 654, 23, 16], followers: [16, 2, 480, 572]}
// { id: 2, username: 'user2', bio: "Hi, I'm here too!", following: [999, 340, 23, 1], followers: [1, 480, 572] }
// { id: 3, username: 'user3', bio: "Cool Caching!", following: [567, 654, 23, 1], followers: [1, 2, 840, 572] }
cache('myCache').get({ id: 1 })
    .then((data) => {
        /* data is the object with username user1 */
        /* If no data matches null is returned. */
    });
/* The search values can be an array to match more than one object in the cache */
cache('myCache').get({ id: [1, 3] })
    .then((objs) => {
        /* objs is an array containing data for user1 and user3 */
        /* if no objs match the search obj is equal to [] */
    });
```
__Retrieving data from the cache is intended to be done using unique search fields. If the search field matches more than one object only the first will be returned__ This behaviour will only be updated if we find a use case for searching by non unique fields.
### Update existing data
Our cache strategy is to keep the cache up to date rather than invalidate data. To this end we provide an `Collection#update` function to update data objects that exist in a cache "collection".
```js
// { id: 1, username: 'user1', bio: 'Hi, see my creations!', following: [567, 654, 23, 16], followers: [16, 2, 480, 572]}
// { id: 2, username: 'user2', bio: "Hi, I'm here too!", following: [999, 340, 23, 1], followers: [1, 480, 572] }
cache('myCache').update({ username: 'user1' }, { bio: 'I create art!' })
    .then( async () => {
        const getData = await cache('myCache').get({ username: 'user1' });
        console.log(getData.bio); // I create art!
    });

/** Update more than one object in the cache at the same time.
  * Uses the same search syntax as `Collection#get` */
cache('myCache').update({ username: ['user1', 'user2'] }, { bio: 'I create art!' })
    .then( async () => {
        const getData = await cache('myCache').get({ username: ['user1', 'user2'] });
        console.log(getData[0].bio); // 'I create art!'
        console.log(getData[1].bio); // 'I create art!'
    });

/** We can also update more than one property on data in the cache.
  * Again this can be one or more objects depending on the search values passed. */
const updateData = {
    bio: 'I create art!',
    avatar: { head: 'happy' },
};
cache('myCache').update({ username: 'user1' }, updateData)
    .then( async () => {
        const getData = await cache('myCache').get({ username: 'user1' });
        console.log(getData.bio); // 'I create art!'
        console.log(getData.avatar.head); // 'happy'
    });
```
#### Arrays
The cache collection offers two functions for updating values in properties of the data that are arrays. `Collection#pushToArray` that will always add an element to the array property and `Collection#addToSet` that will only add an element if it does not already exists in the array.
```js
// { id: 1, username: 'user1', bio: 'Hi, see my creations!', following: [567, 654, 23, 16], followers: [16, 2, 480, 572]}
cache('myCache').pushToArray({ username: 'user1' }, { followers: 888 })
    .then(async () => {
        const getData = await cache('myCache').get({ username: 'user1' });
       console.log(getData.followers); // [16, 2, 480, 572, 888]
    });
cache('myCache').pushToArray({ username: 'user1' }, { followers: 888 })
    .then(async () => {
        const getData = await cache('myCache').get({ username: 'user1' });
       console.log(getData.followers); // [16, 2, 480, 572, 888, 888]
    });

/** Use addToSet if the array is intended to not have duplicates
  * Note however that this does not remove duplicates that existed when the data was added */

/* Add 888 once */
cache('myCache').addToSet({ username: 'user1' }, { followers: 888 })
    .then(async () => {
        /* Add 888 for a second time */
        await cache('myCache').addToSet({ username: 'user1' }, { followers: 888 })
        const getData = await cache('myCache').get({ username: 'user1' });
        /* It still only appears once */
        console.log(getData.followers); // [16, 2, 480, 572, 888]
    });
```
To update and array property by removing one or more elements you can use the `Collection#removeFromArray` function.
```js
// { id: 1, username: 'user1', bio: 'Hi, see my creations!', following: [567, 654, 23, 16], followers: [16, 2, 480, 572]}

cache('Users').removeFromArray({ id: 1 }, { following: 567 })
    .then(async () => {
        const getData = await cache('Users').get({ id: 1 });
        console.log(getData.following); // [654, 23, 16]
    });

/* Or specify a list of elements to remove */
await cache('Users').removeFromArray({ id: 1 }, { following: [567, 654] })
    .then(async () => {
        const getData = await cache('Users').get({ id: 1 });
        console.log(getData.following); // [23, 16]
    });

/* You can remove a list of elements from a list of data objects in the cache collection like so */

// { id: 1, username: 'user1', bio: 'Hi, see my creations!', following: [567, 654, 23, 16], followers: [16, 2, 480, 572]}
// { id: 2, username: 'user2', bio: "Hi, I'm here too!", following: [567, 654, 999, 1], followers: [1, 480, 572] }
cache('Users').removeFromArray({ id: [1, 2] }, { following: [567, 654] })
    .then(() => {
        getData = await cache('Users').get({ id: 1 });
        console.log(getData.following) // [23, 16]
        getData = await cache('Users').get({ id: 2 });
        console.log(getData.following) // [999, 1]
    })
```
#### Replace an object
If for any reason you wish to replace an entire object in the cache collection you can use the `Collection#replace` function.
```js
 // { id: 1, username: 'user1', bio: 'Hi, see my creations!', following: [567, 654, 23, 16], followers: [16, 2, 480, 572]}
const newObj = { username: 'user3', bio: 'I create art!' };
cache('myCache').replace({ id: 1 }, newObj)
    .then(async () => {
        let getData = await cache('myCache').get({ id: 1 });
        console.log(getData); // null
        getData = await cache('myCache').get({ username: 'user3' });
        console.log(getData); // { username: 'user3', bio: 'I create art!' }
    });
```
### Removing data
To remove data from the cache call `Collection#remove`.
```js
// { id: 1, username: 'user1', bio: 'Hi, see my creations!', following: [567, 654, 23, 16], followers: [16, 2, 480, 572]}
// { id: 2, username: 'user2', bio: "Hi, I'm here too!", following: [567, 654, 999, 1], followers: [1, 480, 572] }

cache('myCache').remove({ id: 1 })
    .then(async () => {
        const getData = await cache('myCache').get({ id: 1 });
        console.log(getData) // null
    });
 
cache('myCache').remove({ id: [1, 2] })
    .then(async () => {
        const getData = await cache('myCache').get({ id: [1, 2] });
        console.log(getData) // []
    });
```
