/**
 * Created by Alec on 5/31/2016.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var DliConstants = require('../constants/DliConstants');
var DliActions = require('../actions/DliActions');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _data = {};
var _dliPathList = [];

function create(data) {
    _data = {
        objectives: data
    }
}

function destroy() {

}

function loadDli(){
    $.getJSON("data/dli/dli.json")
        .done(function(data){
            if(data && data.dliPaths){
                _dliPathList = data.dliPaths;
                DliActions.loadComplete();
            }
        })
        .fail(function() {
            DliActions.loadComplete();
        });
}

var DliStore = assign({}, EventEmitter.prototype, {

    data: function() {
        return _data;
    },

    getDliPaths: function(){
        return _dliPathList
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

AppDispatcher.register(function(action){
    switch(action.actionType){
        case DliConstants.DLI_CREATE:
            create(action.data);
            DliStore.emitChange();
            break;
        case DliConstants.DLI_LOAD:
            loadDli();
            break;
        case DliConstants.DLI_LOAD_COMPLETE:
            DliStore.emitChange();
            break;
        case DliConstants.DLI_DESTROY:
            destroy();
            DliStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = DliStore;