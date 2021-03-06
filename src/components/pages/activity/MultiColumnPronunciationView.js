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
var L2_GLYPHICON_CORRECT_CLS = "glyphicon glyphicon-ok-circle";
var L2_GLYPHICON_INCORRECT_CLS = "glyphicon glyphicon-remove-circle";
var L2_GLYPHICON_STOP_CLS = "fa fa-stop-circle-o";
var L2_GLYPHICON_PLAY_CLS = "glyphicon glyphicon-repeat";
var L2_GLYPHICON_RECORD_CLS = "glyphicon glyphicon-record";
var L2_GLYPHICON_CLS = "l2-glyphicon";
var L2_GLYPHICON_LISTEN_CLS = "glyphicon glyphicon-play-circle";
*/

var L2_GLYPHICON_RECORD = (<img src="images/icons/recordn.png" />); // "glyphicon glyphicon-record";
var L2_GLYPHICON_LISTEN = (<img src="images/icons/playrecordn.png" />); // "glyphicon glyphicon-play-circle";
var L2_GLYPHICON_STOP = (<img src="images/icons/stoprecordn.png" />); // "fa fa-stop-circle-o";
var L2_GLYPHICON_PLAY = (<img src="images/icons/playrecordingn.png" />); // "glyphicon glyphicon-repeat";
var L2_GLYPHICON_CORRECT = (<img src="images/icons/completeexplorer.png" />); // "glyphicon glyphicon-ok-circle";
var L2_GLYPHICON_INCORRECT = (<img src="images/icons/failedquiz.png" />); // "glyphicon glyphicon-remove-circle";


var recorder;

function hasGetUserMedia(){
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

function getPageState(props) {
    var data;
    data = {
        page: null,
        title: "",
        columns: 2,
        sources: [],
        pageType: "",
        cols: [],
        note: [],
        playableState: [],
        isCorrect: [],
        isPlaying: [],
        isListening: [],
        recordingState: [],
        message: "",
        recordedSpeech: "",
        clickedAnswer: 0
    };

    data.message = ASRStore.GetMessage();

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
    }
    var isColElementCorrect = [];
    var colElementPlayableState = [];
    var isColElementPlaying = [];
    var isColElementListening = [];
    var colElementRecordingState = [];
    for(var i=0; i<data.columns; i++){
        data.cols.push([]);
        isColElementCorrect.push([]);
        colElementPlayableState.push([]);
        isColElementPlaying.push([]);
        isColElementListening.push([]);
        colElementRecordingState.push([]);
    }

    data.page.row.map(function(item, index){
        item.nut.forEach(function(uttering, nutIndex){
            var colNumber = 0;
            if(data.cols.length != 0){
                colNumber = nutIndex % (data.cols.length);
            }
            if(uttering.note){
                data.note.push(uttering.note.text);
            }else{
                data.cols[colNumber].push(uttering);
                isColElementCorrect[colNumber].push(null);
                colElementPlayableState[colNumber].push(false);
                isColElementPlaying[colNumber].push(false);
                isColElementListening[colNumber].push(false);
                colElementRecordingState[colNumber].push(false);
            }

        });
    });
    data.isCorrect = isColElementCorrect;
    data.playableState = colElementPlayableState;
    data.isPlaying = isColElementPlaying;
    data.isListening = isColElementListening;
    data.recordingState = colElementRecordingState;

    return data;
}

var onFail = function(e){
   // An Error has occured
};

var onSuccess = function(s){
    var context = new AudioContext();
    var mediaStreamSource = context.createMediaStreamSource(s);
    recorder = new Recorder(mediaStreamSource);
    recorder.record();
};

