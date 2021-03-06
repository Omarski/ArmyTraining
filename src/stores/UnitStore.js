var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var PersistenceActions = require('../actions/PersistenceActions');
var PersistenceStore = require('../stores/PersistenceStore');
var UnitConstants = require('../constants/UnitConstants');
var Utils = require('../components/widgets/Utils');
var assign = require('object-assign');


var CHANGE_EVENT = 'change';

var _units = {};
var _requiredExists = false;

// default unit state values
var _defaultState = {
    complete: false,
    passed: false,
    required: false
};

/**
 * Create a UNIT item.
 * @param  {string} text The content of the UNIT
 */
function create(data) {
    // Hand waving here -- not showing how this interacts with XHR or persistent
    // server-side storage.
    // Using the current timestamp + random number in place of a real id.
    var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);

    _units[id] = {
        id: id,
        data: data,
        state: _defaultState
    };

    // load any previous data
    load(id);
}

/**
 * Load state unit data by id
 * @param id
 */
function load(id) {
    if (_units[id] && _units[id].data && _units[id].data.xid && _units[id].state) {
        // load saved units
        var storedUnits = PersistenceStore.get('units');
        if (storedUnits) {
            _units[id].state = assign({}, _units[id].state, storedUnits[_units[id].data.xid]);
            if (_units[id].state.required === true) {
                _requiredExists = true;
            }
        }
    }
}

/**
 * Save unit state data by id
 * @param id
 */
function save(id) {
    if (_units[id] && _units[id].data && _units[id].data.xid && _units[id].state) {
        setTimeout(function() {
            // load saved units
            var storedUnits = PersistenceStore.get('units');
            if (!storedUnits) {
                storedUnits = {};
            }

            // update unit data
            storedUnits[_units[id].data.xid] = _units[id].state;

            // save unit
            PersistenceActions.set('units', storedUnits);
        });
    }
}

/**
 * Reset all unit state data to default state data
 */
