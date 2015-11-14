var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');


var LC_GLYPHICON_CORRECT_CLS = "glyphicon-ok-circle";
var LC_GLYPHICON_INCORRECT_CLS = "glyphicon-remove-circle";

function getPageState(props) {
    var data = {
        title: "",
        pageType: "",
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
            $(".LC-answerCheckbox").click(function (e) {
                selectedAns = e.target.value;
                haveAnswered = true;
                $(".LC-answerCheckbox").each(function () {
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
        var state = self.state;
        var response = state.answerFeedback;
        var imageSource = "data/media/MainlandFemale_Render01_exercisecrop.jpg";
        var coach = "";
        var answerString = state.questionString;
        var feedbackClass = "glyphicon LC-glyphicon LC-feedback";
        var promptString = state.prompt;

        var responder = "";
        if(state.haveAnswered) {
            coach = <img className="LC-coachImage" src={imageSource}></img>;

            if(state.isCorrect){
                feedbackClass += " LC-correct " + LC_GLYPHICON_CORRECT_CLS;
            }else{
                feedbackClass += " LC-incorrect " + LC_GLYPHICON_INCORRECT_CLS;
            }

            responder = <div className="LC-coachContainer">
                <div className="LC-coach">{coach}</div>
                <div className="LC-answerString">{answerString}</div>
                <div className="LC-response">{response}</div>
                <div className={feedbackClass}></div>
            </div>;
        }

        var choices = state.answers.map(function(item, index){
            var ans = item.nut.uttering.utterance.translation.text;
            return (<div className="LC-answers"><input type="checkbox" className="LC-answerCheckbox" value={ans}>{ans + "\n"}<br /></input></div>);
        });

        var question = "";
        if(state.haveListened){
            question = <div className="LC-ResponseContainer">
                <div className="LC-prompt">{promptString}</div>
                <div className="LC-answers-container">{choices}</div>
                {responder}
            </div>;
        }


        return (
            <div className="LC-container">
                <audio id="audio" volume={this.state.volume}>
                    <source id="mp3Source" src="" type="audio/mp3"></source>
                    Your browser does not support the audio format.
                </audio>
                <div className="LC-InteractionContainer">
                    <img className="row LC-Image" src={state.image}></img>
                    <div className="LC-promptContainer" onClick={function(){listenCheck(self)}}>
                        Click to Listen
                    </div>
                </div>
                {question}
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