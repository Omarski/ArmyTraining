var React = require('react');
var PageStore = require('../../../stores/PageStore');
var ASRStore = require('../../../stores/ASRStore');
var SettingsStore = require('../../../stores/SettingsStore');
var ConfigStore = require('../../../stores/ConfigStore');
var PageHeader = require('../../widgets/PageHeader');


/*
var RF_GLYPHICON_STOP_CLS = "glyphicon-stop";
var RF_GLYPHICON_RECORD_CLS = "glyphicon-record";
var RF_GLYPHICON_PLAY_CLS = "glyphicon-play-circle";
var RF_GLYPHICON_CORRECT_CLS = "glyphicon-ok-circle";
var RF_GLYPHICON_INCORRECT_CLS = "glyphicon-remove-circle";
*/

var RF_GLYPHICON_RECORD = (<img src="images/icons/recordn.png" />); // "glyphicon glyphicon-record";
var RF_GLYPHICON_STOP = (<img src="images/icons/stoprecordn.png" />); // "fa fa-stop-circle-o";
var RF_GLYPHICON_PLAY = (<img src="images/icons/playrecordingn.png" />); // "glyphicon glyphicon-repeat";
var RF_GLYPHICON_CORRECT = (<img src="images/icons/completeexplorer.png" />); // "glyphicon glyphicon-ok-circle";
var RF_GLYPHICON_INCORRECT = (<img src="images/icons/failedquiz.png" />); // "glyphicon glyphicon-remove-circle";

var recorder;

function getPageState(props) {
    var data;
    data = {
        page: null,
        sources: [],
        title: "",
        pageType: "",
        image: "",
        haveAnswered: false,
        isCorrect: false,
        isRecording: false,
        isPlaying: false,
        correctResponses: [],
        incorrectResponses: [],
        message: "No data found.",
        recordedSpeech: "",
        feedbackResponse: "Not quite.",
        showAnswer: false,
        answer: "",
        spoken: ""
    };

    data.message = ASRStore.GetMessage();

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
    }

    data.page.answer.map(function(item){
        // need to distinguish between true and false in case it is undefined
        if(item.correct == true){
            data.correctResponses.push(item);
            data.answer = item.nut.uttering.utterance.native.text;
        }
        if(item.correct == false){
            data.incorrectResponses.push(item);
        }
    });

    if(data.page.media && data.page.media[0].xid) {
        var imgFile = data.page.media[0].xid;
    }
    data.image = "./data/media/" + imgFile;
    return data;
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

var onFail = function(e){
   // An Error has occured.
   // navigator.getUserMedia not present
};

var onSuccess = function(s){
    //on success.
    var context = new AudioContext();
    var mediaStreamSource = context.createMediaStreamSource(s);
    recorder = new Recorder(mediaStreamSource);
    recorder.record();
};

function Setup(){

}

function record(self){
    if(ASR.isInitialized()){
        ASR.StartRecording();
    }else{
        var audio = document.getElementById("li-demo-audio");
        navigator.getUserMedia({video: false, audio: true}, onSuccess, onFail);
    }
}

function stopRecording(self){
    if(ASR.isInitialized()){
        ASR.StopRecording();
        ASR.RecognizeRecording();
    }else{
        var audio = document.getElementById("audio");
        recorder.stop();
        recorder.exportWAV(function (s) {
            audio.src = window.URL.createObjectURL(s);
        });
    }
}

function handleRecord(self){
    var isRecording = self.state.isRecording;
    if (isRecording) {
        stopRecording(self);
        self.setState({
            isRecording: false,
            haveAnswered: true
        })
    } else {
        record(self);
        self.setState({
            isRecording: true
        });
    }
}

function handlePlaying(self){
    if(ASR.isInitialized()){
        ASR.PlayRecording();
    }else{
        if (self.state.isPlaying) {
            stop("audio",  self);
        } else {
            play("audio",  self);
        }
    }
}

function play(id, self){
    var a = document.getElementById(id);
    // might need to be $(a)
    $(a).bind('ended', function(){
        stop(id, self);
    });
    a.play();
    var newPlayingState = self.state.isPlaying;
    newPlayingState = true;
    self.setState({
        isPlaying: newPlayingState
    });
}

function stop(id, self){
    var a = document.getElementById(id);
    a.pause();
    a.currentTime = 0;
    var newPlayingState = self.state.isPlaying;
    newPlayingState = false;
    self.setState({
        isPlaying: newPlayingState
    });
}

function promptClick(self){
    // play the audio prmopt from the click to listen box
    var zid = self.state.page.question.media[0].zid;
    playAudio(zid);
}

function playAudio(xid){
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    source.src = "data/media/" + xid + ".mp3";
    audio.src = "data/media/" + xid + ".mp3";
    // play audio, or stop the audio if currently playing
    if(audio.paused){
        audio.load();
        audio.play();
    }else{
        audio.pause();
    }

}

function getAnswer(self){
    self.setState({
        showAnswer: true
    });
}

