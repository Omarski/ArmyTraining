var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var ColorText = require('../../../components/widgets/ColorText');
var ASRStore = require('../../../stores/ASRStore');
var ConfigStore = require('../../../stores/ConfigStore');
var PageHeader = require('../../widgets/PageHeader');
var LocalizationStore = require('../../../stores/LocalizationStore');

// CONSTANTS
/*
var LI_GLYPHICON_RECORD_CLS = "glyphicon glyphicon-record";
var LI_GLYPHICON_LISTEN_CLS = "glyphicon glyphicon-play-circle";
var LI_GLYPHICON_STOP_CLS = "fa fa-stop-circle-o";
var LI_GLYPHICON_PLAY_CLS = "glyphicon glyphicon-repeat";
var LI_GLYPHICON_CORRECT_CLS = "glyphicon glyphicon-ok-circle";
var LI_GLYPHICON_INCORRECT_CLS = "glyphicon glyphicon-remove-circle";
*/

var LI_GLYPHICON_RECORD = (<img src="images/icons/recordn.png" />); // "glyphicon glyphicon-record";
var LI_GLYPHICON_LISTEN = (<img src="images/icons/playrecordn.png" />); // "glyphicon glyphicon-play-circle";
var LI_GLYPHICON_STOP = (<img src="images/icons/stoprecordn.png" />); // "fa fa-stop-circle-o";
var LI_GLYPHICON_PLAY = (<img src="images/icons/playrecordingn.png" />); // "glyphicon glyphicon-repeat";
var LI_GLYPHICON_CORRECT = (<img src="images/icons/completeexplorer.png" />); // "glyphicon glyphicon-ok-circle";
var LI_GLYPHICON_INCORRECT = (<img src="images/icons/failedquiz.png" />); // "glyphicon glyphicon-remove-circle";

var recorder;

var onFail = function(e){
   // An Error has occured.
};

