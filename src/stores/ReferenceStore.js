var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ReferenceConstants = require('../constants/ReferenceConstants');
var ReferenceActions = require('../actions/ReferenceActions');
var assign = require('object-assign');


var CHANGE_EVENT = 'change';
var _loading = false;
var _loaded = false;
var _totalUnits = 0;
var _parsedUnitIndex = 0;

/**
 * Create a LOADER item.
 * @param  {string} text The content of the LOADER
 */
function load() {

    _loading = true;
    $.getJSON("data/content/toc.json", function(result) {

        /*
        BookActions.create(result.book);
        var books = BookStore.getAll();

        for (var key in books) {
            var book = books[key];
            var uLen = book.data.unit.length;
            for ( var i = 0; i < uLen; i++ ) {
                UnitStore.create(book.data.unit[i]);
            }
            var units = UnitStore.getAll();
            var copy = [];
            for (var uKey in units) {
                copy.push({key: uKey, unit:units[uKey]});
            }
            _totalUnits = copy.length;
            loadUnitData(copy);
        }*/

    });
}



var ReferenceStore = assign({}, EventEmitter.prototype, {

    loading: function() {
        return _loading;
    },

    loadingComplete: function() {
        return _loaded;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    /**
     * @param {function} callback
     */
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {


    switch(action.actionType) {
        case ReferenceConstants.LOADER_COMPLETE:
            _loading = false;
            ReferenceStore.emitChange();
            break;
        case ReferenceConstants.LOADER_LOAD:
            load();
            ReferenceStore.emitChange();
            break;

        default:
        // no op
    }
});

module.exports = ReferenceStore;