var ResponseFormationView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        ASRStore.addChangeListener(this._onChange);
        PageStore.addChangeListener(this._onChange);
        if(ConfigStore.isASREnabled()){
            if(!ASR.isInitialized()){
                ASR.InitializeASR();
            }
        }
        Setup();
        var audioTarget = $('audio,video');
        audioTarget.prop("volume", SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume());
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
        ASRStore.removeChangeListener(this._onChange);
    },

    componentDidUpdate: function(){
        Setup();
    },

    render: function() {
        var self = this;
        var state = self.state;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var response = state.feedbackResponse;
        var imageSource = "data/media/MainlandFemale_Render01_exercisecrop.jpg";
        var coach = "";
        var answerString = "";
        var recordingClass = "glyphicon RF-glyphicon RF-record";
        var recordedClass = "glyphicon RF-glyphicon RF-play";
        var feedbackClass = "glyphicon RF-glyphicon RF-feedback";
        var recordingIcon = "";
        var recordedIcon = "";
        var feedbackIcon = "";
        var requestAnswer = "";
        var showAnswer = "";
        var spoken = state.spoken;
        var answer = state.answer;

        if(state.haveAnswered){
            recordedIcon = RF_GLYPHICON_PLAY;
            if(ConfigStore.isASREnabled()){
                coach = <img className="RF-coachImage" src={imageSource}></img>;
                $(".RF-ResponseContainer").css("border", "1px solid black");
                if(state.isCorrect){
                    feedbackClass += " RF-correct ";
                    feedbackIcon = RF_GLYPHICON_CORRECT;
                }else{
                    feedbackClass += " RF-incorrect ";
                    feedbackIcon = RF_GLYPHICON_INCORRECT;
                    requestAnswer = <div className="RF-requestAnswer" onClick={function(){getAnswer(self)}}>Show Correct Answer</div>;
                }
            }else{
                response = <div className="RF-response"></div>;
            }
        }else{
            response = <div className="RF-response"></div>;
        }

        if(self.state.message != "No data found." || !ConfigStore.isASREnabled()) {
            var isRecording = state.isRecording;
            if (isRecording) {
                recordingIcon = RF_GLYPHICON_STOP;
            } else {
                recordingIcon =  RF_GLYPHICON_RECORD;
            }
        }

        if(state.showAnswer){
            showAnswer = <div className="RF-AnswerDisplay">{'The correct answer is "' + answer + '"'}</div>
        }


        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                    <div className="RF-container">
                        <audio id="audio" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                            <source id="mp3Source" src="" type="audio/mp3"></source>
                            Your browser does not support the audio format.
                        </audio>
                        <div className="RF-InteractionContainer">
                            <img className="row RF-Image" src={state.image}></img>
                            <ul>
                                <li>
                                    <div className="RF-promptContainer" onClick={function(){promptClick(self)}}>
                                        Click to Listen
                                    </div>
                                </li>
                                <li>
                                    <div className="RF-RecorderContainer">
                                        <div className={recordingClass} onClick={function(){handleRecord(self)}}>
                                            {recordingIcon}
                                        </div>
                                        <div className={recordedClass} onClick={function(){handlePlaying(self)}}>
                                            {recordedIcon}
                                        </div>
                                        <div className="RF-recorderTextContainer">{state.page.prompt.text}</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="RF-ResponseContainer">
                            <div className="RF-coach">{coach}</div>
                            <div className="RF-answerString">{answerString}</div>
                            <div className="RF-response">{response}</div>
                            <div className={feedbackClass}>
                                {feedbackIcon}
                            </div>
                            <div className="RF-spokenContainer">{spoken}</div>
                            {requestAnswer}
                            {showAnswer}
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
        var state = this.state;
        var isCorrect = state.isCorrect;
        var newMessage = ASRStore.GetMessage();
        var recordedSpeech = "This needs to be a unique message that isn't returned by the applet.";
        var feedbackResponse = state.feedbackResponse;
        var spoken = state.spoken;

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
                
                isCorrect = false;
                var test = "Unidentified Sentence";
                state.page.answer.map(function(item, index){
                    if(test != "Response Found") {
                        var text = item.nut.uttering.utterance.native.text;
                        // if we find what was spoken as an expected answer
                        if (AGeneric().purgeString(text) == AGeneric().purgeString(recordedSpeech)) {
                            test = "Response Found";
                            if(item.correct == true){
                                //mark as correct
                                isCorrect = true;
                                spoken = text;
                                feedbackResponse = <div key={state.page.xid + String(index)} className="RF-feedbackTextContainer">{AGeneric().correctResponse() + "\n" + item.feedback.text}</div>;

                            }else{
                                //mark as incorrect
                                isCorrect = false;
                                spoken = text;
                                feedbackResponse = <div key={state.page.xid + String(index)} className="RF-feedbackTextContainer">{AGeneric().incorrectResponse() + "\n" + item.feedback.text}</div>;
                            }
                        }
                    }
                });

                if(test == "Unidentified Sentence"){
                    isCorrect = false;
                    spoken = "";
                    feedbackResponse = <div key={page.xid + "unidentified sentence"} className="RF-feedbackTextContainer">{AGeneric().incorrectResponse()}</div>;
                }
        }


        // depending on message, do things

        this.setState({
            message: newMessage,
            recordedSpeech: recordedSpeech,
            isCorrect: isCorrect,
            feedbackResponse: feedbackResponse,
            spoken: spoken
        });
    }
});

module.exports = ResponseFormationView;