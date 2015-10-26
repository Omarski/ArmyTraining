var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActiveDialogEvaluationConstants = require('../../constants/active_dialog/ActiveDialogEvaluationConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _data = {};

function create(data) {
    _data = data;
}

function destroy() {

}

var ActiveDialogEvaluationStore = assign({}, EventEmitter.prototype, {

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
        case ActiveDialogEvaluationConstants.ACTIVE_DIALOG_EVALUATION_CREATE:
            create(action.data);
            ActiveDialogEvaluationStore.emitChange();
            break;
        case ActiveDialogEvaluationConstants.ACTIVE_DIALOG_EVALUATION_DESTROY:
            destroy();
            ActiveDialogEvaluationStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ActiveDialogEvaluationStore;