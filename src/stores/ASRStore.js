var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ASRConstants = require('../constants/ASRConstants');
var ASRActions = require('../actions/ASRActions');
var PageStore = require('../stores/PageStore');
var ConfigStore = require('../stores/ConfigStore');

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

function load(){
    if(!hasGetUserMedia() || ConfigStore.isASREnabled()){
        //"ASRStore.load.need to load ASR"
        // GetUserMedia not allowed
        if(!ASRStore.isInitialized()){
            //"ASRStore.load.!isInitialized"
            ASRStore.InitializeASR();
        }
    }else{

    }

}

window.onload = function init(){
    // webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL;
};

function hasGetUserMedia(){
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var _isInitialized = false;
var _message = "No data found.";
var _lesson = "msb_lesson115_mini_10002";
var _page = "page4004";
var _recordedSpeech = "This needs to be a unique message that isn't returned by the applet.";

function getGrammarID(){
    var grammarID = "";
    var pageType = PageStore.page().type;
    var lessonXID = PageStore.chapter().xid;
    var lesson = lessonXID.split("_")[0];
    switch(pageType){

        case "ResponseFormation":
        case "UtteranceFormation":
            grammarID = lesson;
            return ("utt_" + grammarID);
            break; //break just in case

        case "Pronunciation":
        case "MultiColumnPronunciation":
        default:
            grammarID = lesson;
            return ("msb_" + grammarID);
    }
}


var ASRStore = assign({}, EventEmitter.prototype, {

    data: function() {
        return _data;
    },

    isInitialized: function(){
        return _isInitialized;
    },

    InitializeASR: function() {
        //"ASR Store initialize"
        ASRMessajsTester.sendMessage("urn:ASRMessajsTester:MessajsImpl1,initialize English", "urn:ASRApplet:test", "text/plain; charset=utf-8");
    },

    InitializeDone: function(){
        //console.log("trying to finish initializing...");
    },

    StartRecording: function() {
        ASRMessajsTester.sendMessage("startrecording", "urn:ASRApplet:test", "text/plain; charset=utf-8");
       //"Start recording..."
    },

    StopRecording: function() {
        ASRMessajsTester.sendMessage("stoprecording", "urn:ASRApplet:test", "text/plain; charset=utf-8");
        //"stop recording..."
    },

    RecognizeRecording: function() {
        // recognize will need to swtich the lesson/page being checked
        ASRMessajsTester.sendMessage("recognize " + getGrammarID(), "urn:ASRApplet:test", "text/plain; charset=utf-8");

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
        if(_message === "initialized"){
            setTimeout(function() {
                ASRActions.loadComplete();
                _isInitialized = true;
            }, 100);
        }
        var self = this;
        setTimeout(function() {
            self.emitChange();
        }, 100)

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
        case ASRConstants.INITIALIZE_DONE:
            ASRStore.InitializeDone();
            break;
        case ASRConstants.ACTIVE_DIALOG_OBJECTIVE_DESTROY:
            destroy();
            ASRStore.emitChange();
            break;
        case ASRConstants.ASR_LOAD:
            load();
            break;
        case ASRConstants.ASR_LOAD_COMPLETE:
            ASRStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ASRStore;
window.ASR = ASRStore;