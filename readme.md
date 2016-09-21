
# ElephantDB 🐘
[![CircleCI](https://circleci.com/gh/mattvagni/elephant-db.svg?style=svg)](https://circleci.com/gh/mattvagni/elephant-db)

ElephantDB is a is a super simple in-memory node database. It supports adding, deleting, updating & querying. It is synchronous & is designed to be used when prototyping or stubbing APIs etc.
```bash
npm install --save elephant-db
```

## Basic Example
This is a basic example which creates a db, adds some items & retrieves them.
```js
const ElephantDB = require('elephant-db');

// You can set up different collections based like this. Collections
// are kind of like tables in which your data can and will be stored.
const db = new ElephantDB(['dogs', 'people']);

// You can add a single document like so:
db.select('people').add({
    id: 1, name: 'Steve', age: 38, job: 'developer'
});

// You can add multiple documents like so:
db.select('dogs').add([
    {
        id: 1, breed: 'Dachshund', hair: 'Short', name: 'Olive', age: 2
    },
    {
        id: 2, breed: 'Labrador', hair: 'Short', name: 'Albert', age: 10
    },
    {
        id: 3, breed: 'Cocker Spaniel', hair: 'Long', name: 'Bruce', age: 4
    }
]);

// You can then retrieve a single documents like so:
db.select('dogs').find({id: 3});
// {id: 3, breed: 'Cocker Spaniel', name: 'Bruce', age: 4}

// You can also find multiple documents:
db.select('dogs').findAll({hair: 'Short'});
// [
//     {id: 1, breed: 'Dachshund', hair: 'Short', name: 'Olive', age: 2},
//     {id: 2, breed: 'Labrador', hair: 'Short', name: 'Albert', age: 10}
// ]

// You can also provide a function to find documents:
db.select('dogs').findAll((dog) => dog.age < 5);
// [
//     {id: 1, breed: 'Dachshund', hair: 'Short', name: 'Olive', age: 2},
//     {id: 3, breed: 'Cocker Spaniel', hair: 'Long', name: 'Bruce', age: 4}
// ]
```

## Full API
For examples check the tests.

#####`ElephantDB([String])`
Constructor to create an instance of ElephantDB. It takes a single array of string where each string is the name of a collection.

#####`.select(String)`
Selects a single collection within which you would like to find, delete, update etc.

#####`.find({}|fn)`
Finds & returns the first document that matches. Takes either an object or function to find you a document. You can use an object that defines your query (e.g. `.find({name: 'John'})` to find the first document with the name of John). Alternatively you can use a function that returns true or false base on whether a document matches (e.g. `.find((person) => person.age <= 30)`)

#####`.findAll({}|fn)`
Same as `.find()` but returns an array of all documents that match. If called without a query, returns all documents in the selected collection.

#####`.update({}|fn, {}|fn)`
Finds & returns the first document that matches (like `.find()`) and updates that document. For example: `.update({id: 1}, {age: 15})` would find a dog with the id of 1 and set it's age to 15 (in the example above). Alternatively a function can be used to update the document: `.update({id: 1}, (dog) => { dog.age = dog.age*2; })`

#####`.updateAll({}|fn, {}|fn)`
Same as `update()` but updates all documents that matches.

#####`.delete({}|fn)`
Deletes & returns the first document that matches.

#####`.deleteAll({}|fn)`
Deletes & returns all documents that match.

#####`.dump()`
Returns all collections and stored objects.
