var React = require('react');
var PageStore = require('../../../stores/PageStore');
var PageHeader = require('../../widgets/PageHeader');
var MC_GLYPHICON_CORRECT_CLS = "glyphicon-ok-circle";
var MC_GLYPHICON_INCORRECT_CLS = "glyphicon-remove-circle";

function getPageState(props) {
    var data = {
        page: null,
        title: "",
        sources: [],
        pageType: "",
        answers: [],
        prompt: "",
        mediaType: "",
        mediaZid: "",
        addClickComplete: false,
        haveAnswered: false,
        isCorrect: false,
        answerFeedback: "",
        correctAnswer: "",
        isQuestionaire: false
    };

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.answers = props.page.answer;
        data.prompt = props.page.prompt.text;

        if (data.page.info && data.page.info.property) {
            var properties = data.page.info.property;
            var len = properties.length;
            while(len--) {
                var property = properties[len];
                if (property.name === "questionnaire") {
                    data.isQuestionaire = true;
                    break;
                }
            }
        }

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
            $(".multiple-choice-checkbox").click(function (e) {
                selectedAns = e.target.value;
                haveAnswered = true;
                $(".multiple-choice-checkbox").each(function () {
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
        var title = page.title;
        var sources = self.state.sources;
        var responder = "";
        var feedbackClass = "glyphicon MC-glyphicon MC-feedback";
        var imageSource = "data/media/MainlandFemale_Render01_exercisecrop.jpg";
        var response = state.answerFeedback;

        if(state.haveAnswered && !self.state.isQuestionaire) {
            coach = (
                <div className="thumbnail">
                    <img src={imageSource}></img>
                </div>
            );

            if(state.isCorrect){
                feedbackClass += " multiple-choice-feedback-icon multiple-choice-correct " + MC_GLYPHICON_CORRECT_CLS;
            }else{
                feedbackClass += " multiple-choice-feedback-icon multiple-choice-incorrect " + MC_GLYPHICON_INCORRECT_CLS;
            }

            responder = (
            <div className="alert alert-dismissible multiple-choice-alert " role="alert" >
                <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <div className="multiple-choice-alert-text">
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
                                <input type="checkbox" className="multiple-choice-checkbox" value={ans}>{ans}</input>
                            </label>
                        </div>
                    </li>);
        });


        return (
            <div>
                <PageHeader sources={sources} title={title} key={this.state.page.xid}/>
                <div className="container">
                    <div className="row">
                        <h4>
                            {state.prompt}
                        </h4>
                    </div>
                    <div className="row">
                        <ul className="list-group multiple-choice-choices-container">
                            {choices}
                        </ul>
                    </div>
                    <div className="row">
                        {responder}
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

module.exports = MultipleChoiceView;