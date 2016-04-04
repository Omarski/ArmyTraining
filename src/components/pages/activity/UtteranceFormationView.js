var React = require('react');
var PageStore = require('../../../stores/PageStore');
var ASRStore = require('../../../stores/ASRStore');
var ConfigStore= require('../../../stores/ConfigStore');


var UF_GLYPHICON_STOP_CLS = "glyphicon-stop";
var UF_GLYPHICON_RECORD_CLS = "glyphicon-record";
var UF_GLYPHICON_PLAY_CLS = "glyphicon-play-circle";
var UF_GLYPHICON_CORRECT_CLS = "glyphicon-ok-circle";
var UF_GLYPHICON_INCORRECT_CLS = "glyphicon-remove-circle";

var recorder;

function getPageState(props) {
    var data;
    data = {
        page: null,
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
        feedbackResponse: "",
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

function Setup(){

}

function record(self){
    if(ASR.isInitialized()){
        ASR.StartRecording();
    }else{
        var audio = document.getElementById("audio");
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
        })
    }
}

function handlePlaying(self){
    if(ASR.isInitialized()){
        ASR.PlayRecording();
    }else{
        if (self.state.isPlaying) {
            stop("audio", self);
        } else {
            play("audio", self);
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

var UtteranceFormationView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        ASRStore.addChangeListener(this._onChange);
        //PageStore.addChangeListener(this._onChange);
        if(ConfigStore.isASREnabled()){
            if(!ASR.isInitialized()){
                ASR.InitializeASR();
            }
        }
        Setup();
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
        ASRStore.removeChangeListener(this._onChange);
    },

    componentDidUpdate: function(){
        Setup();
    },

    render: function() {
        var self = this;
        var state = self.state;
        var response = state.feedbackResponse;
        var imageSource = "data/media/MainlandFemale_Render01_exercisecrop.jpg";
        var coach = "";
        var answerString = "";
        var recordingClass = "glyphicon UF-glyphicon UF-record";
        var recordedClass = "glyphicon UF-glyphicon UF-play";
        var feedbackClass = "glyphicon UF-glyphicon UF-feedback";
        var spoken = state.spoken;

        if(state.haveAnswered){
            recordedClass += " " + UF_GLYPHICON_PLAY_CLS;
            if(ConfigStore.isASREnabled()){
                coach = <img className="UF-coachImage" src={imageSource}></img>;
                $(".UF-ResponseContainer").css("border", "1px solid black");
                if(state.isCorrect){
                    feedbackClass += " UF-correct " + UF_GLYPHICON_CORRECT_CLS;
                }else{

                    feedbackClass += " UF-incorrect " + UF_GLYPHICON_INCORRECT_CLS;
                }
            }else{
                response = <div className="UF-response"></div>;
            }
        }else{
            response = <div className="UF-response"></div>;
        }

        if(self.state.message != "No data found." || !ConfigStore.isASREnabled()) {
            var isRecording = state.isRecording;
            if (isRecording) {
                recordingClass += " " + UF_GLYPHICON_STOP_CLS;
            } else {
                recordingClass += " " + UF_GLYPHICON_RECORD_CLS;
            }
        }



        return (
            <div>
                <div className="UF-container" key={"page-" + this.state.page.xid}>
                    <audio id="audio"></audio>
                    <div className="UF-InteractionContainer">
                        <img className="row UF-Image" src={state.image}></img>
                        <div className="UF-RecorderContainer">
                            <div className={recordingClass} onClick={function(){handleRecord(self)}}></div>
                            <div className={recordedClass} onClick={function(){handlePlaying(self)}}></div>
                            <div className="UF-recorderTextContainer">{state.page.prompt.text}</div>
                        </div>
                    </div>
                    <div className="UF-ResponseContainer">
                        <div className="UF-coach">{coach}</div>
                        <div className="UF-answerString">{answerString}</div>
                        <div className="UF-response">{response}</div>
                        <div className={feedbackClass}></div>
                        <div className="UF-spokenContainer">{spoken}</div>
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
        var recordedSpeech = "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn.";
        var feedbackResponse = state.feedbackResponse;
        var spoken = state.spoken;

        if(!ConfigStore.isASREnabled()){
            newMessage = "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn.";
        }

        switch(newMessage){
            case "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn.":
                break;
            case "initialized":
                //console.log(newMessage);
                break;
            case "recordingStarted":
                //console.log(newMessage);
                break;
            case "recordingStopped":
                //console.log(newMessage);
                break;
            default:
                recordedSpeech = eval("(" + newMessage + ")").result;
                //console.log(recordedSpeech);
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
                                feedbackResponse = <div key={state.page.xid + String(index)} className="UF-textContainer">{AGeneric().correctResponse() + "\n" + item.feedback.text}</div>;

                            }else{
                                //mark as incorrect
                                isCorrect = false;
                                spoken = text;
                                feedbackResponse = <div key={state.page.xid + String(index)} className="UF-textContainer">{AGeneric().incorrectResponse() + "\n" + item.feedback.text}</div>;
                            }
                        }
                    }
                });

                if(test == "Unidentified Sentence"){
                    isCorrect = false;
                    spoken = "";
                    feedbackResponse = <div key={page.xid + "unidentified sentence"} className="UF-textContainer">{AGeneric().incorrectResponse()}</div>;
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


module.exports = UtteranceFormationView;