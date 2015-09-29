var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');


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
                    <button classNane="glyphicon glyphicon-record" onClick={record}>Record</button>
                    <button className="glyph-icon glyph-icon-stop" onClick={function(){stopRecording(id)}}>Stop</button>
                    <button classNane="glyphicon glyphicon-play-circle" onClick={function(){play(id)}}>PlayBack</button>
                    <div id={"text-"+id} onClick={self.handleClick}>{text}</div>
                    <span classNane="glyphicon glyphicon-ok-circle"></span>
                    <span classNane="glyphicon glyphicon-remove-circle"></span>
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