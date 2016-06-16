var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var UnitConstants = require('../constants/UnitConstants');
var assign = require('object-assign');


var CHANGE_EVENT = 'change';

var _units = {};

/**
 * Create a UNIT item.
 * @param  {string} text The content of the UNIT
 */
function create(data) {
    // Hand waving here -- not showing how this interacts with XHR or persistent
    // server-side storage.
    // Using the current timestamp + random number in place of a real id.
    var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);

    // create state with default values
    var defaultState = {
        complete: false,
        required: false
    };

    _units[id] = {
        id: id,
        data: data,
        state: defaultState
    };
}

/**
 * Update a UNIT item.
 * @param  {string} id
 * @param {object} updates An object literal containing only the data to be
 *     updated.
 */
function update(id, updates) {
    if (_units[id] && _units[id].state) {
        _units[id].state = assign({}, _units[id].state, updates);
    }
}

/**
 * Update all of the UNIT items with the same object.
 * @param  {object} updates An object literal containing only the data to be
 *     updated.
 */
function updateAll(updates) {
    for (var id in _units) {
        update(id, updates);
    }
}

/**
 * Delete a UNIT item.
 * @param  {string} id
 */
function destroy(id) {
    delete _units[id];
}

/**
 * Delete all the completed UNIT items.
 */
function destroyCompleted() {
    for (var id in _units) {
        if (_units[id].state && _units[id].state.complete === true) {
            destroy(id);
        }
    }
}

var UnitStore = assign({}, EventEmitter.prototype, {
    create:function(data) {
        create(data);
    },

    /**
     * Tests whether all the remaining UNIT items are marked as completed.
     * @return {boolean}
     */
    areAllComplete: function() {
        for (var id in _units) {
            if (_units[id].state && !_units[id].state.complete) {
                return false;
            }
        }
        return true;
    },

    /**
     * Get the entire collection of UNITs.
     * @return {object}
     */
    getAll: function() {
        return _units;
    },

    /**
     * Returns and order list of chapter ids contained in the unit.
     * @param id - id of unit
     * @returns {Array} - Returns empty array if no chapter is found.
     */
    getChapterIdsInUnit: function(id) {
        var chapterIds = [];
        if (_units[id] && _units[id].data && _units[id].data.chapter) {
            var chapters = _units[id].data.chapter;
            for (var chapterIndex in chapters) {
                chapterIds.push(chapters[chapterIndex].xid);
            }
        }
        return chapterIds;
    },

    /**
     * Checks if the state property required is true
     * @param id
     * @returns {boolean}
     */
    isRequired: function(id) {
        if (_units[id] && _units[id].state && _units[id].state.required === true) {
            return true;
        }
        return false;
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
        case UnitConstants.UNIT_CREATE:

            if (text !== '') {
                create(action.data);
                UnitStore.emitChange();
            }
            break;

        case UnitConstants.UNIT_MARK_REQUIRED:
            update(action.id, {required: true});
            break;

        case UnitConstants.UNIT_TOGGLE_COMPLETE_ALL:
            if (UnitStore.areAllComplete()) {
                updateAll({complete: false});
            } else {
                updateAll({complete: true});
            }
            UnitStore.emitChange();
            break;

        case UnitConstants.UNIT_UNDO_COMPLETE:
            update(action.id, {complete: false});
            UnitStore.emitChange();
            break;

        case UnitConstants.UNIT_COMPLETE:
            update(action.id, {complete: true});
            UnitStore.emitChange();
            break;

        case UnitConstants.UNIT_DESTROY:
            destroy(action.id);
            UnitStore.emitChange();
            break;

        case UnitConstants.UNIT_DESTROY_COMPLETED:
            destroyCompleted();
            UnitStore.emitChange();
            break;
        case UnitConstants.UNIT_LOAD_COMPLETE:
            UnitStore.emitChange();
            break;


        default:
        // no op
    }
});

module.exports = UnitStore;