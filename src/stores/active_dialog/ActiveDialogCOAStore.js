var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActiveDialogCOAConstants = require('../../constants/active_dialog/ActiveDialogCOAConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _data = [];

function create(activeCOA) {
    _data = [];

    var temp = [];

    if (activeCOA) {
        var coas = activeCOA.coas;
        var coasLen = coas.length;

        for (var i = 0; i < coasLen; i++) {
            var coa = coas[i];
            var rlzns = coa.realizations;
            var rlznsLen = rlzns.length;
            for (var j = 0; j < rlznsLen; j++) {
                var r = rlzns[j];
                if (!isDuplicate(temp, r)) {
                    _data.push({coa: coa, realization: r});
                    temp.push(r);
                }

            }
        }
    }
}

function isDuplicate(temp, realization) {
    var len = temp.length;
    while (len--) {
        var r = temp[len];
        if (realization.uttText === r.uttText) {
            return true;
        }
    }
    return false;
}

function destroy() {

}

var ActiveDialogCOAStore = assign({}, EventEmitter.prototype, {

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
        case ActiveDialogCOAConstants.ACTIVE_DIALOG_COA_CREATE:
            create(action.data);
            ActiveDialogCOAStore.emitChange();
            break;
        case ActiveDialogCOAConstants.ACTIVE_DIALOG_COA_DESTROY:
            destroy();
            ActiveDialogCOAStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ActiveDialogCOAStore;