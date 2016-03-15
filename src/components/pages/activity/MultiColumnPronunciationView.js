var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var ColorText = require('../../../components/widgets/ColorText');
var ASRStore = require('../../../stores/ASRStore');
var ConfigStore = require('../../../stores/ConfigStore');

// CONSTANTS
var L2_GLYPHICON_CORRECT_CLS = "glyphicon-ok-circle";
var L2_GLYPHICON_INCORRECT_CLS = "glyphicon-remove-circle";
var L2_GLYPHICON_STOP_CLS = "glyphicon-stop";
var L2_GLYPHICON_PLAY_CLS = "glyphicon-play-circle";
var L2_GLYPHICON_RECORD_CLS = "glyphicon-record";
var L2_GLYPHICON_CLS = "l2-glyphicon";

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

function getPageState(props) {
    var data;
    data = {
        page: null,
        title: "",
        pageType: "",
        cols: [],
        note: [],
        playableState: [],
        isCorrect: [],
        isPlaying: [],
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
    var colElementRecordingState = [];
    for(var i=0; i<data.page.colTitle.length; i++){
        data.cols.push([]);
        isColElementCorrect.push([]);
        colElementPlayableState.push([]);
        isColElementPlaying.push([]);
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
                colElementRecordingState[colNumber].push(false);
            }

        });
    });
    data.isCorrect = isColElementCorrect;
    data.playableState = colElementPlayableState;
    data.isPlaying = isColElementPlaying;
    data.recordingState = colElementRecordingState;

    return data;
}

