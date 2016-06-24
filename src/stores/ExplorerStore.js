var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ExplorerConstants = require('../constants/ExplorerConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var _visible = false;

function show() {
    _visible = true;
}

function hide() {
    _visible = false;
}

var ExplorerStore = assign({}, EventEmitter.prototype, {

    isVisible: function() {
        return _visible;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
    switch(action.actionType) {
        case ExplorerConstants.EXPLORER_SHOW:
            show(action.data);
            ExplorerStore.emitChange();
            break;
        case ExplorerConstants.EXPLORER_HIDE:
            hide();
            ExplorerStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ExplorerStore;