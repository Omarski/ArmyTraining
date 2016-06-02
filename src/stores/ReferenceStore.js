var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ReferenceConstants = require('../constants/ReferenceConstants');
var ReferenceActions = require('../actions/ReferenceActions');
var assign = require('object-assign');


var CHANGE_EVENT = 'change';
var _loading = false;
var _loaded = false;
var _data = 0;

/**
 * Create a LOADER item.
 * @param  {string} text The content of the LOADER
 */
function load() {
    _loading = true;
    $.getJSON("data/reference/reference.json", function(result) {
        _data = result;
        ReferenceActions.loadComplete();
    });
}



var ReferenceStore = assign({}, EventEmitter.prototype, {

    loading: function() {
        return _loading;
    },

    loadingComplete: function() {
        return _loaded;
    },

    getData: function(){
        return _data;
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
        case ReferenceConstants.REFERENCE_LOAD_COMPLETE:
            _loading = false;
            ReferenceStore.emitChange();
            break;
        case ReferenceConstants.REFERENCE_LOAD:
            load();
            break;

        default:
        // no op
    }
});

module.exports = ReferenceStore;