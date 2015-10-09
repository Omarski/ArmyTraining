var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActiveDialogHistoryConstants = require('../../constants/active_dialog/ActiveDialogHistoryContants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _data = [];

function create(data) {

}

function destroy() {

}

var ActiveDialogHistoryStore = assign({}, EventEmitter.prototype, {

    data: function() {
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
        case ActiveDialogHistoryConstants.ACTIVE_DIALOG_HISTORY_CREATE:
            create(action.data);
            ActiveDialogHistoryStore.emitChange();
            break;
        case ActiveDialogHistoryConstants.ACTIVE_DIALOG_HISTORY_DESTROY:
            destroy();
            ActiveDialogHistoryStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ActiveDialogHistoryStore;