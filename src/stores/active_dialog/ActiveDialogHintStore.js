var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActiveDialogHintConstants = require('../../constants/active_dialog/ActiveDialogHintConstants');


var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _data = [];
var _initialized = false;
function create(data) {
    _data = [];
    if (data) {
        var uniqueCOAs = [];
        var coas = data;
        var len = coas.length;
        while(len--) {
            var coa = coas[len];
            var found = false;
            var uLen = uniqueCOAs.length;
            while (uLen--) {
                var uCoa = uniqueCOAs[uLen];
                if (uCoa.act === coa.act) {
                    found = true;
                    uCoa.coas.push(coa);
                    break;
                }
            }
            if (!found) {
                uniqueCOAs.push({
                    act: coa.act,
                    coas: [coa]
                });
            }
        }
        _data = uniqueCOAs;
        if (_data.length > 0) {
            _initialized = true;
        }
    }
}

function destroy() {

}

var ActiveDialogHintStore = assign({}, EventEmitter.prototype, {

    data: function() {
        return _data;
    },

    initialized: function() {
        return _initialized;
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
        case ActiveDialogHintConstants.ACTIVE_DIALOG_HINT_CREATE:
            create(action.data);
            ActiveDialogHintStore.emitChange();
            break;
        case ActiveDialogHintConstants.ACTIVE_DIALOG_HINT_DESTROY:
            destroy();
            ActiveDialogHintStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ActiveDialogHintStore;