const ElephantDB = require('./index');
const _ = require('lodash');

describe('add()', () => {

    test('it should support adding individual objects', () => {
        // Adding single objects
        const bruce = {name: 'Bruce'};
        const dogs = new ElephantDB(['dogs']).select('dogs');
        const newDog = dogs.add(bruce);
        expect(_.isEqual(bruce, newDog)).toBeTruthy();
    });

    test('it should support adding arrays of objects', () => {
        // Adding single objects
        const data = [{name: 'Bruce'}, {name: 'Winston'}];
        const dogs = new ElephantDB(['dogs']).select('dogs');
        const newDogs = dogs.add(data);
        expect(_.isEqual(data, newDogs)).toBeTruthy();
        expect(_.isEqual(data, dogs.findAll())).toBeTruthy();
    });

    test('it should throw if when called with invalid arguments', () => {
        const dogs = new ElephantDB(['dogs']).select('dogs');

        const invalidArgs = [
            [[function bar() {}, {a: '1'}]],
            [function foo() {}],
            [class Foo {}],
            [undefined],
            ['nope'],
            [false],
            [null],
            [NaN],
            [42],
            []
        ];

        invalidArgs.forEach(args => {
            function shouldError() {
                dogs.add.call(dogs, ...args);
            }
            expect(shouldError).toThrow();
        });
    });

    test('it should return a copy of added object', () => {
        const dogs = new ElephantDB(['dogs']).select('dogs');
        const newDog = {id: 0, name: 'Bruce', age: 5};
        const addedDog = dogs.add(newDog);

        addedDog.name = 'Poppy';
        newDog.name = 'Poppy';

        expect(dogs.find({id: 0}).name).toBe('Bruce');
    });
});

describe('find()', () => {

    let dogs = {};

    beforeEach(() => {
        dogs = new ElephantDB(['dogs']).select('dogs');
        dogs.add([
            {
                id: 5, name: 'Bruce', age: 2
            },
            {
                id: 3, name: 'Olive', age: 4
            }
        ]);
    });

    test('it should support the use of a fn as a query', () => {
        expect(dogs.find((dog) => dog.name === 'Bruce').id).toBe(5);
        expect(dogs.find((dog) => dog.age === 4).id).toBe(3);
    });

    test('it should support the use of an object as a query', () => {
        expect(dogs.find({name: 'Bruce'}).id).toBe(5);
        expect(dogs.find({age: 4}).id).toBe(3);
    });

    test('it should return undefined when a query does not match', () => {
        expect(dogs.find({name: 'Piggy'})).toBeUndefined();
        expect(dogs.find((dog) => dog.name === 'Piggy')).toBeUndefined();
    });

    test('it should return a copy of the found object', () => {
        const bruce = dogs.find({name: 'Bruce'});
        bruce.age = 6;
        expect(dogs.find({name: 'Bruce'}).age).toBe(2);
    });

    test('it should throw if when called with invalid arguments', () => {
        const invalidArgs = [
            [[function bar() {}, {a: '1'}]],
            [class Foo {}],
            [undefined],
            ['nope'],
            [false],
            [null],
            [NaN],
            [42],
            []
        ];

        invalidArgs.forEach(args => {
            function shouldError() {
                dogs.find.apply(dogs, args);
            }
            expect(shouldError).toThrow();
        });
    });
});

describe('findAll()', () => {

    let dogs = {};

    beforeEach(() => {
        dogs = new ElephantDB(['dogs']).select('dogs');
        dogs.add([
            {
                id: 5, name: 'Bruce', age: 2
            },
            {
                id: 3, name: 'Olive', age: 4
            }
        ]);
    });

    test('it should return everything when called without arguments or with an empty object', () => {
        const all = dogs.findAll();
        expect(all.length).toBe(2);

        const allAgain = dogs.findAll({});
        expect(allAgain.length).toBe(2);
    });

    test('it should support the use of a fn as a query', () => {
        expect(dogs.findAll((dog) => dog.name === 'Bruce').length).toBe(1);
        expect(dogs.findAll((dog) => dog.age < 5).length).toBe(2);
        expect(dogs.findAll((dog) => dog.age > 10).length).toBe(0);
    });

    test('it should support the use of an object as a query', () => {
        expect(dogs.findAll({name: 'Bruce'}).length).toBe(1);
        expect(dogs.findAll({age: 4}).length).toBe(1);
        expect(dogs.findAll({age: 4})[0].name).toBe('Olive');
    });

    test('it should return an empty list when nothing matches', () => {
        expect(dogs.findAll((dog) => dog.name === 'Piggy').length).toBe(0);
    });

    test('it should return a copy of found objects', () => {
        const allDogs = dogs.findAll();
        allDogs[0].age = 6;
        expect(dogs.findAll()[0].age).toBe(2);
    });

    test('it should throw if when called with invalid arguments', () => {
        const invalidArgs = [
            [[function bar() {}, {a: '1'}]],
            [class Foo {}],
            ['nope'],
            [false],
            [null],
            [NaN],
            [42]
        ];

        invalidArgs.forEach(args => {
            function shouldError() {
                dogs.findAll.apply(dogs, args);
            }
            expect(shouldError).toThrow();
        });
    });
});

