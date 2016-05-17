var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var ColorText = require('../../../components/widgets/ColorText');
var ASRStore = require('../../../stores/ASRStore');
var ConfigStore = require('../../../stores/ConfigStore');
var PageHeader = require('../../widgets/PageHeader');

// CONSTANTS

var LI_GLYPHICON_RECORD_CLS = "glyphicon-record";
var LI_GLYPHICON_LISTEN_CLS = "glyphicon-play-circle";
var LI_GLYPHICON_STOP_CLS = "glyphicon-stop";
var LI_GLYPHICON_PLAY_CLS = "glyphicon-refresh";
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
        var audio = document.getElementById("audio");
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
        notes: [],
        recordingState: [],
        playableState: [],
        isPlaying: [],
        isCorrect: [],
        utterings: [],
        message: "",
        recordedSpeech: "",
        clickedAnswer: 0,
        title: "",
        displayTracker: [],
        pageType: ""
    };

    data.message = ASRStore.GetMessage();

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
    }

    var counter = 0;
    data.page.nut.map(function(item, index){
        if(item.uttering){
            data.recordingState.push(false);
            data.playableState.push(false);
            data.isPlaying.push(false);
            data.isCorrect.push(null);
            data.utterings.push(item);
            data.displayTracker.push("question");
        }
        if(item.note){
            //return(<p key={data.page.xid + "note" + index} >{item.note.text}</p>);
            data.notes[counter] = item.note.text;
            data.displayTracker.push("note");
            counter++;
            //possible error if 2 notes in a row
        }
    });
    return data;
}



// Plays Audio filed named with the xid(zid?) given
function playAudio(xid){
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    audio.src = "data/media/" + xid + ".mp3";
    // play audio, or stop the audio if currently playing
    if(audio.paused){
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
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
        var state = self.state;
        var page = state.page;
        var title = state.title;
        var sources = state.sources;
        var questions = state.utterings || [];
        var nativeText = "";
        var translatedText = "";
        var ezreadText = "";
        var note = "";
        var feedbackClass = "glyphicon";
        var recordedClass = "glyphicon";
        var recordingClass = "glyphicon";
        var displayTracker = state.displayTracker;
        var questionCounter = 0;
        var noteCounter = 0;


        // need to check for notes and send those  to top of page
        var vaList = displayTracker.map(function(item, index){
            if(item === "question"){
                var qcIndex = questionCounter;
                questionCounter++;
                nativeText = questions[qcIndex].uttering.utterance.native.text || "";
                translatedText = questions[qcIndex].uttering.utterance.translation.text || "";
                ezreadText = questions[qcIndex].uttering.utterance.ezread.text || "";

                var id = "audio" + qcIndex;
                var itemFeedbackClass = "";
                var itemRecordedClass = "";
                var itemRecordingClass = "";

                if(nativeText !== ""){
                    nativeText = (<tr>
                        <td colSpan="4">
                            <div>
                                <ColorText props={nativeText}/>
                            </div>
                        </td>
                    </tr>);
                }

                if(translatedText !== ""){
                    translatedText = (<tr>
                        <td colSpan="4">
                            <div>
                                <ColorText props={translatedText}/>
                            </div>
                        </td>
                    </tr>);
                }

                if(ezreadText !== ""){
                    ezreadText = (<td>
                        <div>
                            <ColorText props={ezreadText}/>
                        </div>
                    </td>);
                }


                var isCorrect = self.state.isCorrect[qcIndex];
                if(isCorrect != null){
                    if (isCorrect) {
                        itemFeedbackClass = feedbackClass + " " + LI_GLYPHICON_CORRECT_CLS;
                    } else {
                        itemFeedbackClass = feedbackClass + " " + LI_GLYPHICON_INCORRECT_CLS;
                    }
                }else{
                    itemFeedbackClass = feedbackClass;
                }

                var hasRecorded = self.state.playableState[qcIndex];
                if (hasRecorded) {
                    if (self.state.isPlaying[qcIndex]) {
                        itemRecordedClass = recordedClass + " " + LI_GLYPHICON_STOP_CLS;
                    } else {
                        itemRecordedClass = recordedClass + " " + LI_GLYPHICON_PLAY_CLS;
                    }
                } else {
                    itemRecordedClass = recordedClass;
                }
                //if(self.state.message != "No data found.") {
                if(self.state.message != "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn.") {
                    var isRecording = self.state.recordingState[qcIndex];
                    if (isRecording) {
                        itemRecordingClass = recordingClass + " " + LI_GLYPHICON_STOP_CLS;
                    } else {
                        itemRecordingClass = recordingClass + " " + LI_GLYPHICON_RECORD_CLS;
                    }
                }

                var cls = (index % 2) ? "pronunciation-item-row-odd" : "pronunciation-item-row-even";


                return (
                    <table className={"table pronunciation-view-table pronunciation-item-row " + cls}>
                        <tbody>
                            {nativeText}

                            <tr>
                                <td rowSpan="2" width="25">
                                    <audio id={id}></audio>
                                    <span className={"glyphicon pronunciation-audio-button "+ LI_GLYPHICON_LISTEN_CLS} onClick={function(){textClick(id, qcIndex, self)}}></span>
                                </td>
                                <td rowSpan="2" width="25">
                                    <span className={itemRecordingClass + " pronunciation-audio-button"} onClick={function(){handleRecord(id, qcIndex, self)}}></span>
                                </td>
                                <td rowSpan="2" width="25">
                                    <span className={itemRecordedClass + " pronunciation-audio-button"} onClick={function(){handlePlaying(id, qcIndex, self)}}></span>

                                    <span className={itemFeedbackClass}></span>

                                </td>
                                {ezreadText}
                            </tr>

                            {translatedText}
                        </tbody>
                    </table>

                );

            }else if(item === "note"){
                note = self.state.notes[noteCounter] || "";
                noteCounter++;
                return(<tr><td colSpan="4"><p key={page.xid + "note" + String(noteCounter-1)} >{note}</p></td></tr>);
            }else{
                return("");
            }

        });

        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <audio id="audio" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                        <source id="mp3Source" src="" type="audio/mp3"></source>
                        Your browser does not support the audio format.
                    </audio>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                    {vaList}
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