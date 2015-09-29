var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');

// CONSTANTS
var LI_ANSWERS_CONTAINER_CLS = "li-answers-container";
var LI_COLUMN_CLS = "li-column";
var LI_VOICE_ANSWERS_CLS = "li-voice-answers";
var LI_VOCAL_ANSWER_CLS = "li-vocal-answer";
var LI_GLYPHICON_RECORD_CLS = "li-record";
var LI_GLYPHICON_STOP_CLS = "li-stop";
var LI_GLYPHICON_PLAY_CLS = "li-playback";
var LI_GLYPHICON_CORRECT_CLS = "li-correct";
var LI_GLYPHICON_INCORRECT_CLS = "li-incorrect";

var recorder;

window.onload = function init(){
    // webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL;
};

var onFail = function(e){
    console.log('An Error has occured.', e);
};

var onSuccess = function(s){
    var context = new AudioContext();
    var mediaStreamSource = context.createMediaStreamSource(s);
    recorder = new Recorder(mediaStreamSource);
    recorder.record();
    console.log("--- onSuccess ---");
    console.dir(recorder);
};

function record(){
    if(navigator.getUserMedia){
        navigator.getUserMedia({audio: true}, onSuccess, onFail);
    }else{
        console.log('navigator.getUserMedia not present');
    }
}

// pass the audio handle to stopRecording
function stopRecording(id){
    console.log(id);
    var audio = document.getElementById(id);
    recorder.stop();
    recorder.exportWAV(function(s){
        audio.src = window.URL.createObjectURL(s);
    });
    console.log("--- stopRecording ---");
    console.log(recorder);
}

function play(id){
    var a = document.getElementById(id);
    a.play();
}

function getPageState(props) {
    var data = {
        page: null,
        note: "Listen and Repeat"
    };

    if (props && props.page) {
        data.page = props.page;
    }

    return data;
}

function hasGetUserMedia(){
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

function setup(){
    $(".glyphicon").css('pointerEvents', 'auto');

    var vocalAnswers = document.getElementsByClassName(LI_VOCAL_ANSWER_CLS);
    Array.prototype.forEach.call(vocalAnswers, function(item, index){
        var _item = $(item);
        if(index == 0){
            _item.css('border-top', '5px solid #cccccc');
        }
        _item.css('border-bottom', '5px solid #cccccc');
        if(index%2 == 0){
            _item.css('background', '#ebebeb');
        }else{
            _item.css('background', '#ffffff');
        }
    });
}

var PronunciationView = React.createClass({
    getInitialState: function() {
        return getPageState(this.props);
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
        if(hasGetUserMedia()){
            // UserMedia allowed
        }else{
            // UserMedia not allowed
        }
        setup();
    },
    componentDidUpdate: function(){

    },
    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },
    handleClick: function(event){

    },
    render: function() {
        var self = this;
        var page = self.state.page;
        var questions = page.nut || [];
        var text = "";
        var vaList = questions.map(function(item, index){
            if(item && item.uttering && item.uttering.utterance){
                text = item.uttering.utterance.native.text || "Error: JSON structure changed";
            }
            var id = "audio" + index;
            return(
                <div className="li-vocal-answer">
                    <audio id={id}></audio>
                    <button className="glyphicon glyphicon-record li-record" onClick={record}>Record</button>
                    <button className="glyphicon glyphicon-stop li-stop" onClick={function(){stopRecording(id)}}>Stop</button>
                    <button className="glyphicon glyphicon-play-circle li-playback" onClick={function(){play(id)}}>PlayBack</button>
                    <div id={"text-"+id} onClick={self.handleClick}>{text}</div>
                    <span className="glyphicon glyphicon-ok-circle"></span>
                    <span className="glyphicon glyphicon-remove-circle"></span>
                </div>
            );
        });

        return (
            <div className="li-container">
                <div className="row li-title">
                    <h3>{page.title}</h3>
                </div>
                <div className="row li-note">
                    <h4>{self.note}</h4>
                </div>
                <div className="row">
                    <div className="li-answers-container">
                        <div className="li-column">
                            <div className="li-voice-answers">
                                {vaList}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        this.setState(getPageState());
    }
});

module.exports = PronunciationView;