//var id = "" + colNumber + "audio" + index;
function handleRecord(id, colNumber, index, self, fd){
    var newRecordingState = self.state.recordingState;
    if(!fd){
        if (newRecordingState[colNumber][index]) {
            stopRecording(id, colNumber, index, self);
            var newPlayableState = self.state.playableState;
            newPlayableState[colNumber][index] = true;
            newRecordingState[colNumber][index] = false;
            self.setState({
                recordingState: newRecordingState,
                playableState: newPlayableState
            })
        } else {
            // if(self.state.message != "recordingStarted") {
            record(id, colNumber, index, self);
            newRecordingState[colNumber][index] = true;
            self.setState({
                recordingState: newRecordingState
            });
            // }
        }
    }
}

function play(id, colNumber, index, self){
    var a = document.getElementById(id);
    // might need to be $(a)
    $(a).bind('ended', function(){
        stop(id, colNumber, index, self);
    });
    a.play();
    var newPlayingState = self.state.isPlaying;
    newPlayingState[colNumber][index] = true;
    self.setState({
        isPlaying: newPlayingState
    });
}

function stop(id, colNumber, index, self){
    var a = document.getElementById(id);
    a.pause();
    a.currentTime = 0;
    var newPlayingState = self.state.isPlaying;
    newPlayingState[colNumber][index] = false;
    self.setState({
        isPlaying: newPlayingState
    });
}

