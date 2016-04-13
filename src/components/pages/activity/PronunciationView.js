var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var ColorText = require('../../../components/widgets/ColorText');
var ASRStore = require('../../../stores/ASRStore');
var ConfigStore = require('../../../stores/ConfigStore');
var PageHeader = require('../../widgets/PageHeader');

// CONSTANTS

var LI_GLYPHICON_RECORD_CLS = "glyphicon-record";
var LI_GLYPHICON_STOP_CLS = "glyphicon-stop";
var LI_GLYPHICON_PLAY_CLS = "glyphicon-play-circle";
var LI_GLYPHICON_CORRECT_CLS = "glyphicon-ok-circle";
var LI_GLYPHICON_INCORRECT_CLS = "glyphicon-remove-circle";


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

function hasGetUserMedia(){
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

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

function record(id, index, self){
    if(ASR.isInitialized()){
        var pState = self.state.playableState;
        var oldCA = self.state.clickedAnswer;
        if(oldCA != 0){
            pState[oldCA.index] = false;
        }
        ASR.StartRecording();
        var clickedAnswer = {
            index: index
        };
        self.setState({
            clickedAnswer: clickedAnswer,
            playableState: pState
        });
    }else {
        var audio = document.getElementById("li-demo-audio");
        navigator.getUserMedia({video: false, audio: true}, onSuccess, onFail);
    }
}

// pass the audio handle to stopRecording
function stopRecording(id, index, self){
    if(ASR.isInitialized()){
        ASR.StopRecording();
        ASR.RecognizeRecording();
    }else {
        var audio = document.getElementById(id);
        recorder.stop();
        recorder.exportWAV(function (s) {
            audio.src = window.URL.createObjectURL(s);
        });
    }
}

function handlePlaying(id, index, self){
    if(ASR.isInitialized()){
        ASR.PlayRecording();
    }else {
        if (self.state.isPlaying[index]) {
            stop(id, index, self);
        } else {
            play(id, index, self);
        }
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
    if (newRecordingState[index]) {
        stopRecording(id, index, self);
        var newPlayableState = self.state.playableState;
        newPlayableState[index] = true;
        newRecordingState[index] = false;
        self.setState({
            recordingState: newRecordingState,
            playableState: newPlayableState
        })
    } else {
       // if(self.state.message != "recordingStarted") {
            record(id, index, self);
            newRecordingState[index] = true;
            self.setState({
                recordingState: newRecordingState
            });
       // }
    }
}

function getPageState(props) {
    var data = {
        page: "",
        sources: [],
        notes: "",
        recordingState: [],
        playableState: [],
        isPlaying: [],
        isCorrect: [],
        utterings: [],
        message: "",
        recordedSpeech: "",
        clickedAnswer: 0,
        title: "",
        pageType: ""
    };

    data.message = ASRStore.GetMessage();

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
    }

    var counter = 0;
    data.notes = data.page.nut.map(function(item, index){
        if(item.uttering){
            data.recordingState.push(false);
            data.playableState.push(false);
            data.isPlaying.push(false);
            data.isCorrect.push(null);
            data.utterings.push(item);
            counter++;
        }
        if(item.note){
            return(<p key={data.page.xid + "note" + index} >{item.note.text}</p>);
            //data.notes[counter] = item.note.text;
            //possible error if 2 notes in a row
        }
    });
    return data;
}



// Plays Audio filed named with the xid(zid?) given
function playAudio(xid){
    var audio = document.getElementById('li-demo-audio');
    //var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    audio.src = "data/media/" + xid + ".mp3";
    // play audio, or stop the audio if currently playing
    if(audio.paused){
        audio.load();
        audio.play();
    }else{
        audio.pause();
    }

}

function textClick(id, index, self){
    var zid = self.state.utterings[index].uttering.media[0].zid;
    // get audio.
    playAudio(zid);
}

var PronunciationView = React.createClass({
    getInitialState: function() {
        return getPageState(this.props);
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        ASRStore.addChangeListener(this._onChange);
        //PageStore.addChangeListener(this._onChange);
        if(hasGetUserMedia()){
            // UserMedia allowed
        }else{
            // UserMedia not allowed
        }

        if(ConfigStore.isASREnabled()){
            if(!ASR.isInitialized()){
                ASR.InitializeASR();
            }
        }
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
        ASRStore.removeChangeListener(this._onChange);
    },

    render: function() {
        var self = this;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var questions = self.state.utterings || [];
        var nativeText = "";
        var translatedText = "";
        var ezreadText = "";
        var note = self.state.notes || "";
        var feedbackClass = "glyphicon li-glyphicon li-feedback";
        var recordedClass = "glyphicon li-glyphicon li-playback";
        var recordingClass = "glyphicon li-glyphicon li-record";

        // need to check for notes and send those  to top of page
        var vaList = questions.map(function(item, index){
            if(item && item.uttering && item.uttering.utterance) {
                //note = self.state.notes[index] || "";
                nativeText = item.uttering.utterance.native.text || "";
                translatedText = item.uttering.utterance.translation.text || "";
                ezreadText = item.uttering.utterance.ezread.text || "";
                var id = "audio" + index;
                var itemFeedbackClass = "";
                var itemRecordedClass = "";
                var itemRecordingClass = "";


                var isCorrect = self.state.isCorrect[index];
                if(isCorrect != null){
                    if (isCorrect) {
                        itemFeedbackClass = feedbackClass + " li-correct " + LI_GLYPHICON_CORRECT_CLS;
                    } else {
                        itemFeedbackClass = feedbackClass + " li-incorrect " + LI_GLYPHICON_INCORRECT_CLS;
                    }
                }else{
                    itemFeedbackClass = feedbackClass;
                }

                var hasRecorded = self.state.playableState[index];
                if (hasRecorded) {
                    if (self.state.isPlaying[index]) {
                        itemRecordedClass = recordedClass + " " + LI_GLYPHICON_STOP_CLS;
                    } else {
                        itemRecordedClass = recordedClass + " " + LI_GLYPHICON_PLAY_CLS;
                    }
                } else {
                    itemRecordedClass = recordedClass;
                }

                //if(self.state.message != "No data found.") {
                if(self.state.message != "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn.") {
                    var isRecording = self.state.recordingState[index];
                    if (isRecording) {
                        itemRecordingClass = recordingClass + " " + LI_GLYPHICON_STOP_CLS;
                    } else {
                        itemRecordingClass = recordingClass + " " + LI_GLYPHICON_RECORD_CLS;
                    }
                }

                return (
                    <div className="row pronunciation-item-row" key={page.xid + String(index)}>
                        <div className="col-sm-1 col-md-2">
                            <audio id={id}></audio>
                            <div className="pronunciation-audio-button">
                                <span className={itemRecordingClass} onClick={function(){handleRecord(id, index, self)}}></span>
                                <span className={itemRecordedClass} onClick={function(){handlePlaying(id, index, self)}}></span>
                            </div>
                        </div>
                        <div className="col-sm-11 col-md-10">
                            <div className="pronunciation-text-container">
                                <div className="li-text-area" id={"text-"+id} onClick={function(){textClick(id, index, self)}}>
                                    <div className="li-native-text">
                                        <ColorText props={nativeText}/>
                                    </div>
                                    <div className="li-ezread-text">
                                        <ColorText props={ezreadText}/>
                                    </div>
                                    <div className="li-translated-text">
                                        <ColorText props={translatedText}/>
                                    </div>
                                </div>
                            </div>
                            <span className={itemFeedbackClass}></span>
                        </div>
                    </div>
                );
            }
        });

        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <audio id="li-demo-audio"></audio>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                    <div className="container-fluid li-container">
                        <h4 className="li-note-text">{note}</h4>
                        {vaList}
                    </div>
                </div>
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        var state = this.state;
        var newIsCorrect = state.isCorrect;
        var newMessage = ASRStore.GetMessage();
        var recordedSpeech = "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn.";

        if(!ConfigStore.isASREnabled()){
            newMessage = "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn.";
        }

        switch(newMessage){
            case "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn.":
                break;
            case "initialized":
                console.log(newMessage);
                break;
            case "recordingStarted":
                console.log(newMessage);
                break;
            case "recordingStopped":
                console.log(newMessage);
                break;
            default:
                recordedSpeech = eval("(" + newMessage + ")").result;
                var ind = state.clickedAnswer.index || 0 ;
                var text = state.utterings[ind].uttering.utterance.native.text;
                if(AGeneric().purgeString(text) == AGeneric().purgeString(recordedSpeech)){
                    //mark as correct
                    newIsCorrect[ind] = true;
                }else{
                    //mark as incorrect
                    newIsCorrect[ind] = false;
                }
        }

        if(this.isMounted()) {
            this.setState(getPageState(this.props));
            if(ConfigStore.isASREnabled()){
                this.setState({
                    message: newMessage,
                    recordedSpeech: recordedSpeech,
                    isCorrect: newIsCorrect
                });
            }
        }
    }
});

module.exports = PronunciationView;