/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');
var TimerCountdownView = require('../../../widgets/TimerCountdownView');
var CultureQuestInputBlocksView = require('./CultureQuestInputBlocksView');

var CultureQuestQuiz = React.createClass({
    
    //props: layersColl, showQuiz, lastSelected, showQuizUpdate, answersColl, saveAnswersColl

    getInitialState: function() {

        return {
            mediaPath:'data/media/',
            timerController:"play",
            timerDuration:30,
            timerMessage:"",
            timerReportAt:{time:20, alert:"hintTime"},
            timerParentAlerts:null,
            questionDisplayObj:{},
            correctAnswer:"",
            questionIntro: "Remember, you can press BACKSPACE to erase letters.",
            hintIntro: "Oh, you don't know? Let me give you a hint.",
            answerRevealIntro: "Not quite, but here's the answer you are looking for.",
            hintMode: false,
            skipMode: false,
            leaveRegionMode: false,
            showInputBlocks: true
        };
    },

    componentWillMount: function() {
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

        var self = this, intro2, question;
        var answerObj = self.props.answersColl[self.getSelectedIndex()];
        var selectedJSON = self.getSelectedJSON();

        if (self.state.hintMode){
            intro2 = self.state.hintIntro;
            question = selectedJSON['hint'+ answerObj.onQuestion];
        }else{
            intro2 = self.state.questionIntro;
            question = selectedJSON['prompt'+ answerObj.onQuestion];
        }

        var questionDisplayObj = {'intro': 'I\'ve been expecting you. I don\'t have much time.',
                        'introL2': intro2,
                        'question': question
                        };
        self.setState({questionDisplayObj:questionDisplayObj});
    },

    resetQuestion: function(){

        $("#cultureQuestQuizView-input-blocks-cont").children().val("");
        this.setState({hintMode:false, skipMode:false, timerDuration:30, timerMessage:null,
                       timerReportAt:{time:20, alert:"hintTime"}}, function(){
            this.setState({timerParentAlerts:"timerReset"});
            this.renderQuestionText();
        });
    },
    
    renderBlocks: function(){

        var self = this;

        var answerObj = self.props.answersColl[self.getSelectedIndex()];
        var answer = this.getSelectedJSON()["answer"+answerObj.onQuestion];

        self.state.correctAnswer = answer;
        var answerArray = answer.split('');

        var blocks = answerArray.map(function(letter, index){
            return (
                <CultureQuestInputBlocksView id={"CultureQuestQuizView-inputBlock"+index} key={index} />
            )
        });
        self.state.inputBlocksColl = blocks;
        return blocks;
    },

    timerStatusListener: function(status){

        var answerObj = this.props.answersColl[this.getSelectedIndex()];

        switch (status){

            case "timeUp":

                if (answerObj.onQuestion === 1) {
                    answerObj.onQuestion = 2;
                    this.resetQuestion();
                }else{
                    this.updateTimerController("pause");
                    this.setState({timerMessage:"Out of time!", leaveRegionMode:true, skipMode:false, showInputBlocks:false});
                }
                break;

            case "hintTime":
                if (!this.state.hintMode) this.setState({hintMode:true}, function(){
                    this.renderQuestionText();
                });
                break;

            case "clearParentResetEvent":
                this.setState({timerParentAlerts:null});
                break;
        }
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

        //correct
        if (completeAnswer.toLowerCase() === self.state.correctAnswer.toLowerCase()) {
            console.log("Correct....!!");
            answerObj["question"+ answerObj.onQuestion].answered = true;

            //Question 2 correct
            if (answerObj.onQuestion === 2) {
                //change in answersColl triggers CQ-Map updateLayerAccess
                answerObj.question2.answered = true;
                answerObj.completed = true;
                self.props.lastSelected.setAttribute('hidden',true);
                self.props.lastSelected = null;
                self.props.showQuizUpdate("hide");

            //Question 1 correct
            }else{
                answerObj.question1.answered = true;
                answerObj.onQuestion = 2;
                this.renderQuestionText();
            }
        //incorrect
        }else{

            //1st attempt
            if (answerObj["question"+answerObj.onQuestion].attempts++ === 1){
                $("input[id^='CultureQuestQuizView-inputBlock']").each(function(){$(this).val("");});
                self.setState({hintMode:true, skipMode:true},function(){self.renderQuestionText();});

            //2nd attempt
            }else{
                self.updateTimerController("pause");
                var answer = this.getSelectedJSON()["answer"+answerObj.onQuestion];
                var answerArray = answer.split('');
                $("input[id^='CultureQuestQuizView-inputBlock']").each(function(index,value){
                    $(this).val(answerArray[index]);
                });
                answerObj["question"+answerObj.onQuestion].answered = true;

                //after answer displayed, on which question?
                var delay = window.setTimeout(function(){
                    if (answerObj.onQuestion === 1){
                        answerObj.onQuestion = 2;
                        self.resetQuestion();
                        self.updateTimerController("play");
                    }else{
                        console.log("........... give gift!");
                        self.props.lastSelected = null;
                        self.props.showQuizUpdate("hide");
                    }
                }, 2000);
            }
        }
        //remove
        //for (var key in answerObj) console.log(key + ": " + answerObj[key]);
    },

    onSkipAnswer: function(){
        this.props.answersColl[this.getSelectedIndex()].onQuestion = 2;
        this.resetQuestion();
    },

    onSkipRegion: function(){
        var self = this;
        var answerObj = self.props.answersColl[self.getSelectedIndex()];
        answerObj.onQuestion = 1;
        answerObj.question1.attempts = answerObj.question2.attempts = 0;

        this.props.lastSelected = null;
        this.props.showQuizUpdate("hide");
    },
    
    updateTimerController: function(mode){
       this.setState({timerController:mode});
    },

    render: function() {

        var self = this;

        var quizPopClasses = (self.props.showQuiz) ? "cultureQuestQuizView-fade-in" : ".cultureQuestQuizView-fade-out";

        var btnRespondClasses = "btn btn-primary";
        var btnRespondStyle = {position: 'absolute', zIndex:20, top:'238px', left:'400px', display:(self.state.showInputBlocks)? "block":"none"};

        var btnSkipClasses = "btn btn-primary";
        var btnSkipStyle = {position: 'absolute', zIndex:20, top:'5px', right:'5px', display:(self.state.skipMode)? "block":"none"};

        var btnLeaveRegionClasses = "btn btn-primary";
        var btnLeaveRegionStyle = {position: 'absolute', zIndex:20, top:'5px', right:'5px', display:(self.state.leaveRegionMode)? "block":"none"};

        var instImg = self.state.mediaPath + self.getSelectedJSON()['face'];
        var instStyle = {background:"#000 url("+instImg+") no-repeat 100% 100%"};

        var timerStyle = {fontSize:'20px',color:'red',textAlign:'center',zIndex:'20'};


        return (
                <div className={"cultureQuestQuizView-quizPop "+quizPopClasses}>

                    <div className="cultureQuestQuizView-timer" id="cultureQuestQuizView-timer">
                        <TimerCountdownView
                            styling                 = {timerStyle}
                            duration                = {self.state.timerDuration}
                            timerParentAlerts       = {self.state.timerParentAlerts}
                            timerController         = {self.state.timerController}
                            updateTimerController   = {self.updateTimerController}
                            message                 = {self.state.timerMessage}
                            reportAt                = {self.state.timerReportAt}
                            timerStatusReporter     = {self.timerStatusListener}
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
                            
                            {self.state.showInputBlocks? <div className="cultureQuestQuizView-input-blocks-cont" id="cultureQuestQuizView-input-blocks-cont">
                                {this.renderBlocks()}
                            </div>:null}
                        </div>

                       
                    </div>

                    <button type="button" onClick={self.checkAnswer} style={btnRespondStyle} className={btnRespondClasses}>Respond</button>
                    <button type="button" onClick={self.onSkipAnswer} style={btnSkipStyle} className={btnSkipClasses}>Skip question</button>
                    <button type="button" onClick={self.onSkipRegion} style={btnLeaveRegionStyle} className={btnLeaveRegionClasses}>Leave region</button>

                </div>

        );
    }
});

module.exports = CultureQuestQuiz;