function positionDivs(self){
    $(L2_GLYPHICON_CLS).css("pointer-events", "auto");
    var columns = document.getElementsByClassName("l2-column");
    var columnWidth = 575; // potentially dynamic value (more columns, the skinnier they are)
    Array.prototype.forEach.call(columns, function(item, index) {
        $(item).css('left', ((columnWidth*index) + (30*index) + 30 + 'px'));
        var vocalAnswers = item.childNodes;
        Array.prototype.forEach.call(vocalAnswers, function(columnItem, index){
            var _item = $(columnItem);
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
    });
    // 39.5 because math
    var buffer = 39.5;
    var icons = document.getElementsByClassName(L2_GLYPHICON_CLS);
    Array.prototype.forEach.call(icons, function(item, index){
        var $item = $(item);
        var answerLine = Math.floor(index/3); //3 because 3 icons per answer item.
        if(answerLine >= self.state.cols[0].length){answerLine -= self.state.cols[0].length;}
        $item.css('top', ( ( buffer + (120*answerLine) )+'px'));
    });
}

var onFail = function(e){
    console.log('An Error has occured.', e);
    console.log('navigator.getUserMedia not present');
};

var onSuccess = function(s){
    console.log("on success.");
    var context = new AudioContext();
    var mediaStreamSource = context.createMediaStreamSource(s);
    recorder = new Recorder(mediaStreamSource);
    recorder.record();
    console.log("--- onSuccess ---");
    console.dir(recorder);
};

//var id = "" + colNumber + "audio" + index;
function handleRecord(id, colNumber, index, self){
    var newRecordingState = self.state.recordingState;
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

function play(id, colNumber, index, self){
    var a = document.getElementById(id);
    // might need to be $(a)
    $(a).bind('ended', function(){
        stop(id, index, self);
    });
    a.play();
    var newPlayingState = self.state.isPlaying;
    //TODO: test if isplaying is a double array
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
    //TODO: test if isplaying is a double array
    newPlayingState[colNumber][index] = false;
    self.setState({
        isPlaying: newPlayingState
    });
}

function record(id, colNumber, index, self){
    if(ASR.isInitialized){
        var pState = self.state.playableState;
        var oldCA = self.state.clickedAnswer;
        if(oldCA != 0){
            pState[oldCA.colNumber][oldCA.index] = false;
        }
        ASR.StartRecording();
        var clickedAnswer = {
            colNumber: colNumber,
            index: index
        };
        self.setState({
            clickedAnswer: clickedAnswer,
            playableState: pState
        })
    }else {
        var audio = document.getElementById("li-demo-audio");
        navigator.getUserMedia({video: false, audio: true}, onSuccess, onFail);
    }
}

// pass the audio handle to stopRecording
function stopRecording(id, colNumber, index, self){
    if(ASR.isInitialized){
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

function handlePlaying(id, colNumber, index, self){
    if(ASR.isInitialized){
        ASR.PlayRecording();
    }else {
        //TODO: test if isplaying is a double array
        if (self.state.isPlaying[colNumber][index]) {
            stop(id, colNumber, index, self);
        } else {
            play(id, colNumber, index, self);
        }
    }
}

function textClick(id, colNumber, index, self){
    var zid = self.state.cols[colNumber][index].uttering.media[0].zid;
    // get audio.
    playAudio(zid);
}

function playAudio(xid){
    var audio = document.getElementById('l2-demo-audio');
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

var MultiColumnPronunciationView = React.createClass({
    getInitialState: function() {
        return getPageState(this.props);
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        ASRStore.addChangeListener(this._onChange);
        //PageStore.addChangeListener(this._onChange);
        positionDivs(this);
        if(ConfigStore.isASREnabled()){
            if(!ASR.isInitialized()){
                ASR.InitializeASR();
            }
        }
    },

    componentDidUpdate: function(){
        positionDivs(this);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
        ASRStore.removeChangeListener(this._onChange);
    },

    render: function() {

        var self = this;
        var page = self.state.page;
        var nativeText = "";
        var translatedText = "";
        var ezreadText = "";
        var note = "";
        var feedbackClass = "glyphicon l2-glyphicon l2-feedback";
        var recordedClass = "glyphicon l2-glyphicon l2-playback";
        var recordingClass = "glyphicon l2-glyphicon l2-record";

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


                    var isCorrect = self.state.isCorrect[colNumber][index];
                    if (isCorrect != null) {
                        if(isCorrect){
                            itemFeedbackClass = feedbackClass + " l2-correct " + L2_GLYPHICON_CORRECT_CLS;
                        }else{
                            itemFeedbackClass = feedbackClass + " l2-incorrect " + L2_GLYPHICON_INCORRECT_CLS;
                        }
                    } else {
                        itemFeedbackClass = feedbackClass;
                    }

                    var hasRecorded = self.state.playableState[colNumber][index];
                    if (hasRecorded) {

                        if (self.state.isPlaying[colNumber][index]) {
                            itemRecordedClass = recordedClass + " " + L2_GLYPHICON_STOP_CLS;
                        } else {
                            itemRecordedClass = recordedClass + " " + L2_GLYPHICON_PLAY_CLS;
                        }
                    } else {
                        itemRecordedClass = recordedClass;
                    }

                    if(self.state.message != "No data found.") {
                        var isRecording = self.state.recordingState[colNumber][index];
                        if (isRecording) {
                            itemRecordingClass = recordingClass + " " + L2_GLYPHICON_STOP_CLS;
                        } else {
                            itemRecordingClass = recordingClass + " " + L2_GLYPHICON_RECORD_CLS;
                        }
                    }

                    return (
                        <div key={page.xid + String(index)} className="l2-vocal-answer">
                            <div className="l2-note-text">{note}</div>
                            <span className={itemRecordingClass} onClick={function(){handleRecord(id, colNumber, index, self)}}></span>
                            <span className={itemRecordedClass} onClick={function(){handlePlaying(id, colNumber, index, self)}}></span>

                            <div className="l2-text-area" id={"text-"+id} onClick={function(){textClick(id, colNumber, index, self)}}>
                                <div className="l2-native-text">
                                    <ColorText props={nativeText}/>
                                </div>
                                <div className="l2-ezread-text">
                                    <ColorText props={ezreadText}/>
                                </div>
                                <div className="l2-translated-text">
                                    <ColorText props={translatedText}/>
                                </div>
                            </div>
                            <span className={itemFeedbackClass}></span>
                        </div>
                    );
                }
            });
            return(
                <div key={page.xid + String(colNumber)} className="l2-column">
                    {vaList}
                </div>
            );
        });

        return (
            <div className="l2-container">
                <div className="row l2-title">
                    <h3>{page.title}</h3>
                </div>
                <div className="row">
                    <h4>{self.state.note}</h4>
                </div>
                <div className="row">
                    <div className="l2-answers-container">
                        <audio id="l2-demo-audio"></audio>
                        {columns}
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
        var isCorrectLists = state.isCorrect;
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
            this.setState(getPageState(this.props));
            if(ConfigStore.isASREnabled()){
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