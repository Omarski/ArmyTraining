var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ASRConstants = require('../constants/ASRConstants');

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

var _isInitialized = false;
var _message = "No data found.";
var _lesson = "msb_lesson115_mini_10002";
var _page = "page4004";
var _recordedSpeech = "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn.";

var ASRStore = assign({}, EventEmitter.prototype, {

    data: function() {
        return _data;
    },

    isInitialized: function(){
        return _isInitialized;
    },

    InitializeASR: function() {
        ASRMessajsTester.sendMessage("urn:ASRMessajsTester:MessajsImpl1,initialize Chinese", "urn:ASRApplet:test", "text/plain; charset=utf-8");
        _isInitialized = true;
    },

    StartRecording: function() {
        ASRMessajsTester.sendMessage("startrecording", "urn:ASRApplet:test", "text/plain; charset=utf-8");
        console.log("Start recording...");
    },

    StopRecording: function() {
        ASRMessajsTester.sendMessage("stoprecording", "urn:ASRApplet:test", "text/plain; charset=utf-8");
        console.log("stop recording...");
    },

    RecognizeRecording: function() {
        // recognize will need to swtich the lesson/page being checked
        ASRMessajsTester.sendMessage("recognize msb_lesson115", "urn:ASRApplet:test", "text/plain; charset=utf-8");
        console.log("recognize recording")
    },

    PlayRecording: function(){
        ASRMessajsTester.sendMessage("playrecording", "urn:ASRApplet:test", "text/plain; charset=utf-8");
    },

    GetMessage: function(){
        return _message;
    },

    GetResult: function(){
        return _recordedSpeech;
    },

    RecievedMessaj: function(msj){
        _message = msj;
        this.emitChange();
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
        case ASRConstants.ACTIVE_DIALOG_OBJECTIVE_CREATE:
            create(action.data);
            ASRStore.emitChange();
            break;
        case ASRConstants.ACTIVE_DIALOG_OBJECTIVE_DESTROY:
            destroy();
            ASRStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ASRStore;
window.ASR = ASRStore;