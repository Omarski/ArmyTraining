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
        volume: SettingsStore.voiceVolume(),
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
        var response = state.answerFeedback;
        var imageSource = "data/media/MainlandFemale_Render01_exercisecrop.jpg";
        var coach = "";
        var answerString = state.questionString;
        var feedbackClass = "glyphicon";
        var promptString = state.prompt;

        var responder = "";
        if(state.haveAnswered) {
            var coach = (
                <div className="thumbnail">
                    <img src={imageSource}></img>
                </div>
            );

            if(state.isCorrect){
                feedbackClass += " listening-comp-feedback-icon listening-comp-correct " + LC_GLYPHICON_CORRECT_CLS;
            }else{
                feedbackClass += " listening-comp-feedback-icon listening-comp-incorrect " + LC_GLYPHICON_INCORRECT_CLS;
            }

            responder = (
                <div className="alert alert-dismissible listening-comp-alert " role="alert" >
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <div className="listening-comp-alert-text">
                        {coach}<h5><span className={feedbackClass}></span>{response}</h5>
                    </div>
                </div>
            );
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
                            {responder}
                        </div>
                    </div>
                </div>
            );
        }


        return (
        <div>
            <PageHeader sources={sources} title={title} key={this.state.page.xid}/>
            <div className="container">
                <audio id="audio" volume={this.state.volume}>
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