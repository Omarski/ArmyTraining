var React = require('react');
var PageStore = require('../../../stores/PageStore');
var ASRStore = require('../../../stores/ASRStore');
var SettingsStore = require('../../../stores/SettingsStore');


var RF_GLYPHICON_STOP_CLS = "glyphicon-stop";
var RF_GLYPHICON_RECORD_CLS = "glyphicon-record";
var RF_GLYPHICON_PLAY_CLS = "glyphicon-play-circle";
var RF_GLYPHICON_CORRECT_CLS = "glyphicon-ok-circle";
var RF_GLYPHICON_INCORRECT_CLS = "glyphicon-remove-circle";

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
        correctResponses: [],
        incorrectResponses: [],
        message: "No data found.",
        recordedSpeech: "",
        volume: SettingsStore.voiceVolume(),
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

function Setup(){

}

function record(self){
    if(ASR.isInitialized){
        ASR.StartRecording();
    }else{
        console.log("record called when ASR not initialized");
    }
}

function stopRecording(self){
    if(ASR.isInitialized){
        ASR.StopRecording();
        ASR.RecognizeRecording();
    }else{
        console.log("stopRecording called when ASR not initialized")
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
        if(self.state.message != "recordingStarted") {
            record(self);
            self.setState({
                isRecording: true
            })
        }
    }
}

function handlePlaying(self){
    if(ASR.isInitialized){
        ASR.PlayRecording();
    }
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
        //PageStore.addChangeListener(this._onChange);
        if(!ASR.isInitialized()){
            ASR.InitializeASR();
        }
        Setup();
        var audioTarget = $('audio,video');
        audioTarget.prop("volume", SettingsStore.voiceVolume());
        // if muted, then reduce volume to 0
        if(audioTarget.prop("muted")){
            audioTarget.prop("volume", 0);
        }
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
        var recordingClass = "glyphicon RF-glyphicon RF-record";
        var recordedClass = "glyphicon RF-glyphicon RF-play";
        var feedbackClass = "glyphicon RF-glyphicon RF-feedback";
        var requestAnswer = "";
        var showAnswer = "";
        var spoken = state.spoken;
        var answer = state.answer;

        if(state.haveAnswered){
            coach = <img className="RF-coachImage" src={imageSource}></img>;
            $(".RF-ResponseContainer").css("border", "1px solid black");
            if(state.isCorrect){
                feedbackClass += " RF-correct " + RF_GLYPHICON_CORRECT_CLS;
            }else{
                recordedClass += " " + RF_GLYPHICON_PLAY_CLS;
                feedbackClass += " RF-incorrect " + RF_GLYPHICON_INCORRECT_CLS;
                requestAnswer = <div className="RF-requestAnswer" onClick={function(){getAnswer(self)}}>Show Correct Answer</div>;
            }
        }else{
            response = <div className="RF-response"></div>;
        }

        if(self.state.message != "No data found.") {
            var isRecording = state.isRecording;
            if (isRecording) {
                recordingClass += " " + RF_GLYPHICON_STOP_CLS;
            } else {
                recordingClass += " " + RF_GLYPHICON_RECORD_CLS;
            }
        }
        //TODO: Show Correct Answer box if the answer was wrong.
        if(state.showAnswer){
            showAnswer = <div className="RF-AnswerDisplay">{'The correct answer is "' + answer + '"'}</div>
        }


        return (

            <div className="RF-container">
                <audio id="audio" volume={this.state.volume}>
                    <source id="mp3Source" src="" type="audio/mp3"></source>
                    Your browser does not support the audio format.
                </audio>
                <div className="RF-InteractionContainer">
                    <img className="row RF-Image" src={state.image}></img>
                    <div className="RF-promptContainer" onClick={function(){promptClick(self)}}>
                        Click to Listen
                    </div>
                    <div className="RF-RecorderContainer">
                        <div className={recordingClass} onClick={function(){handleRecord(self)}}></div>
                        <div className={recordedClass} onClick={function(){handlePlaying(self)}}></div>
                        <div className="RF-recorderTextContainer">{state.page.prompt.text}</div>
                    </div>
                </div>
                <div className="RF-ResponseContainer">
                    <div className="RF-coach">{coach}</div>
                    <div className="RF-answerString">{answerString}</div>
                    <div className="RF-response">{response}</div>
                    <div className={feedbackClass}></div>
                    <div className="RF-spokenContainer">{spoken}</div>
                    {requestAnswer}
                    {showAnswer}
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

        switch(newMessage){
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
                state.page.answer.map(function(item){
                    if(test != "Response Found") {
                        var text = item.nut.uttering.utterance.native.text;
                        // if we find what was spoken as an expected answer
                        if (AGeneric().purgeString(text) == AGeneric().purgeString(recordedSpeech)) {
                            test = "Response Found";
                            if(item.correct == true){
                                //mark as correct
                                isCorrect = true;
                                spoken = text;
                                feedbackResponse = <div className="RF-feedbackTextContainer">{AGeneric().correctResponse() + "\n" + item.feedback.text}</div>;

                            }else{
                                //mark as incorrect
                                isCorrect = false;
                                spoken = text;
                                feedbackResponse = <div className="RF-feedbackTextContainer">{AGeneric().incorrectResponse() + "\n" + item.feedback.text}</div>;
                            }
                        }
                    }
                });

                if(test == "Unidentified Sentence"){
                    isCorrect = false;
                    spoken = "";
                    feedbackResponse = <div className="RF-feedbackTextContainer">{AGeneric().incorrectResponse()}</div>;
                }
        }


        // depending on message, do things

        this.setState({
            message: newMessage,
            recordedSpeech: recordedSpeech,
            isCorrect: isCorrect,
            volume: SettingsStore.voiceVolume(),
            feedbackResponse: feedbackResponse,
            spoken: spoken
        });
    }
});

module.exports = ResponseFormationView;