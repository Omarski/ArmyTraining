var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActiveDialogObjectiveConstants = require('../../constants/active_dialog/ActiveDialogObjectiveConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _data = {};

function create(data) {
    _data = {
        objectives: data
    }
}

function destroy() {

}

var ActiveDialogObjectiveStore = assign({}, EventEmitter.prototype, {

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
        case ActiveDialogObjectiveConstants.ACTIVE_DIALOG_OBJECTIVE_CREATE:
            create(action.data);
            ActiveDialogObjectiveStore.emitChange();
            break;
        case ActiveDialogObjectiveConstants.ACTIVE_DIALOG_OBJECTIVE_DESTROY:
            destroy();
            ActiveDialogObjectiveStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ActiveDialogObjectiveStore;