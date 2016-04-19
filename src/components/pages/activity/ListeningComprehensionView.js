var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');


var LC_GLYPHICON_CORRECT_CLS = "glyphicon-ok-circle";
var LC_GLYPHICON_INCORRECT_CLS = "glyphicon-remove-circle";

function getPageState(props) {
    var data = {
        title: "",
        pageType: "",
        sources: [],
        image: "",
        prompt: "",
        haveListened: false,
        haveAnswered: false,
        isCorrect: false,
        answers: [],
        correctAnswer: "",
        answerFeedback: "No Answer Selected.",
        questionString: "",
        addClickComplete: false
    };

    var imageZid = "";

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
        imageZid = props.page.media[0].zid;
        data.prompt = props.page.prompt.text;
        data.answers = props.page.answer;
        data.questionString = props.page.question.utterance.native.text;
    }

    props.page.answer.map(function(item){
        if(item.correct == true){
            data.correctAnswer = item.nut.uttering.utterance.translation.text;
        }
    });

    data.answers = AGeneric().shuffle(data.answers);

    if(imageZid != ""){
        data.image = "./data/media/" + imageZid + ".jpg";
    }


    return data;
}

function listenCheck(self){
    // play the audio prmopt from the click to listen box
    var zid = self.state.page.question.media[0].zid;
    playAudio(zid);
    $("#audio").bind('ended', function(){
        self.setState({
            haveListened: true
        });
    });
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


// TODO <----------------------------- REMOVE ME ONCE FEEDBACK COMPONENT IS ADDED---------------------------------------
function getFeedbackTest(feedbackText, isCorrect) {
    var feedbackClass = "glyphicon MC-glyphicon MC-feedback";
    var feedbackObject = null;
    var mediaDir = "data/media/"; // TODO <-------------should be a global setting--------------------------------------
    var coachMedia = "";
    var imageSource = "MainlandFemale_Render01_exercisecrop.jpg";
    var responder = "";

    // construct sample data
    // TODO these should be authorable <--------------------------------------------------------------------------------
    var positiveFeedback = [
        {
            "asset": "coach_feedback_GREATJOB.mp4",
            "text": "Great job!",
            "type": "video/mp4"
        },
        {
            "asset": "coach_feedback_OUTSTANDING.mp4",
            "text": "Outstanding!",
            "type": "video/mp4"
        },
        {
            "asset": "coach_feedback_THATSEXACTLYRIGHT.mp4",
            "text": "That's exactly right.",
            "type": "video/mp4"
        },
        {
            "asset": "coach_feedback_WELLDONE.mp4",
            "text": "Well done!",
            "type": "video/mp4"
        },
    ];

    var negativeFeedback = [
        {
            "asset": "coach_feedback_THATSNOTQUITERIGHT.mp4",
            "text": "That's not quite right.",
            "type": "video/mp4"
        },
        {
            "asset": "coach_feedback_KEEPTRYING.mp4",
            "text": "Keep Trying.",
            "type": "video/mp4"
        },
        {
            "asset": "coach_feedback_NOTQUITE.mp4",
            "text": "Not quite.",
            "type": "video/mp4"
        },
        {
            "asset": "coach_feedback_IMSORRYBUT.mp4",
            "text": "I'm sorry, but that is not correct.",
            "type": "video/mp4"
        },
    ];

    // check if correct
    if (isCorrect) {
        feedbackClass += " multiple-choice-feedback-icon multiple-choice-correct " + LC_GLYPHICON_CORRECT_CLS;
        feedbackObject = positiveFeedback[Math.floor(Math.random() * positiveFeedback.length)];
    } else {
        feedbackClass += " multiple-choice-feedback-icon multiple-choice-incorrect " + LC_GLYPHICON_INCORRECT_CLS;
        feedbackObject = negativeFeedback[Math.floor(Math.random() * negativeFeedback.length)];
    }

    // construct feedback object
    if (feedbackObject) {
        // check if asset exists
        if ("asset" in feedbackObject && feedbackObject["asset"].length > 0) {

            // check asset type
            // TODO make more robust
            if (feedbackObject["type"] === "video/mp4") {
                // TODO move video style to css <-----------------------------------------------------------------------
                coachMedia = (
                    <div className="thumbnail">
                        <video id="coachVideo" width="110" height="110">
                            <source src={mediaDir + feedbackObject["asset"]} type="video/mp4"></source>
                        </video>
                    </div>
                );
            } else if (feedbackObject["type"] === "image/jpeg") {
                coachMedia = (
                    <div className="thumbnail">
                        <img src={mediaDir + feedbackObject["asset"]}></img>
                    </div>
                );
            } else {
                // TODO add default <-----------------------------------------------------------------------------------
            }
        }

        // check if text exists
        var cannedText = "";
        if ("text" in feedbackObject && feedbackObject["text"].length > 0) {
            cannedText = feedbackObject["text"];
        }

        responder = (
            <div className="alert alert-dismissible multiple-choice-alert " role="alert" >
                <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <div className="multiple-choice-alert-text">
                    {coachMedia}<h5><span className={feedbackClass}></span>{cannedText}<br>{feedbackText}</br></h5>
                </div>
            </div>
        );

    } else {
        responder = (
            <div className="alert alert-dismissible multiple-choice-alert " role="alert" >
                <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <div className="multiple-choice-alert-text">
                    {coach}<h5><span className={feedbackClass}></span>{feedbackText}</h5>
                </div>
            </div>
        );
    }

    return responder;

}
// TODO END <----------------------------- REMOVE ME ONCE FEEDBACK COMPONENT IS ADDED-----------------------------------



function getFeedback(answers, selectedAnswer){
    var getter = "getFeedback could not find selected Answer.";
    answers.map(function(item){
        var translation = item.nut.uttering.utterance.translation;
        if(selectedAnswer == translation.text){
            getter = item.feedback.text;
        }
    });
    return(getter);
}

var ListeningComprehensionView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        SettingsStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {

        //SettingsStore.addChangeListener(this._onChange);
    },

    componentDidUpdate: function(){
        var self = this;
        var state = this.state;
        var selectedAns = null;
        var haveAnswered = false;
        var isCorrect = false;
        var feedback = state.answerFeedback;
        var target = state.correctAnswer;
        if(!state.addClickComplete) {
            $(".listening-comp-checkbox").click(function (e) {
                selectedAns = e.target.value;
                haveAnswered = true;
                $(".listening-comp-checkbox").each(function () {
                    if (this.value == selectedAns) {
                        this.checked = true;
                        isCorrect = (selectedAns == target);
                        feedback = getFeedback(state.answers, selectedAns);
                        feedback = getFeedbackTest(feedback, isCorrect);
                    } else {
                        this.checked = false;
                    }
                });
                self.setState({
                    haveAnswered: haveAnswered,
                    isCorrect: isCorrect,
                    answerFeedback: feedback,
                    addClickComplete: true
                });
            });
        }

        // TODO remove hack to play updated coach video-----------------------------------------------------------------
        // find video
        var coachVideo = document.getElementById("coachVideo");

        // load and play it
        if (coachVideo != null) {
            coachVideo.load();
            coachVideo.play();
        }
        // TODO end hack------------------------------------------------------------------------------------------------

    },

    componentWillUnmount: function() {
        SettingsStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var state = this.state;
        var page = self.state.page;
        var title = page.title;
        var sources = self.state.sources;
        var feedbackElement = "";



        var promptString = state.prompt;

        // if answered added coach feedback
        if(state.haveAnswered) {
            feedbackElement = state.answerFeedback
        }

        var choices;
        choices = state.answers.map(function(item, index){
            var ans = item.nut.uttering.utterance.translation.text;
            return (<li key={page.xid + String(index)} className="list-group-item" >
                <div class="checkbox">
                    <label>
                        <input type="checkbox" className="listening-comp-checkbox" value={ans}>{ans}</input>
                    </label>
                </div>
            </li>);
        });

        var question = "";
        var interactionColumn = "col-md-12";
        if(state.haveListened){
            interactionColumn = "col-md-6";
            question = (
                <div className="col-md-6">
                    <div className="container-fluid">
                        <div className="row">
                            <h4>
                                {state.prompt}
                            </h4>
                        </div>
                        <div className="row">
                            <ul className="list-group listening-comp-choices-container">
                                {choices}
                            </ul>
                        </div>
                        <div className="row">
                            {feedbackElement}
                        </div>
                    </div>
                </div>
            );
        }


        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={this.state.page.xid}/>
                    <div className="container">
                        <audio id="audio" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                            <source id="mp3Source" src="" type="audio/mp3"></source>
                            Your browser does not support the audio format.
                        </audio>
                        <div className="row">
                            <div className={interactionColumn}>
                                <div className="container-fluid">
                                    <div className="listening-comp-interaction-container">
                                        <img className="row listening-comp-image" src={state.image}></img>
                                        <div className="listening-comp-prompt" onClick={function(){listenCheck(self)}}>
                                            <span className="glyphicon glyphicon-play-circle"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {question}
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

module.exports = ListeningComprehensionView;