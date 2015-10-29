var React = require('react');
var PageStore = require('../../../stores/PageStore');
var ASRStore = require('../../../stores/ASRStore');


var UF_GLYPHICON_STOP_CLS = "glyphicon-stop";
var UF_GLYPHICON_RECORD_CLS = "glyphicon-record";
var UF_GLYPHICON_PLAY_CLS = "glyphicon-play-circle";
var UF_GLYPHICON_CORRECT_CLS = "glyphicon-ok-circle";
var UF_GLYPHICON_INCORRECT_CLS = "glyphicon-remove-circle";

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
        if(!ASR.isInitialized()){
            ASR.InitializeASR();
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
            coach = <img className="UF-coachImage" src={imageSource}></img>;
            $(".UF-ResponseContainer").css("border", "1px solid black");
            if(state.isCorrect){
                feedbackClass += " UF-correct " + UF_GLYPHICON_CORRECT_CLS;
            }else{
                recordedClass += " " + UF_GLYPHICON_PLAY_CLS;
                feedbackClass += " UF-incorrect " + UF_GLYPHICON_INCORRECT_CLS;
            }
        }else{
            response = <div className="UF-response"></div>;
        }

        if(self.state.message != "No data found.") {
            var isRecording = state.isRecording;
            if (isRecording) {
                recordingClass += " " + UF_GLYPHICON_STOP_CLS;
            } else {
                recordingClass += " " + UF_GLYPHICON_RECORD_CLS;
            }
        }



        return (

            <div className="UF-container">
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
                                feedbackResponse = <div className="UF-textContainer">{AGeneric().correctResponse() + "\n" + item.feedback.text}</div>;

                            }else{
                                //mark as incorrect
                                isCorrect = false;
                                spoken = text;
                                feedbackResponse = <div className="UF-textContainer">{AGeneric().incorrectResponse() + "\n" + item.feedback.text}</div>;
                            }
                        }
                    }
                });

                if(test == "Unidentified Sentence"){
                    isCorrect = false;
                    spoken = "";
                    feedbackResponse = <div className="UF-textContainer">{AGeneric().incorrectResponse()}</div>;
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