function reset() {
    setTimeout(function() {
        _requiredExists = false;
        // remove saved data
        PersistenceActions.remove('units');

        // iterate over units and reset state
        for (var id in _units) {
            _units[id].state = _defaultState;
        }
    });
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

        if (_units[id].state.required) {
            _requiredExists = true;
        }
        // save unit data
        save(id);
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

/**
 * Checks all the units chapters to see if it is complete
 * @param unitId
 */
function evaluateUnitComplete(unitId) {
    // find unit by id
    var unit = _units[unitId];

    // iterate over chapters
    if (unit && unit.data && unit.data.chapter) {
        var chapterLength = unit.data.chapter.length;
        while (chapterLength--) {
            var chapter = unit.data.chapter[chapterLength];

            // exit if even one is not complete
            if (!(chapter.state && chapter.state.complete === true)) {
                return;
            }
        }

        // mark unit complete
        update(unitId, {complete: true});
    }
}

/**
 * Checks all the units chapters to see if it is passed
 * @param unitId
 */
function evaluateUnitPassed(unitId) {
    // find unit by id
    var unit = _units[unitId];

    // iterate over chapters
    if (unit && unit.data && unit.data.chapter) {
        var chapterLength = unit.data.chapter.length;
        while (chapterLength--) {
            var chapter = unit.data.chapter[chapterLength];

            // exit if even one is not complete
            if (!(chapter.state && chapter.state.passed === true)) {
                return;
            }
        }

        // mark unit complete
        update(unitId, {passed: true});
    }
}

/**
 * Marks a units chapter as complete
 * @param unitId
 * @param chapterId
 */
function markChapterComplete(unitId, chapterId) {
    // find unit by id
    var unit = _units[unitId];
    if (unit && unit.data && unit.data.chapter) {
        var chapterLength = unit.data.chapter.length;
        while(chapterLength--) {
            var chapter = unit.data.chapter[chapterLength];
            // check for matching chapter id
            if (chapter.xid === chapterId) {
                var state = {};
                // get state
                if (chapter.state) {
                    state = chapter.state;
                }

                // mark it as complete
                chapter.state = assign({}, state, {complete: true});

                break;
            }
        }
    }
}

/**
 * Marks a units chapter as passed
 * @param unitId
 * @param chapterId
 */
function markChapterPassed(unitId, chapterId) {
    // find unit by id
    var unit = _units[unitId];
    if (unit && unit.data && unit.data.chapter) {
        var chapterLength = unit.data.chapter.length;
        while(chapterLength--) {
            var chapter = unit.data.chapter[chapterLength];
            // check for matching chapter id
            if (chapter.xid === chapterId) {
                var state = {};
                // get state
                if (chapter.state) {
                    state = chapter.state;
                }

                // mark it as complete
                chapter.state = assign({}, state, {passed: true});

                break;
            }
        }
    }
}

var UnitStore = assign({}, EventEmitter.prototype, {

    requiredExists: function() {
        return _requiredExists;
    },

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
     * Tests whether all the remaining UNIT items are marked as passed.
     * @return {boolean}
     */
    areAllPassed: function() {
        for (var id in _units) {
            if (_units[id].state && !_units[id].state.passed) {
                return false;
            }
        }
        return true;
    },

    areAllRequiredComplete: function() {
        for (var id in _units) {
            if (_units[id].state && _units[id].state.required) {
                if (_units[id].state.complete !== true) {
                    return false;
                }
            }
        }

        return true;
    },

    areAllRequiredPassed: function() {
        for (var id in _units) {
            if (_units[id].state && _units[id].state.required) {
                if (_units[id].state.passed !== true) {
                    return false;
                }
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

    getUnitById: function(id) {
        var unit = null;
        if (_units) {
            for (var key in _units) {
                var u = _units[key];
                if (u.data && u.data.xid === id) {
                    unit = u;
                    break;
                }
            }
        }
        return unit;
    },

    getUnitTime: function(id){
        var time = 0;
        if (_units[id].data && _units[id].data.playlistInfo) {
            for (var index in _units[id].data.playlistInfo) {
                var infoObject = _units[id].data.playlistInfo[index];
                // look up info
                var foundInfo = Utils.findInfo(infoObject, "minutes");
                if (foundInfo !== null) {
                    time = foundInfo;
                    break;
                }
            }
        }
        return time;
    },

    getChapterById: function(id, chapterId) {
        var chapter = null;
        var unit = this.getUnitById(id);
        if (unit && unit.data.chapter) {
            var chapters = unit.data.chapter;
            for (var chapterIndex in chapters) {
                if (chapters[chapterIndex].xid === chapterId) {
                    chapter = chapters[chapterIndex];
                    break;
                }

            }
        }
        return chapter;
    },

    /**
     * Checks if the state property required is true
     * @param id
     * @returns {boolean}
     */
    isRequired: function(id) {
        if (_units[id] && _units[id].state && (_units[id].state.required === true)) {
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
        case UnitConstants.UNIT_CHAPTER_COMPLETE:
            markChapterComplete(action.id, action.chapterId);
            break;

        case UnitConstants.UNIT_CHAPTER_PASSED:
            markChapterPassed(action.id, action.chapterId);
            break;

        case UnitConstants.UNIT_CREATE:

            if (text !== '') {
                create(action.data);
                UnitStore.emitChange();
            }
            break;

        case UnitConstants.UNIT_EVALUATE_COMPLETE:
            evaluateUnitComplete(action.data);
            // emit change?
            break;

        case UnitConstants.UNIT_EVALUATE_PASSED:
            evaluateUnitPassed(action.data);
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

        case UnitConstants.UNIT_PASSED:
            update(action.id, {passed: true});
            UnitStore.emitChange();
            break;

        case UnitConstants.UNIT_RESET:
            reset();
            UnitStore.emitChange();
            break;

        default:
        // no op
    }
});

module.exports = UnitStore;