function record(id, colNumber, index, self){
    if(ASRStore.isInitialized()){
        var pState = self.state.playableState;
        var oldCA = self.state.clickedAnswer;
        if(oldCA != 0){
            pState[oldCA.colNumber][oldCA.index] = false;
        }
        ASRStore.StartRecording();
        var clickedAnswer = {
            colNumber: colNumber,
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
function stopRecording(id, colNumber, index, self){
    if(ASRStore.isInitialized()){
        ASRStore.StopRecording();
      //  ASR.RecognizeRecording();
    }else {
        var audio = document.getElementById(id);
        recorder.stop();
        recorder.exportWAV(function (s) {
            audio.src = window.URL.createObjectURL(s);
        });
    }
}

function handlePlaying(id, colNumber, index, self, recordedClass, fd){
    if(!fd){
        if(self.state.playableState[colNumber][index]) {
            if (ASRStore.isInitialized()) {
                ASRStore.PlayRecording();
            } else {
                if (self.state.isPlaying[colNumber][index]) {
                    stop(id, colNumber, index, self);
                } else {
                    play(id, colNumber, index, self);
                }
            }
        }
    }
}

function textClick(id, colNumber, index, self){
    var isListening = self.state.isListening;
    var uttering = self.state.cols[colNumber][index].uttering;
    var zid = 0;
    if(uttering.media && uttering.media[0] && uttering.media[0].zid){
        zid = uttering.media[0].zid;
    }


    if(isListening[colNumber][index]){
        isListening[colNumber][index] = false;
        var audio = document.getElementById('l2-demo-audio');
        audio.pause();
        self.setState({isListening: isListening});
    }else{
        // get audio.
        setTimeout(function(){playAudio(zid, colNumber, index, self)},100);
    }


}

function playAudio(xid, colNumber, index, self){
    var audio = document.getElementById('l2-demo-audio');
    var isListening = self.state.isListening;
    //var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    audio.src = "data/media/" + xid + ".mp3";
    // play audio, or stop the audio if currently playing
    if(self.state.isListening[colNumber][index]){
        audio.pause();
        isListening[colNumber][index] = false;
        self.setState({isListening: isListening});
    }else{
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
        isListening.map(function(itemi, i){
            isListening[i].map(function(itemj, j){
                if(i !== colNumber && j !== index){
                    isListening[i][j] = false;
                }
            });
        });
        isListening[colNumber][index] = true;
        self.setState({isListening: isListening});
        $(audio).bind('ended', function(){
            isListening[colNumber][index] = false;
            self.setState({isListening: isListening});
        });
    }

}

var MultiColumnPronunciationView = React.createClass({
    getInitialState: function() {
        return getPageState(this.props);
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        ASRStore.addChangeListener(this._onMessageRecieved);
        //PageStore.addChangeListener(this._onChange);
        //if(hasGetUserMedia()){
        //    // UserMedia allowed
        //}else{
        //    // UserMedia not allowed
        //}

        //if(ConfigStore.isASREnabled()){
        //    if(!ASRStore.isInitialized()){
        //        ASRStore.InitializeASR();
        //    }
        //}
    },

    componentDidUpdate: function(){

    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
        ASRStore.removeChangeListener(this._onMessageRecieved);
    },

    render: function() {

        var self = this;
        var state = self.state;
        var page = state.page;
        var nativeText = "";
        var translatedText = "";
        var ezreadText = "";
        var note = "";
        var title = state.title;
        var sources = state.sources;
        var feedbackClass = "";
        var recordedClass = "";
        var recordingClass = "";
        var fullDisable = (!ASRStore.isInitialized() && !hasGetUserMedia());

        var columns = self.state.cols.map(function(colList, colNumber){
            var vaList = colList.map(function(item, index){
                if(item && item.uttering && item.uttering.utterance) {
                    nativeText = item.uttering.utterance.native.text || "";
                    translatedText = item.uttering.utterance.translation.text || "";
                    ezreadText = item.uttering.utterance.ezread.text || "";

                    var id = "" + colNumber + "audio" + index;
                    var itemFeedbackClass = "";
                    var itemRecordedClass = "";
                    var itemRecordingClass = "";

                    var itemFeedback = "";
                    var itemRecorded = "";
                    var itemRecording = "";


                    var isCorrect = self.state.isCorrect[colNumber][index];
                    if (isCorrect != null) {
                        if(isCorrect){
                            itemFeedbackClass = feedbackClass + " l2-correct ";
                            itemFeedback = L2_GLYPHICON_CORRECT;
                        }else{
                            itemFeedbackClass = feedbackClass + " l2-incorrect ";
                            itemFeedback = L2_GLYPHICON_INCORRECT;
                        }
                    } else {
                        itemFeedbackClass = feedbackClass;
                    }
                    recordedClass = "";
                    var hasRecorded = self.state.playableState[colNumber][index];
                    if (hasRecorded) {
                        recordedClass = " ";
                    } else {
                        recordedClass = "pb-disabled";
                    }
                    if(fullDisable){
                        recordedClass = "pb-disabled";
                    }
                    if (self.state.isPlaying[colNumber][index]) {
                        itemRecordedClass = recordedClass;
                        itemRecorded = L2_GLYPHICON_STOP;
                    } else {
                        itemRecordedClass = recordedClass;
                        itemRecorded = L2_GLYPHICON_PLAY;
                    }


                    //if(self.state.message != "No data found.") {
                    if(self.state.message != "This needs to be a unique message that isn't returned by the applet." || ASRStore.isInitialized()) {
                        var isRecording = self.state.recordingState[colNumber][index];
                        if (isRecording) {
                            itemRecordingClass = recordingClass;
                            itemRecording = L2_GLYPHICON_STOP;
                        } else {
                            itemRecordingClass = recordingClass;
                            itemRecording = L2_GLYPHICON_RECORD;
                        }
                    }
                    if(fullDisable){
                        itemRecordingClass = recordingClass + " pb-disabled ";
                        itemRecording = L2_GLYPHICON_RECORD;
                    }

                    // translatedText, ezreadText, nativeText
                    //update?

                    return (
                    <table className={"table table-condensed pronunciation-view-table l2-pronunciation-item-row " + "l2-vocal-answer"}
                           key={page.xid + String(index)}>
                        <tbody>
                        <tr>
                            <td rowSpan="2" width="25">
                                <audio id={id}></audio>
                                <button title={LocalizationStore.labelFor("PronunciationPage", "btnPlay")}
                                        alt={LocalizationStore.labelFor("PronunciationPage", "btnPlay")}
                                        type="button" onClick={function(){textClick(id, colNumber, index, self)}}
                                        className="btn btn-default btn-lg btn-link btn-step l2-btn"
                                        aria-label={LocalizationStore.labelFor("PronunciationPage", "btnPlay")}>
                                    <span className={"glyphicon pronunciation-audio-button "} >
                                        {(state.isListening[colNumber][index] ? L2_GLYPHICON_STOP : L2_GLYPHICON_LISTEN)}
                                    </span>
                                </button>
                            </td>
                            <td rowSpan="2" width="25">
                                <button title={LocalizationStore.labelFor("PronunciationPage", "btnRecord")}
                                        alt={LocalizationStore.labelFor("PronunciationPage", "btnRecord")}
                                        type="button" onClick={function(){handleRecord(id, colNumber, index, self, fullDisable)}}
                                        className="btn btn-default btn-lg btn-link btn-step l2-btn"
                                        aria-label={LocalizationStore.labelFor("PronunciationPage", "btnRecord")}>
                                    <span className={itemRecordingClass + " pronunciation-audio-button"} >
                                        {itemRecording}
                                    </span>
                                </button>
                            </td>
                            <td rowSpan="2" width="25">
                                <button title={LocalizationStore.labelFor("PronunciationPage", "btnPlayback")}
                                        alt={LocalizationStore.labelFor("PronunciationPage", "btnPlayback")}
                                        type="button" onClick={function(){handlePlaying(id, colNumber, index, self, recordedClass, fullDisable)}}
                                        className="btn btn-default btn-lg btn-link btn-step l2-btn"
                                        aria-label={LocalizationStore.labelFor("PronunciationPage", "btnPlayback")}>
                                    <span className={itemRecordedClass + " pronunciation-audio-button"} >
                                        {itemRecorded}
                                    </span>
                                </button>
                                <span className={itemFeedbackClass}>
                                    {itemFeedback}
                                </span>
                            </td>
                            <td className="l2-native-text">
                                <div className="l2-native-text">
                                    <ColorText props={nativeText}/>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="l2-ezread-text" colSpan="4">
                                <div>
                                    <ColorText props={ezreadText}/>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    );
                }
            });
            return(
                <div key={page.xid + String(colNumber)} className="col-md-6 l2-column">
                    {vaList}
                </div>
            );
        });

        var finalColumns = columns[0].props.children.map(function(item, index){
            return (<tr key={page.xid + String(index) + "l2-table-rows"} className="l2-two-column-row">
                <td className="l2-table-row">
                    {columns[0].props.children[index]}
                </td>
                <td className="l2-table-row">
                    {columns[1].props.children[index]}
                </td>
            </tr>);
        });

        //return the multi column pronunciation view into content view
        return (
            <div>
                <div className="l2-container" key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                    <audio id="l2-demo-audio"></audio>
                    <table className="table table-bordered l2-table-container">
                        <tbody>
                        <tr>
                            <td colSpan="2">
                                <h4 className="l2-note-text">{self.state.note}</h4>
                            </td>
                        </tr>
                        {finalColumns}
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

    _onMessageRecieved: function() {
        var state = this.state;
        var isCorrectLists = state.isCorrect;
        var newMessage = ASRStore.GetMessage();
        var recordedSpeech = "This needs to be a unique message that isn't returned by the applet.";

        if(!ConfigStore.isASREnabled()){
            newMessage = "This needs to be a unique message that isn't returned by the applet.";
        }

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
                var col = state.clickedAnswer.colNumber;
                var ind = state.clickedAnswer.index;
                var text = state.cols[col][ind].uttering.utterance.native.text;
                if(AGeneric().purgeString(text) == AGeneric().purgeString(recordedSpeech)){
                    //mark as correct
                    isCorrectLists[col][ind] = true;
                }else{
                    //mark as incorrect
                    isCorrectLists[col][ind] = false;
                }
        }

        // depending on message, do things

        if(this.isMounted()) {
            if(ASRStore.isInitialized()){
                this.setState({
                    message: newMessage,
                    recordedSpeech: recordedSpeech,
                    isCorrect: isCorrectLists
                });
            }
        }
    }
});

module.exports = MultiColumnPronunciationView;