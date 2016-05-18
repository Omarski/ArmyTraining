/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');
var TimerCountdownView = require('../../../widgets/TimerCountdownView');
var CultureQuestInputBlocksView = require('./CultureQuestInputBlocksView');

var CultureQuestQuiz = React.createClass({

    getInitialState: function() {

        return {
            mediaPath:'data/media/',
            timerController: {},
            btnRespondHovered: "",
            btnSkipHovered: "",
            answersColl:[],
            question:{},
            questionIntro1: "Remember, you can press BACKSPACE to erase letters.",
            questionIntro2: "Oh, you don't know? Let me give you a hint."
        };
    },

    componentWillMount: function() {
        this.prepAnswersColl();
    },

    componentDidMount: function() {
        this.renderQuestionText();
    },

    componentWillUnmount: function() {
    },

    prepAnswersColl: function() {

       var objColl = [];
       for (var l = 0; l < this.props.layersColl.length; l++){
            var obj = {'layerNumber': l, 'completed': false, onQuestion:1,
                       'question1':{'answered':false, attempts:0},
                       'question2':{'answered':false, attempts:0}};
           objColl.push(obj);
       }
        this.setState({answersColl:objColl});
    },

    getSelectedIndex: function(){

        if (this.props.lastSelected) return parseInt(this.props.lastSelected.getAttribute('id').substring(18));
        return false;
    },

    getSelectedJSON: function(){

        if (this.props.lastSelected) {
            var layerIndex = this.getSelectedIndex();
            return this.props.imageData.regions[layerIndex];
        }
        return false;
    },

    renderQuestionText:function(){

        var self = this;
        var answerObj = self.state.answersColl[self.getSelectedIndex()];
        var selectedJSON = self.getSelectedJSON();
        var question = {'intro': 'I\'ve been expecting you. I don\'t have much time.',
                        'introL2': self.state['questionIntro' + answerObj.onQuestion],
                        'question': selectedJSON['prompt'+ answerObj.onQuestion]
                        };
        self.setState({question:question});
        console.log("Question: " + self.state.question.question);
    },

    render: function() {

        var self = this;

        var quizPopClasses = (self.props.showQuiz) ? "cultureQuestQuizView-fade-in" : ".cultureQuestQuizView-fade-out";

        var btnRespondClasses = "btn btn-primary cultureQuestQuizView-btnRespond" + self.state.btnRespondHovered;
        var btnSkipClasses = "btn btn-primary cultureQuestQuizView-btnSkip" + self.state.btnSkipHovered;

        var instImg = self.state.mediaPath + self.getSelectedJSON()['face'];
        var instStyle = {background:"#000 url("+instImg+") no-repeat 100% 100%"};

        var timerStyle = {};

        return (
                <div className={"cultureQuestQuizView-quizPop "+quizPopClasses}>

                    <TimerCountdownView
                        styling     = {timerStyle}
                        startTime   = {60}
                        controller  = {self.state.timerController}
                    />

                    <div className="cultureQuestQuizView-quizCont" id="cultureQuestQuizView-quizCont">

                        {this.props.lastSelected ? <div style={instStyle} className="cultureQuestQuizView-instructorImg"></div> : null}

                        <div className="cultureQuestQuizView-quizBody" id="cultureQuestQuizView-quizBody">

                            <div className="cultureQuestQuizView-quizText" id="cultureQuestQuizView-quizText">
                                <div className="cultureQuestQuizView-questionText">{self.state.question.intro}</div>
                                <div className="cultureQuestQuizView-questionText">{self.state.question.introL2}</div>
                                <div className="cultureQuestQuizView-questionText">{self.state.question.question}</div>
                            </div>

                            <CultureQuestInputBlocksView
                                selectedJSON={self.getSelectedJSON()}
                            />
                            
                            <button type="button" className={btnRespondClasses}>Respond</button>
                            <button type="button" className={btnSkipClasses}>Skip question</button>
                        </div>

                    </div>

                    <div className="cultureQuestQuiz-puzzleCont" id="cultureQuestQuiz-puzzleCont">
                    </div>
                </div>

        );
    }
});

module.exports = CultureQuestQuiz;