function hasGetUserMedia(){
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var onSuccess = function(s){
    var context = new AudioContext();
    var mediaStreamSource = context.createMediaStreamSource(s);
    recorder = new Recorder(mediaStreamSource);
    recorder.record();

};

function record(id, index, self){
    if(ASRStore.isInitialized()){
        var pState = self.state.playableState;
        var oldCA = self.state.clickedAnswer;
        if(oldCA != 0){
            pState[oldCA.index] = false;
        }
        ASRStore.StartRecording();
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
    if(ASRStore.isInitialized()){
        ASRStore.StopRecording();
       // ASRStore.RecognizeRecording();
    }else {
        var audio = document.getElementById(id);
        recorder.stop();
        recorder.exportWAV(function (s) {
            audio.src = window.URL.createObjectURL(s);
        });
    }
}

function handlePlaying(id, index, self, recordedClass, fd){
    // if(recordedClass !== "pb-disabled") {
    //     if (ASRStore.isInitialized()) {
    //         ASRStore.PlayRecording();
    //     } else {
    //         if (self.state.isPlaying[index]) {
    //             stop(id, index, self);
    //         } else {
    //             play(id, index, self);
    //         }
    //     }
    // }
    if(!fd){
        if(self.state.playableState[index]){
            if (ASRStore.isInitialized()) {
                ASRStore.PlayRecording();
            } else {
                if (self.state.isPlaying[index]) {
                    stop(id, index, self);
                } else {
                    play(id, index, self);
                }
            }
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

function handleRecord(id, index, self, fd){  // record if not currently recording
    var newRecordingState = self.state.recordingState;
    if(!fd){
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
            //  if(self.state.message != "recordingStarted") {
            record(id, index, self);
            newRecordingState[index] = true;
            self.setState({
                recordingState: newRecordingState
            });
            //  }
        }
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
        isListening: [],
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
            data.isListening.push(false);
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
function playAudio(xid, index, self){
    var audio = document.getElementById('audio');
    var isListening = self.state.isListening;


    //var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    audio.src = "data/media/" + xid + ".mp3";
    // play audio, or stop the audio if currently playing
    if(!self.state.isListening[index]){
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
        isListening.map(function(item, i){
            if(i !== index){
                isListening[i] = false;
            }
        });
        isListening[index] = true;
        self.setState({isListening: isListening});
        // set ended function
        $(audio).bind('ended', function(){
            isListening[index] = false;
            self.setState({isListening: isListening});
        });

    }else{
        audio.pause();
        isListening[index] = false;
        self.setState({isListening: isListening});
    }

}

function textClick(id, index, self){
    var isListening = self.state.isListening;

    if(isListening[index]){
        isListening[index] = false;
        var audio = document.getElementById('audio');
        audio.pause();
        self.setState({isListening: isListening});
    }else{

        var zid = self.state.utterings[index].uttering.media[0].zid;
        // get audio.
        setTimeout(function(){playAudio(zid, index, self)}, 100);
    }


}

var PronunciationView = React.createClass({
    getInitialState: function() {
        return getPageState(this.props);
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        ASRStore.addChangeListener(this._onMessageRecieved);
        // if browser can use webAudioAPI, use that
        // otherwise use Java Applet as a fallback
        //if(hasGetUserMedia()){
        //    // UserMedia allowed
        //}else{
        //    // UserMedia not allowed
        //    if(!ASRStore.isInitialized()){
        //        ASRStore.InitializeASR();
        //    }
        //}

    //    if(ConfigStore.isASREnabled()){
    //        if(!ASRStore.isInitialized()){
    //            ASRStore.InitializeASR();
    //        }
    //    }



    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
        ASRStore.removeChangeListener(this._onMessageRecieved);
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
        var feedbackClass = "";
        var recordedClass = "";
        var recordingClass = "";
        var displayTracker = state.displayTracker;
        var questionCounter = 0;
        var noteCounter = 0;
        var fullDisable = (!ASRStore.isInitialized() && !hasGetUserMedia());


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
                var itemFeedbackIcon = "";
                var itemRecordingIcon = "";
                var itemRecordedIcon = "";

                if(nativeText !== ""){
                    nativeText = (<tr>
                        <td colSpan="4">
                            <div className="pronunciation-native">
                                <ColorText props={nativeText}/>
                            </div>
                        </td>
                    </tr>);
                }

                if(translatedText !== ""){
                    translatedText = (<tr>
                        <td colSpan="4">
                            <div className="pronunciation-translated">
                                <ColorText props={translatedText}/>
                            </div>
                        </td>
                    </tr>);
                }

                if(ezreadText !== ""){
                    ezreadText = (<td>
                        <div className="pronunciation-ezread">
                            <ColorText props={ezreadText}/>
                        </div>
                    </td>);
                }


                var isCorrect = self.state.isCorrect[qcIndex];
                if(isCorrect != null){
                    if (isCorrect) {
                        itemFeedbackClass = feedbackClass;
                        itemFeedbackIcon = LI_GLYPHICON_CORRECT;
                    } else {
                        itemFeedbackClass = feedbackClass;
                        itemFeedbackIcon = LI_GLYPHICON_INCORRECT;
                    }
                }else{
                    itemFeedbackClass = feedbackClass;
                }

                var hasRecorded = self.state.playableState[qcIndex];
                if (hasRecorded) {
                    recordedClass = "";
                } else {
                    recordedClass = "pb-disabled";
                }
                if(fullDisable){
                    recordedClass = "pb-disabled";
                }
                if (self.state.isPlaying[qcIndex]) {
                    itemRecordedClass = recordedClass;
                    itemRecordedIcon = LI_GLYPHICON_STOP;
                } else {
                    itemRecordedClass = recordedClass;
                    itemRecordedIcon = LI_GLYPHICON_PLAY;
                }

                //if(self.state.message != "No data found.") {
                if(self.state.message != "This needs to be a unique message that isn't returned by the applet." || ASRStore.isInitialized()) {
                    var isRecording = self.state.recordingState[qcIndex];
                    if (isRecording) {
                        itemRecordingClass = recordingClass;
                        itemRecordingIcon = LI_GLYPHICON_STOP;
                    } else {
                        itemRecordingClass = recordingClass;
                        itemRecordingIcon = LI_GLYPHICON_RECORD;
                    }
                }
                if(fullDisable){
                    itemRecordingClass = recordingClass + " pb-disabled ";
                    itemRecordingIcon = LI_GLYPHICON_RECORD;
                }

                var cls = (index % 2) ? "pronunciation-item-row-odd" : "pronunciation-item-row-even";

                return (
                    <tr><table className={"col-md-8 table table-condensed pronunciation-view-table pronunciation-item-row " + cls}>
                        <tbody>
                            <tr>
                                <td rowSpan="2" width="25">
                                    <audio id={id}></audio>
                                    <button title={LocalizationStore.labelFor("PronunciationPage", "btnPlay")}
                                        alt={LocalizationStore.labelFor("PronunciationPage", "btnPlay")}
                                        type="button" onClick={function(){textClick(id, qcIndex, self)}}
                                        className="btn btn-default btn-lg btn-link btn-step btn-pronunciation"
                                        aria-label={LocalizationStore.labelFor("PronunciationPage", "btnPlay")}>
                                        <span className={"pronunciation-audio-button "} >
                                            {(state.isListening[qcIndex] ? LI_GLYPHICON_STOP : LI_GLYPHICON_LISTEN)}
                                        </span>
                                    </button>
                                </td>
                                <td rowSpan="2" width="25">
                                    <button title={LocalizationStore.labelFor("PronunciationPage", "btnRecord")}
                                            alt={LocalizationStore.labelFor("PronunciationPage", "btnRecord")}
                                            type="button" onClick={function(){handleRecord(id, qcIndex, self, fullDisable)}}
                                            className="btn btn-default btn-lg btn-link btn-step btn-pronunciation"
                                            aria-label={LocalizationStore.labelFor("PronunciationPage", "btnRecord")}>
                                            <span className={itemRecordingClass + " pronunciation-audio-button"} >
                                                {itemRecordingIcon}
                                            </span>
                                    </button>
                                </td>
                                <td rowSpan="2" width="25">
                                    <button title={LocalizationStore.labelFor("PronunciationPage", "btnPlayback")}
                                            alt={LocalizationStore.labelFor("PronunciationPage", "btnPlayback")}
                                            type="button" onClick={function(){handlePlaying(id, qcIndex, self, recordedClass, fullDisable)}}
                                            className="btn btn-default btn-lg btn-link btn-step btn-pronunciation"
                                            aria-label={LocalizationStore.labelFor("PronunciationPage", "btnPlayback")}>
                                        <span className={itemRecordedClass + " pronunciation-audio-button"} >
                                            {itemRecordedIcon}
                                        </span>
                                    </button>

                                    <span className={itemFeedbackClass}>
                                        {itemFeedbackIcon}
                                    </span>

                                </td>
                                {ezreadText}
                            </tr>

                            {translatedText}
                        </tbody>
                    </table></tr>

                );

            }else if(item === "note"){
                note = self.state.notes[noteCounter] || "";
                noteCounter++;
                return(<tr className="col-md-12 pronunciation-note-tr"><td colSpan="4"><p className="pronunciation-note" key={page.xid + "note" + String(noteCounter-1)} >{note}</p></td></tr>);
            }else{
                return("");
            }

        });

        // table with border-radius seems to get cut off in the table

        return (
            <div key={"page-" + this.state.page.xid}>
                <div>
                    <audio id="audio" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                        <source id="mp3Source" src="" type="audio/mp3"></source>
                        Your browser does not support the audio format.
                    </audio>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                    <table className="table table-condensed pronunciation-container-table">
                        <tbody>
                        {vaList}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        if(this.isMounted()) {
            this.setState(getPageState(this.props));
        }
    },

    _onMessageRecieved: function(){
        var state = this.state;
        var newIsCorrect = state.isCorrect;
        var newMessage = ASRStore.GetMessage();
        var recordedSpeech = "This needs to be a unique message that isn't returned by the applet.";

        if(!ConfigStore.isASREnabled()){
            newMessage = "This needs to be a unique message that isn't returned by the applet.";
        }
        //"the current message is: " + newMessage
        switch(newMessage){
            case "This needs to be a unique message that isn't returned by the applet.":
                break;
            case "initialized":

                break;
            case "recordingStarted":

                break;
            case "recordingStopped":
                
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
            if(ASRStore.isInitialized()){
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