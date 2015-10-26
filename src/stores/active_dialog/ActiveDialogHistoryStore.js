var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActiveDialogHistoryConstants = require('../../constants/active_dialog/ActiveDialogHistoryConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _data = [];
var _items = [];

function create(data) {
    var inputs = data.inputs;
    var outputs = data.outputs;

    /*
     if scene_data.inputs.length > 0
     input = scene_data.inputs.shift()

     # get sound
     sound = input.sound if input.sound

     # get image
     image = input.anima if input.anima

     # get caption text
     captionText = input.uttText if input.uttText

     # get the next output
     else if  scene_data.outputs.length > 0
     output = scene_data.outputs.shift()

     # move this better <------------------------------------------
     if (output.act.substring(0,14) == "BlockingChange")
     scene_data.image = scene.Fsm.changeBlockingImage(output.act)

     # get sound
     sound = output.action?.sound

     # get image
     image = output.action?.anima

     # get caption text
     if output.action?.terp
     captionText = output.action[output.action.terp]
     */

    var exists = false;
    var obj = {};
    obj.label = "";




    if (inputs && inputs.length > 0) {
        var input = inputs.shift();
        _items.push(input);
        if (input.uttText) {
            obj.label = input.uttText;
        }
        exists = true;
    } else if (outputs && outputs.length > 0) {

        var output = outputs.shift();
        _items.push(output);
        if (output.action && output.action.terp) {
            obj.label = output.action[output.action.terp];
        }
        exists = true;
    }

    if (exists) {
        _data.push(obj);
    }

}

function destroy() {
    _data = [];
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