describe('update()', () => {

    let dogs = {};

    beforeEach(() => {
        dogs = new ElephantDB(['dogs']).select('dogs');
        dogs.add([
            {
                id: 5, name: 'Bruce', age: 2
            },
            {
                id: 3, name: 'Olive', age: 4
            }
        ]);
    });

    test('it should support the use of an object to describe changes', () => {
        // Using a fn to query
        expect(dogs.update((dog) => dog.id === 5, { age: 6 }).age).toBe(6);
        expect(dogs.find({id: 5}).age).toBe(6);

        // Using an obj to query
        expect(dogs.update({id: 3}, { age: 6 }).age).toBe(6);
        expect(dogs.find({id: 3}).age).toBe(6);
    });

    test('it should support the use of a fn to change an object', () => {
        function changer(dog) {
            dog.age = dog.age * 2;
            return dog;
        }

        // Using an fn to query
        expect(dogs.update((dog) => dog.id === 5, { age: 6 }).age).toBe(6);
        expect(dogs.find({id: 5}).age).toBe(6);

        // Using an obj to query
        expect(dogs.update({ id: 3 }, changer).age).toBe(8);
        expect(dogs.find({id: 3}).age).toBe(8);
    });

    test('it should throw if not passed valid arguments', () => {
        const invalidArgs = [
            [[function bar() {}, {a: '1'}]],
            [class Foo {}],
            ['nope'],
            [false],
            [null],
            [NaN],
            [42],
            []
        ];

        invalidArgs.forEach(args => {
            function shouldError() {
                dogs.update.apply(dogs, args);
            }
            expect(shouldError).toThrow();
        });
    });

    test('it should return a copy of the update object', () => {
        const updatedDog = dogs.update({id: 3}, { age: 6 });
        updatedDog.age = 100;
        expect(dogs.find({id: 3}).age).toBe(6);
    });

});

describe('updateAll()', () => {

    let dogs = {};

    beforeEach(() => {
        dogs = new ElephantDB(['dogs']).select('dogs');
        dogs.add([
            {
                id: 5, breed: 'cocker spaniel', name: 'Bruce', age: 2
            },
            {
                id: 4, breed: 'labrador', name: 'Albert', age: 10
            },
            {
                id: 3, breed: 'cocker spaniel', name: 'Olive', age: 4
            }
        ]);
    });

    test('it should support updating multiple items using an object to describe changes', () => {
        // Using a fn as a query
        dogs.updateAll((dog) => dog.age < 5, { age: 7 });
        expect(dogs.find({ id: 5 }).age).toBe(7);
        expect(dogs.find({ id: 4 }).age).toBe(10);
        expect(dogs.find({ id: 3 }).age).toBe(7);

        // Using an object as a query
        dogs.updateAll({breed: 'cocker spaniel'}, { age: 8 });
        expect(dogs.find({ id: 5 }).age).toBe(8);
        expect(dogs.find({ id: 4 }).age).toBe(10);
        expect(dogs.find({ id: 3 }).age).toBe(8);
    });

    test('it should support updating multiple items using a fn', () => {
        function changer(dog) {
            dog.age = dog.age * 2;
            return dog;
        }

        // Using a fn as a query
        dogs.updateAll((dog) => dog.age < 5, changer);
        expect(dogs.find({ id: 5 }).age).toBe(4);
        expect(dogs.find({ id: 4 }).age).toBe(10);
        expect(dogs.find({ id: 3 }).age).toBe(8);

        // Using an object as a query
        dogs.updateAll({breed: 'cocker spaniel'}, changer);
        expect(dogs.find({ id: 5 }).age).toBe(8);
        expect(dogs.find({ id: 4 }).age).toBe(10);
        expect(dogs.find({ id: 3 }).age).toBe(16);
    });

    test('it should throw if not passed valid argument', () => {
        const invalidArgs = [
            [[function bar() {}, {a: '1'}]],
            [class Foo {}],
            ['nope'],
            [false],
            [null],
            [NaN],
            [42],
            []
        ];

        invalidArgs.forEach(args => {
            function shouldError() {
                dogs.updateAll.apply(dogs, args);
            }
            expect(shouldError).toThrow();
        });
    });

    test('it should return a copy of all updated objects', () => {
        const updatedDogs = dogs.updateAll({id: 3}, { age: 6 });
        updatedDogs[0].age = 100;
        expect(dogs.find({id: 3}).age).toBe(6);
    });

});


