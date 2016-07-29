var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ReferenceConstants = require('../constants/ReferenceConstants');
var ReferenceActions = require('../actions/ReferenceActions');
var assign = require('object-assign');


var CHANGE_EVENT = 'change';
var UPDATE_EVENT = 'update';
var _loading = false;
var _loaded = false;
var _data = 0;
var _show = false;
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

function show(val) {
    _show = val;
}

var ReferenceStore = assign({}, EventEmitter.prototype, {

    shouldShow: function () {
        return _show;
    },

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

    emitUpdate: function(){
        this.emit(UPDATE_EVENT);
    },

    getPDF: function(chapterIdParameter){

        if(_data.hasOwnProperty("items")){
                for(var i = 0; i < _data.items.length; i++){
                    if (_data.items[i].name === "PDF Takeaways"){
                        for(var j = 0; j < _data.items[i].assets.length; j++){
                            if(_data.items[i].assets[j].chapterId === chapterIdParameter){
                                return _data.items[i].assets[j].path;
                            }
                        }
                    }
            }
        }
        return null;
    },

    /**
     * @param {function} callback
     */
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    addUpdateListener: function(callback){
        this.on(UPDATE_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    removeUpdateListener: function(callback){
        this.removeListener(UPDATE_EVENT, callback);
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
        case ReferenceConstants.REFERENCE_SHOW:
            show(true);
            ReferenceStore.emitUpdate();
            break;

        default:
        // no op
    }
});

module.exports = ReferenceStore;