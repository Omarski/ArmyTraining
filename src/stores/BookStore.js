var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var BookConstants = require('../constants/BookConstants');
var assign = require('object-assign');


var CHANGE_EVENT = 'change';

var _books = {};

/**
 * Create a BOOK item.
 * @param  {string} text The content of the BOOK
 */
function create(data) {
    // Hand waving here -- not showing how this interacts with XHR or persistent
    // server-side storage.
    // Using the current timestamp + random number in place of a real id.
    var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
    _books[id] = {
        id: id,
        complete: false,
        text: data.config.text,
        data: data
    };
}

/**
 * Update a BOOK item.
 * @param  {string} id
 * @param {object} updates An object literal containing only the data to be
 *     updated.
 */
function update(id, updates) {
    _books[id] = assign({}, _books[id], updates);
}

/**
 * Update all of the BOOK items with the same object.
 * @param  {object} updates An object literal containing only the data to be
 *     updated.
 */
function updateAll(updates) {
    for (var id in _books) {
        update(id, updates);
    }
}

/**
 * Delete a BOOK item.
 * @param  {string} id
 */
function destroy(id) {
    delete _books[id];
}

/**
 * Delete all the completed BOOK items.
 */
function destroyCompleted() {
    for (var id in _books) {
        if (_books[id].complete) {
            destroy(id);
        }
    }
}

var BookStore = assign({}, EventEmitter.prototype, {

    /**
     * Tests whether all the remaining BOOK items are marked as completed.
     * @return {boolean}
     */
    areAllComplete: function() {
        for (var id in _books) {
            if (!_books[id].complete) {
                return false;
            }
        }
        return true;
    },

    /**
     * Get the entire collection of BOOKs.
     * @return {object}
     */
    getAll: function() {
        return _books;
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
    var text;

    switch(action.actionType) {
        case BookConstants.BOOK_CREATE:

            if (text !== '') {
                create(action.data);
                BookStore.emitChange();
            }
            break;

        case BookConstants.BOOK_TOGGLE_COMPLETE_ALL:
            if (BookStore.areAllComplete()) {
                updateAll({complete: false});
            } else {
                updateAll({complete: true});
            }
            BookStore.emitChange();
            break;

        case BookConstants.BOOK_UNDO_COMPLETE:
            update(action.id, {complete: false});
            BookStore.emitChange();
            break;

        case BookConstants.BOOK_COMPLETE:
            update(action.id, {complete: true});
            BookStore.emitChange();
            break;

        case BookConstants.BOOK_UPDATE_TEXT:
            text = action.text.trim();
            if (text !== '') {
                update(action.id, {text: text});
                BookStore.emitChange();
            }
            break;

        case BookConstants.BOOK_DESTROY:
            destroy(action.id);
            BookStore.emitChange();
            break;

        case BookConstants.BOOK_DESTROY_COMPLETED:
            destroyCompleted();
            BookStore.emitChange();
            break;

        default:
        // no op
    }
});

module.exports = BookStore;