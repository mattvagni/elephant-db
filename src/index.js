'use strict';

const _isPlainObject = require('lodash/isPlainObject');
const _isFunction = require('lodash/isFunction');
const _isEqual = require('lodash/isEqual');
const _isArray = require('lodash/isArray');
const _cloneDeep = require('lodash/cloneDeep');
const _differenceWith = require('lodash/differenceWith');

// Validates a query
function validateQuery(query, methodName) {
    if (!_isPlainObject(query) && !_isFunction(query)) {
        throw new Error(`Incorrect query argument given to ${methodName}(). The ${methodName} method either takes an object or a function as a query.`);
    }
}

// Validates update() & updateAll() arguments
function validateUpdateArguments(query, changes, methodName) {
    validateNumberOfArguments(arguments, 2, methodName);
    validateQuery(query, methodName);

    if (!_isPlainObject(changes) && !_isFunction(changes)) {
        throw new Error(`Incorrect 2nd argument given to ${methodName}() expected an object or a function.`);
    }
}

// Validates that there are at least as many arguments expected.
function validateNumberOfArguments(args, expected, methodName) {
    if (args.length < expected) {
        throw new Error(`${methodName}() was called with the incorrect number of arguments. Expected ${expected} argument${(expected > 1) ? 's' : ''} but received ${args.length}.`);
    }
}

class ElephantDBQuery {

    constructor(slice, db) {
        this._db = db;
        this._slice = slice;
    }

    /**
     * Get & set the slice which was selected.
     */
    _getSlice(){
        return this._db.get(this._slice);
    }
    _setSlice(val){
        return this._db.set(this._slice, val);
    }

    /**
     * Internal find method that implements find() & findAll()
     *
     * @param {(object|function)} query
     * @param {string} methodName The public method name that is internally calling this. Used for nice error logging.
     * @param {string} arrayMethod
     *
     */
    _find(query, arrayMethod){
        if (_isFunction(query)) {
            return this._getSlice()[arrayMethod](query);
        }

        // If the query is an empty object when findingAll return everything.
        if (arrayMethod === 'filter' && Object.keys(query).length === 0) {
            return this._getSlice();
        }

        return this._getSlice()[arrayMethod](obj => Object.keys(query).every(key => {
            return _isEqual(obj[key], query[key]);
        }));
    }

    /**
     * Internal method that implements update() & updateAll()
     */
    _update(query, changes, methodName) {
        validateQuery(query, methodName);

        if (!_isPlainObject(changes) && !_isFunction(changes)){
            throw new Error(
                `Invalid second argument passed to ${methodName}(). You can either provide an object or a function. You passed ${changes} after having selected '${this._slices}'`
            );
        }

        function updater(obj) {
            if (!obj) {
                throw new Error(
                    `You tried to update an object that didn\'t exist. You queried for object(s) to update using ${query}`
                );
            }

            if (_isFunction(changes)) {
                return changes(obj);
            } else {
                return Object.assign(obj, changes);
            }
        }

        if (methodName === 'update') {
            return updater(this._find(query, 'find'), changes);
        } else {
            return this._find(query, 'filter').map(obj => {
                return updater(obj, changes);
            });
        }
    }

    /**
     * @param {object|array} data The object or the array of objects you would like to add.
     */
    add(data) {
        const error = new Error(`You can only add plain objects or an array of plain objects. Errored whilst trying to add '${data}' to '${this._slice}'`);
        const slice = this._getSlice();
        let dataArr = data;

        validateNumberOfArguments(arguments, 1, 'add');

        if (!_isArray(data)) {
            dataArr = [data];
        }

        _cloneDeep(dataArr).forEach(item => {
            if (!_isPlainObject(item)) {
                throw error;
            }
            slice.push(item);
        });

        return data;
    }

    /**
     * @param {object|function} query
     */
    find(query) {
        validateNumberOfArguments(arguments, 1, 'find');
        validateQuery(query, 'find');
        return _cloneDeep(this._find(query, 'find'));
    }
    findAll(query = {}) {
        validateQuery(query, 'findAll');
        return _cloneDeep(this._find(query, 'filter'));
    }

    /**
     * @param {function|object} query
     * @param {function|object} changes
     */
    update(query, changes){
        validateUpdateArguments(query, changes, 'update');
        return _cloneDeep(this._update(query, changes, 'update'));
    }
    updateAll(query, changes){
        validateUpdateArguments(query, changes, 'updateAll');
        return _cloneDeep(this._update(query, changes, 'updateAll'));
    }

    /**
     * @param {function|object} query
     */
    delete(query) {
        validateQuery(query, 'delete');
        const itemToDelete = this._find(query, 'find');
        this._setSlice(_differenceWith(this._getSlice(), [itemToDelete], _isEqual));
        return _cloneDeep(itemToDelete);
    }
    deleteAll(query) {
        validateQuery(query, 'deleteAll');
        const itemsToDelete = this._find(query, 'filter');
        this._setSlice(_differenceWith(this._getSlice(), itemsToDelete, _isEqual));
        return _cloneDeep(itemsToDelete);
    }
};


class ElephantDB {

    constructor(tablesArr) {
        this._db = new Map();

        tablesArr.forEach((tableName) => {
            this._db.set(tableName, []);
        });
    }

    select(tableName) {
        return new ElephantDBQuery(tableName, this._db);
    }

    dump() {
        const result = {};
        for (const [key, value] of this._db.entries()) {
            result[key] = _cloneDeep(value);
        }
        return result;
    }
}

module.exports = ElephantDB;
