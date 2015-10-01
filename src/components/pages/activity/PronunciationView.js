var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var ColorText = require('../../../components/widgets/ColorText');

// CONSTANTS
var LI_ANSWERS_CONTAINER_CLS = "li-answers-container";
var LI_COLUMN_CLS = "li-column";
var LI_VOICE_ANSWERS_CLS = "li-voice-answers";
var LI_VOCAL_ANSWER_CLS = "li-vocal-answer";
var LI_GLYPHICON_RECORD_CLS = "glyphicon-record";
var LI_GLYPHICON_STOP_CLS = "glyphicon-stop";
var LI_GLYPHICON_PLAY_CLS = "glyphicon-play-circle";
var LI_GLYPHICON_CORRECT_CLS = "glyphicon-ok-circle";
var LI_GLYPHICON_INCORRECT_CLS = "glyphicon-remove-circle";
var LI_GLYPHICON_CLS = "li-glyphicon";

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

function handlePlaying(id, index, self){
    if(self.state.isPlaying[index]){
        stop(id, index, self);
    }else{
        play(id, index, self);
    }
}

function play(id, index, self){
    var a = document.getElementById(id);
    // might need to be $(a)
    $(a).bind('ended', function(){
        stop(id, index, self);
    });
    a.play();
    var newPlayingState = self.state.isPlaying;
    newPlayingState[index] = true;
    self.setState({
        isPlaying: newPlayingState
    });
}

function stop(id, index, self){
    var a = document.getElementById(id);
    a.pause();
    a.currentTime = 0;
    var newPlayingState = self.state.isPlaying;
    newPlayingState[index] = false;
    self.setState({
        isPlaying: newPlayingState
    });
}

function handleRecord(id, index, self){
    var newRecordingState = self.state.recordingState;
    if(newRecordingState[index]){
        stopRecording(id);
        var newPlayableState = self.state.playableState;
        newPlayableState[index] = true;
        newRecordingState[index] = false;
        // TODO: Implement the ASR to check if recorded answer is correct
        self.setState({
            recordingState: newRecordingState,
            playableState: newPlayableState
        })
    }else{
        record();
        newRecordingState[index] = true;
        self.setState({
            recordingState: newRecordingState
        })
    }
}

function getPageState(props) {
    var data = {
        page: null,
        note: "Listen and Repeat",
        recordingState: [],
        playableState: [],
        isPlaying: [],
        isCorrect: []
    };

    if (props && props.page) {
        data.page = props.page;
    }

    //for page.nut.length
    data.page.nut.map(function(){
        data.recordingState.push(false);
        data.playableState.push(false);
        data.isPlaying.push(false);
        data.isCorrect.push(null);
    });

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

    // 39.5 because math
    var buffer = 39.5;
    var icons = document.getElementsByClassName(LI_GLYPHICON_CLS);
    Array.prototype.forEach.call(icons, function(item, index){
        var $item = $(item);
        var answerLine = Math.floor(index/3);
        $item.css('top', ( ( buffer + (120*answerLine) )+'px'));
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
        var nativeText = "";
        var translatedText = "";
        var feedbackClass = "glyphicon li-glyphicon li-feedback";
        var recordedClass = "glyphicon li-glyphicon li-playback";
        var recordingClass = "glyphicon li-glyphicon li-record";

        var vaList = questions.map(function(item, index){
            if(item && item.uttering && item.uttering.utterance){
                nativeText = item.uttering.utterance.native.text || "Error: Native Text Not Found";
                translatedText = item.uttering.utterance.translation.text || "Error: Translated Text Not Found";
            }
            var id = "audio" + index;
            var itemFeedbackClass = "";
            var itemRecordedClass = "";
            var itemRecordingClass = "";

            var hasRecorded = self.state.playableState[index];
            if(hasRecorded){
                var isCorrect = self.state.isCorrect[index];
                if(isCorrect){
                    itemFeedbackClass = feedbackClass + " " + LI_GLYPHICON_CORRECT_CLS;
                }else{
                    itemFeedbackClass = feedbackClass + " " + LI_GLYPHICON_INCORRECT_CLS;
                }
                if(self.state.isPlaying[index]){
                    itemRecordedClass = recordedClass + " " + LI_GLYPHICON_STOP_CLS;
                }else{
                    itemRecordedClass = recordedClass + " " + LI_GLYPHICON_PLAY_CLS;
                }
            }else{
                itemRecordedClass = recordedClass;
                itemFeedbackClass = feedbackClass;
            }

            var isRecording = self.state.recordingState[index];
            if(isRecording){
                itemRecordingClass = recordingClass + " " + LI_GLYPHICON_STOP_CLS;
            }else{
                itemRecordingClass = recordingClass + " " + LI_GLYPHICON_RECORD_CLS;
            }

            return(
                <div className="li-vocal-answer">
                    <audio id={id}></audio>
                    <span className={itemRecordingClass} onClick={function(){handleRecord(id, index, self)}}></span>
                    <span className={itemRecordedClass} onClick={function(){handlePlaying(id, index, self)}}></span>
                    <div className="li-text-area" id={"text-"+id} onClick={self.handleClick}>
                        <div className="li-native-text">
                            <ColorText props={nativeText}/>
                        </div>
                        <div className="li-translated-text">
                            <ColorText props={translatedText}/>
                        </div>
                    </div>
                    <span className={itemFeedbackClass}></span>
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