describe('dump()', () => {

    let db = {};

    const expected = {
        dogs: [
            {id: 5, name: 'Bruce', age: 2}
        ]
    };

    beforeEach(() => {
        db = new ElephantDB(['dogs']);
        db.select('dogs').add({
            id: 5, name: 'Bruce', age: 2
        });
    });

    test('it should return all store objects', () => {
        expect(_.isEqual(expected, db.dump())).toBeTruthy();
    });

    test('it should return a copy of stored objects', () => {
        const dump = db.dump();
        dump.foo = 'bar';
        expect(_.isEqual(expected, db.dump())).toBeTruthy();
    });
});


describe('delete()', () => {

    let animals = {};

    beforeEach(() => {
        animals = new ElephantDB(['animals']).select('animals');
        animals.add([
            {
                name: 'Bruce', animal: 'dog'
            },
            {
                name: 'Olive', animal: 'dog'
            }
        ]);
    });

    test('only one item is removed', () => {
        expect(animals.findAll().length).toBe(2);
        animals.delete({name: 'Bruce'});
        expect(animals.findAll().length).toBe(1);
        expect(animals.find({animal: 'dog'}).name).toBe('Olive');
    });

    test('the deleted item is returned', () => {
        const deleted = animals.delete({name: 'Bruce'});
        expect(deleted.name).toBe('Bruce');
    });

    test('the deleted item which is returned is a copy', () => {
        const bruce = animals.find({name: 'Bruce'});
        const deletedAnimal = animals.delete(bruce);
        deletedAnimal.name = 'Poppy';
        expect(bruce.name).toBe('Bruce');
    });

    test('should throw if called with an invalid argument', () => {
        const invalidArgs = [
            [[function bar() {}, {a: '1'}]],
            [class Foo {}],
            ['nope'],
            [false],
            [null],
            [NaN],
            [42],
            []
        ];

        invalidArgs.forEach(args => {
            function shouldError() {
                animals.delete.apply(animals, args);
            }
            expect(shouldError).toThrow();
        });
    });

    test('should return undefined when no object matched', () => {
        expect(animals.delete({name: 'Wat'})).toBeUndefined();
    });
});


describe('deleteAll()', () => {

    let animals = {};

    beforeEach(() => {
        animals = new ElephantDB(['animals']).select('animals');
        animals.add([
            {
                name: 'Bruce', animal: 'dog'
            },
            {
                name: 'Mr Muffins', animal: 'cat'
            },
            {
                name: 'Olive', animal: 'dog'
            }
        ]);
    });

    test('only one item is removed', () => {
        expect(animals.findAll().length).toBe(3);
        animals.deleteAll({animal: 'dog'});
        expect(animals.findAll().length).toBe(1);
        expect(animals.find({animal: 'cat'}).name).toBe('Mr Muffins');
    });

    test('the deleted item is returned', () => {
        const deleted = animals.deleteAll({name: 'Bruce'});
        expect(deleted[0].name).toBe('Bruce');
    });

    test('the deleted item which is returned is a copy', () => {
        const bruce = animals.find({name: 'Bruce'});
        const deletedAnimal = animals.delete(bruce);
        deletedAnimal.name = 'Poppy';
        expect(bruce.name).toBe('Bruce');
    });

    test('should throw if called with an invalid argument', () => {
        const invalidArgs = [
            [[function bar() {}, {a: '1'}]],
            [class Foo {}],
            ['nope'],
            [false],
            [null],
            [NaN],
            [42],
            []
        ];

        invalidArgs.forEach(args => {
            function shouldError() {
                animals.delete.apply(animals, args);
            }
            expect(shouldError).toThrow();
        });
    });

    test('should return undefined when no object matched', () => {
        expect(animals.delete({name: 'Wat'})).toBeUndefined();
    });
});
