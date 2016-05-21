/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');
var TimerCountdownView = require('../../../widgets/TimerCountdownView');
var CultureQuestInputBlocksView = require('./CultureQuestInputBlocksView');

var CultureQuestQuiz = React.createClass({
    
    //props 
    getInitialState: function() {

        return {
            mediaPath:'data/media/',
            timerObj: {duration:59, message:null, controller:"play", reportAt:{time:30, alert:"hintTime"}},
            questionDisplayObj:{},
            correctAnswer:"",
            questionIntro1: "Remember, you can press BACKSPACE to erase letters.",
            questionIntro2: "Oh, you don't know? Let me give you a hint.",
            inputBlocksColl:[]
        };
    },

    componentWillMount: function() {
        //this.prepAnswersColl();
    },

    componentDidMount: function() {
        this.renderQuestionText();
    },

    componentWillUnmount: function() {
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
        var answerObj = self.props.answersColl[self.getSelectedIndex()];
        var selectedJSON = self.getSelectedJSON();
        var questionDisplayObj = {'intro': 'I\'ve been expecting you. I don\'t have much time.',
                        'introL2': self.state['questionIntro' + answerObj.onQuestion],
                        'question': selectedJSON['prompt'+ answerObj.onQuestion]
                        };
        self.setState({questionDisplayObj:questionDisplayObj});
    },
    
    renderBlocks: function(){

        $("#cultureQuestQuizView-input-blocks-cont").children().val("");
        var self = this;
        var answerObj = self.props.answersColl[self.getSelectedIndex()];
        var answer = this.getSelectedJSON()["answer"+answerObj.onQuestion];

        self .state.correctAnswer = answer;
        var answerArray = answer.split('');

        var blocks = answerArray.map(function(letter, index){
            return (
                <CultureQuestInputBlocksView id={"CultureQuestQuizView-inputBlock"+index} key={index} />
            )
        });

        return blocks;
    },

    checkAnswer: function(){

        var self = this;
        var completeAnswer = "";
        var answerObj = self.props.answersColl[self.getSelectedIndex()];

        answerObj["question"+ answerObj.onQuestion].attempts++;

        //check if correct
        $("input[id^='CultureQuestQuizView-inputBlock']").each(function(){
            completeAnswer+= $(this).val();
        });
        if (completeAnswer.toLowerCase() === self.state.correctAnswer.toLowerCase()) {
            console.log("Correct....!!");
            answerObj["question"+ answerObj.onQuestion].answered = true;

            //done with area?
            if (answerObj.onQuestion === 2) {
                answerObj.completed = true;
                self.props.showQuizUpdate("hide");

            }else{
                answerObj.onQuestion = 2;
                this.renderQuestionText();
            }
        }else console.log("wrong....!!");

        //remove
        for (var key in answerObj) console.log(key + ": " + answerObj[key]);
    },

    timerStatusListener: function(status){

        switch (status){
            case "timeUp":
                console.log("Time up!!!");
                break;
            case "hintTime":
                console.log("Show hint now!!!");
                break;
        }
    },

    render: function() {

        var self = this;

        // var quizPopClasses = (self.props.showQuiz) ? setTimeout(function(){return "cultureQuestQuizView-fade-in"},1000):
        //                                              setTimeout(function(){return "cultureQuestQuizView-fade-out"},1000);
        var quizPopClasses = (self.props.showQuiz) ? "cultureQuestQuizView-fade-in" : ".cultureQuestQuizView-fade-out";

        var btnRespondClasses = "btn btn-primary";
        var btnRespondStyle = {position: 'absolute', zIndex:20, top:'238px', left:'400px'};
        var btnSkipClasses = "btn btn-primary";
        var btnSkipStyle = {position: 'absolute', zIndex:20, top:'5px', right:'5px'};

        var instImg = self.state.mediaPath + self.getSelectedJSON()['face'];
        var instStyle = {background:"#000 url("+instImg+") no-repeat 100% 100%"};

        var timerStyle = {fontSize:'20px',color:'red',textAlign:'center',zIndex:'20'};


        return (
                <div className={"cultureQuestQuizView-quizPop "+quizPopClasses}>

                    <div className="cultureQuestQuizView-timer" id="cultureQuestQuizView-timer">
                        <TimerCountdownView
                            styling     = {timerStyle}
                            duration    = {self.state.timerObj.duration}
                            controller  = {self.state.timerObj.controller}
                            message     = {self.state.timerObj.message}
                            reportAt    = {self.state.timerObj.reportAt}
                            timerStatusReporter = {self.timerStatusListener}
                        />
                    </div>

                    <div className="cultureQuestQuizView-quizCont" id="cultureQuestQuizView-quizCont">

                        {this.props.lastSelected ? <div style={instStyle} className="cultureQuestQuizView-instructorImg"></div> : null}

                        <div className="cultureQuestQuizView-quizBody" id="cultureQuestQuizView-quizBody">

                            <div className="cultureQuestQuizView-quizText" id="cultureQuestQuizView-quizText">
                                <div className="cultureQuestQuizView-questionText">{self.state.questionDisplayObj.intro}</div>
                                <div className="cultureQuestQuizView-questionText">{self.state.questionDisplayObj.introL2}</div>
                                <div className="cultureQuestQuizView-questionText">{self.state.questionDisplayObj.question}</div>
                            </div>
                            
                            <div className="cultureQuestQuizView-input-blocks-cont" id="cultureQuestQuizView-input-blocks-cont">
                                {this.renderBlocks()}
                            </div>
                        </div>

                       
                    </div>

                    <div className="cultureQuestQuiz-puzzleCont" id="cultureQuestQuiz-puzzleCont"></div>

                    <button type="button" onClick={self.checkAnswer} style={btnRespondStyle} className={btnRespondClasses}>Respond</button>
                    <button type="button" style={btnSkipStyle} className={btnSkipClasses}>Skip question</button>

                </div>

        );
    }
});

module.exports = CultureQuestQuiz;