var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActiveDialogConstants = require('../constants/ActiveDialogConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var _data = [];

function create(data) {
    _data.push(data);
}

function destroy() {
    _data = [];
}

var ActiveDialogStore = assign({}, EventEmitter.prototype, {

    activeDialog: function() {
        return _data;
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
        case ActiveDialogConstants.ACTIVE_DIALOG_CREATE:
            create(action.data);
            ActiveDialogStore.emitChange();
            break;
        case ActiveDialogConstants.ACTIVE_DIALOG_DESTROY:
            destroy();
            ActiveDialogStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ActiveDialogStore;