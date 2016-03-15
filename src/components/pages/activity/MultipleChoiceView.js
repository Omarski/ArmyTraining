var React = require('react');
var PageStore = require('../../../stores/PageStore');

var MC_GLYPHICON_CORRECT_CLS = "glyphicon-ok-circle";
var MC_GLYPHICON_INCORRECT_CLS = "glyphicon-remove-circle";

function getPageState(props) {
    var data = {
        page: null,
        title: "",
        pageType: "",
        answers: [],
        prompt: "",
        mediaType: "",
        mediaZid: "",
        addClickComplete: false,
        haveAnswered: false,
        isCorrect: false,
        answerFeedback: "",
        correctAnswer: ""
    };

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.answers = props.page.answer;
        data.prompt = props.page.prompt.text;
    }

    if(props && props.page && props.page.media){
        data.mediaType = props.page.media[0].type;
        data.mediaZid = props.page.media[0].zid;
    }

    data.answers = AGeneric().shuffle(data.answers);
    data.answers.map(function(item){
        if(item.correct == true){
            data.correctAnswer = item.nut.uttering.utterance.translation.text;
        }
    });

    return data;
}

function getFeedback(answers, selectedAnswer){
    var getter = "getFeedback could not find selected Answer.";
    answers.map(function(item){
        var text = item.nut.uttering.utterance.translation.text;
        if(selectedAnswer == text){
            getter = item.feedback.text;
        }
    });
    return(getter);
}

var MultipleChoiceView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidUpdate: function(){
        var self = this;
        var state = this.state;
        var selectedAns;
        var haveAnswered = false;
        var isCorrect = false;
        var feedback = state.answerFeedback;
        var target = state.correctAnswer;
        if(!state.addClickComplete) {
            $(".MC-answerCheckbox").click(function (e) {
                selectedAns = e.target.value;
                haveAnswered = true;
                $(".MC-answerCheckbox").each(function () {
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
        PageStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var state = this.state;
        var page = self.state.page;
        var mediaType;
        var mediaContainer;
        var questionContainer;
        var choicesContainer;
        var responder = "";
        var question = <div>{state.prompt}</div>;
        var feedbackClass = "glyphicon MC-glyphicon MC-feedback";
        var imageSource = "data/media/MainlandFemale_Render01_exercisecrop.jpg";
        var response = state.answerFeedback;

        if(state.haveAnswered) {
            coach = <img className="MC-coachImage" src={imageSource}></img>;

            if(state.isCorrect){
                feedbackClass += " MC-correct " + MC_GLYPHICON_CORRECT_CLS;
            }else{
                feedbackClass += " MC-incorrect " + MC_GLYPHICON_INCORRECT_CLS;
            }

            responder = <div className="MC-coachContainer">
                <div className="MC-coach">{coach}</div>
                <div className="MC-response">{response}</div>
                <div className={feedbackClass}></div>
            </div>;
        }

        mediaType = state.mediaType;
        if(mediaType != ""){

        }else{
            mediaContainer = <div className="MC-mediaContainer"></div>;
        }

        var choices;
        choices = state.answers.map(function(item, index){
            var ans = item.nut.uttering.utterance.translation.text;
            return (<div key={page.xid + String(index)} className="MC-answers"><input type="checkbox" className="MC-answerCheckbox" value={ans}>{ans + "\n"}<br /></input></div>);
        });

        choicesContainer = <div className="MC-choicesContainer">{choices}</div>;
        questionContainer = <div className="MC-questionContainer">
            {question}
            {choicesContainer}
            {responder}
        </div>;

        return (
            <div className="MC-container">
                {mediaContainer}
                {questionContainer}
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

module.exports = MultipleChoiceView;