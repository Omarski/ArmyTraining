/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');
var TimerCountdownView = require('../../../widgets/TimerCountdownView');
var CultureQuestInputBlocksView = require('./CultureQuestInputBlocksView');

var CultureQuestQuiz = React.createClass({
    
    //props: layersColl, imageData, showQuiz, lastSelected, showQuizUpdate, showPuzzleUpdate,
    // answersColl, saveAnswersColl, audioPlayer, setAudioControl

    getInitialState: function() {

        return {
            mediaPath:'data/media/',
            timerController:"play",
            timerDuration:60,
            timerEndMessage:null,
            timerReportAt:{time:29, alert:"hintTime"},
            timerParentAlerts:null,
            questionDisplayObj:{},
            correctAnswer:"",
            hintIntro: this.props.imageData.hintBlurb,
            answerRevealIntro: "Not quite, but here's the answer you are looking for.",
            wrongAnswerText:"That is incorrect. But since we are short on time, I want you to take this with you anyhow.",
            correctAnswerText:"Yes, that's correct. Here's what you're looking for.",
            hintMode: false,
            skipMode: false,
            leaveRegionMode: false,
            showInputBlocks: true,
            puzzleAwardMode:false,
            atInputBlock:1,
            inputBlocksTotal:0,
            answeredCorrectly:false,
            respBtnOn:true
        };
    },

    componentDidMount: function() {
        this.renderQuestionText();
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
            intro2 =  (<div><div>{self.state.hintIntro}</div>
                         <div>{selectedJSON['hint'+ answerObj.onQuestion]}</div></div>);
            question = selectedJSON['prompt'+ answerObj.onQuestion];
        }else{
            intro2 = "";
            question = selectedJSON['prompt'+ answerObj.onQuestion];
        }

        var questionDisplayObj = {'intro': 'I\'ve been expecting you. I don\'t have much time.',
                        'introL2': intro2,
                        'question': question
                        };
        self.setState({questionDisplayObj:questionDisplayObj});
        self.setInputTabbing();
    },

    resetQuestion: function(){

        $("[id^='culture-quest-quiz-view-inputBlock']").val("");
        this.setState({hintMode:false, skipMode:false, timerDuration:30, timerMessage:null,
                       timerReportAt:{time:20, alert:"hintTime"}}, function(){
            this.setState({timerParentAlerts:"timerReset"});
            this.renderQuestionText();
        });
    },

    renderBlocks: function(){

        var self = this;
        var blockCounter = 0;
        var answerObj = self.props.answersColl[self.getSelectedIndex()];
        var answer = this.getSelectedJSON()["answer"+answerObj.onQuestion];

        self.state.correctAnswer = answer;
        var blocksColl = [];

        var answerBlocksArray = answer.split(' ');

        //for each word in answer
        for (var i = 0 ; i < answerBlocksArray.length; i++) {

            var blocks = answerBlocksArray[i].split('').map(function (letter, index) {
                blockCounter += 1;
                return (
                    <CultureQuestInputBlocksView id={"culture-quest-quiz-view-inputBlock"+parseInt(blockCounter - 1)} key={index}/>
                )
            });

            blocksColl.push(blocks);
        }

        //wrap word blocks
        var blocksRender = blocksColl.map(function(wordBlock,index){

            return (
                <div className="culture-quest-quiz-view-blockGroup"
                     id="culture-quest-quiz-view-blockGroup" key={index}>
                    {wordBlock}
                </div>
            )
        });

        self.state.inputBlocksColl = blocks;
        return blocksRender;
    },

    setInputTabbing: function(){
        var self = this;
        self.state.inputBlocksTotal = $("[id^='culture-quest-quiz-view-inputBlock']").length - 1;
        self.setState({respBtnOn:true});
        //remove past events
        $("[id^='culture-quest-quiz-view-inputBlock']").find("*").addBack().off();

        //box click:
        $("#culture-quest-quiz-view-quizBody").click(function(){
            if (self.state.showInputBlocks) $("#culture-quest-quiz-view-inputBlock0").focus();
        });

        //return click to answer
        $("[id^='culture-quest-quiz-view-inputBlock']").keydown(function(e){
            if(e.keyCode === 13){
                self.checkAnswer();
            }
        });

        //backspace
        $("[id^='culture-quest-quiz-view-inputBlock']").keydown(function(e){
            if(e.keyCode === 8){
               if ($("#culture-quest-quiz-view-inputBlock"+ self.state.atInputBlock).val() !== "") $("#culture-quest-quiz-view-inputBlock"+ self.state.atInputBlock).focus().val("");
                self.state.atInputBlock--;
                $("#culture-quest-quiz-view-inputBlock"+ self.state.atInputBlock).focus().val("");
                // self.state.atInputBlock--;
            }
        });

        $("#culture-quest-quiz-view-inputBlock0").focus();
        $("[id^='culture-quest-quiz-view-inputBlock']").on('input', function(){
            self.state.atInputBlock = $(this).attr('id').substring(34);
            if ($(this).val().length === 1) {
                if (parseInt(self.state.atInputBlock) < parseInt(self.state.inputBlocksTotal)) {
                    self.state.atInputBlock++;
                    $("#culture-quest-quiz-view-inputBlock"+ self.state.atInputBlock).focus().val("");
                }
            }else{
                $(this).val("");
            }
        });
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
                    this.setState({timerEndMessage:"Out of time!", leaveRegionMode:true, skipMode:false, showInputBlocks:false});
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
        var completedIndex = self.props.lastSelected.id.substr(self.props.lastSelected.id.length - 1);

        answerObj["question"+ answerObj.onQuestion].attempts++;

        //check if correct
        $("input[id^='culture-quest-quiz-view-inputBlock']").each(function(){
            completeAnswer+= $(this).val();
        });

        //correct
        if (completeAnswer.toLowerCase() === self.state.correctAnswer.toLowerCase().replace(" ","")) {

            answerObj["question"+ answerObj.onQuestion].answered = true;

            //Question 2 correct
            if (answerObj.onQuestion === 2) {
                //change in answersColl triggers CQ-Map updateLayerAccess
                self.setState({answeredCorrectly:true}, function(){ self.viewUpdate({task:"addAnswerOrder", value:completedIndex});
                                                                    self.awardPuzzlePiece()});

            //Question 1 correct
            }else{
                answerObj.question1.answered = true;
                self.setState({answeredCorrectly:true}, function(){ self.viewUpdate({task:"addAnswerOrder", value:completedIndex});
                                                                    self.awardPuzzlePiece()});
            }
        //incorrect
        }else{
            
            //1st attempt
            if (answerObj["question"+answerObj.onQuestion].attempts++ === 1){
                $("input[id^='culture-quest-quiz-view-inputBlock']").each(function(){$(this).val("");});
                if (answerObj.onQuestion === 1) self.setState({hintMode:true, skipMode:true},function(){self.renderQuestionText();});
                else self.setState({hintMode:true, skipMode:false},function(){self.renderQuestionText();});

            //2nd attempt
            }else{
                self.setState({respBtnOn:false});
                self.updateTimerController("pause");
                var answer = this.getSelectedJSON()["answer"+answerObj.onQuestion].replace(/\s/g, '');
                var answerArray = answer.split('');
                $("input[id^='culture-quest-quiz-view-inputBlock']").each(function(index,value){
                    $(this).val(answerArray[index]);
                });
                answerObj["question"+answerObj.onQuestion].answered = true;

                //after answer displayed, on which question?
                var delay = setTimeout(function(){
                    if (answerObj.onQuestion === 1){
                        answerObj.onQuestion = 2;
                        self.resetQuestion();
                        self.updateTimerController("play");
                    }else{
                        setTimeout(function(){
                            self.awardPuzzlePiece();
                            self.viewUpdate({task:"addAnswerOrder", value:completedIndex});
                        },2000);
                    }
                }, 2000);

                self.setState({answeredCorrectly:false});
            }
        }
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

    awardPuzzlePiece: function(){
        var self = this;
        var answerObj = self.props.answersColl[self.getSelectedIndex()];
        answerObj.completed = true;
        answerObj.onQuestion = 2;
        answerObj.question1.answered = answerObj.question2.answered = true;
        self.props.showPuzzleUpdate("show");
        self.props.lastSelected.setAttribute('hidden',true);
        self.updateTimerController("pause");
        self.setState({puzzleAwardMode:true});
    },

    viewUpdate: function(update){
        this.props.viewUpdate(update);
    },

    render: function() {

        var self = this;

        var quizPopClasses = (self.props.showQuiz) ? "culture-quest-quiz-view-fade-in" : ".culture-quest-quiz-view-fade-out";

        var btnRespondClasses = "btn btn-default";
        var btnRespondStyle = {position: 'absolute', zIndex:20, bottom:'2px', left:'280px', display:(self.state.showInputBlocks && self.state.respBtnOn)? "block":"none"};

        var btnSkipClasses = "btn btn-default";
        var btnSkipStyle = {position: 'absolute', zIndex:20, bottom:'2px', left:'364px', display:(self.state.skipMode && self.state.respBtnOn)? "block":"none"};

        var btnLeaveRegionClasses = "btn btn-default";
        var btnLeaveRegionStyle = {position: 'absolute', zIndex:20, bottom:'2px', left:'280px', display:(self.state.leaveRegionMode)? "block":"none"};

        var instImg = self.state.mediaPath + self.getSelectedJSON()['face'];
        var instStyle = {background:"#000 url("+instImg+") no-repeat 100% 100%"};

        var timerStyle = {fontSize:'20px', textAlign:'center', color:'#0000ff', zIndex:'20'};
        
        var quizTextClass = "culture-quest-quiz-view-quizText";

        var puzzleAwardTextClass = "culture-quest-quiz-view-quizText " + (self.state.puzzleAwardMode) ? "culture-quest-quiz-view-show":"culture-quest-quiz-view-hide";

        return (
            <div>
            <div className="culture-quest-quiz-view-regionBanner">{self.getSelectedJSON()["name"]}</div>
            <div className={"culture-quest-quiz-view-quizPop "+quizPopClasses}>
                    {!self.state.puzzleAwardMode ?
                        <div className="culture-quest-quiz-view-timer" id="culture-quest-quiz-view-timer">
                            <TimerCountdownView
                                styling                 = {timerStyle}
                                duration                = {self.state.timerDuration}
                                timerParentAlerts       = {self.state.timerParentAlerts}
                                timerController         = {self.state.timerController}
                                updateTimerController   = {self.updateTimerController}
                                timerLabel              = {"Time left: "}
                                endMessage              = {self.state.timerEndMessage}
                                reportAt                = {self.state.timerReportAt}
                                timerStatusReporter     = {self.timerStatusListener}
                                timerLabelAfter         = {" seconds"}
                                secondsOnly             = {true}
                            />
                    </div>:null}
                    <div className="culture-quest-quiz-view-quizCont" id="culture-quest-quiz-view-quizCont">

                        {this.props.lastSelected ? <div style={instStyle} className="culture-quest-quiz-view-instructorImg"></div> : null}

                        <div className="culture-quest-quiz-view-quizBody" id="culture-quest-quiz-view-quizBody">

                            {!self.state.puzzleAwardMode?
                                <div className={quizTextClass} id="culture-quest-quiz-view-quizText">
                                    <div className="culture-quest-quiz-view-questionText-intro">{self.state.questionDisplayObj.intro}</div>
                                    <div className="culture-quest-quiz-view-questionText-hint">{self.state.questionDisplayObj.introL2}</div>
                                    <div className="culture-quest-quiz-view-questionText">{self.state.questionDisplayObj.question}</div>
                                </div>:null}

                            {self.state.puzzleAwardMode ?
                                <div>
                                    <div className={puzzleAwardTextClass}>{self.state.answeredCorrectly ? self.state.correctAnswerText:self.state.wrongAnswerText}</div>
                                </div>:null}

                            {self.state.showInputBlocks && !self.state.puzzleAwardMode? <div className="culture-quest-quiz-view-input-blocks-cont" id="culture-quest-quiz-view-input-blocks-cont">
                                <div className="culture-quest-quiz-view-input-blocks-cent">{this.renderBlocks()}</div>
                            </div>:null}
                        </div>
                    </div>

                    {!self.state.puzzleAwardMode ? <div>
                    <button type="button" onClick={self.checkAnswer}  id="cultureQuestResponseBtn" style={btnRespondStyle} className={btnRespondClasses}>Respond</button>
                    <button type="button" onClick={self.onSkipAnswer} id="cultureQuestSkipAnswerBtn" style={btnSkipStyle} className={btnSkipClasses}>Skip question</button>
                    <button type="button" onClick={self.onSkipRegion} id="cultureQuestSkipRegBtn" style={btnLeaveRegionStyle} className={btnLeaveRegionClasses}>Leave region</button>
                    <div className = "culture-quest-quiz-view-btnBackground"></div>
                    </div>:null}
                </div>
                <div id="cultureQuestMapBlock"></div>

            </div>

        );
    }
});

module.exports = CultureQuestQuiz;