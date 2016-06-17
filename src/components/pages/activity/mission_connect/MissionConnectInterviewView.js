/**
 * Created by omaramer on 6/14/16.
 */
var React = require('react');
var PropTypes = React.PropTypes;
var PopupView = require('./../../../widgets/PopupView');

var MissionConnectInterviewView = React.createClass({


    getInitialState: function() {

        return {
            scenarioTempl:null,
            quizTempl:null,
            feedbackTempl:null,
            questionTemplColl:[],
            popState: "scenario"
        };
    },

    propTypes: {
        gameData: PropTypes.object,
        images: PropTypes.array.isRequired,
        viewUpdate: PropTypes.func.isRequired,
        activeNode: PropTypes.number.isRequired,
        scoreObjColl: PropTypes.array.isRequired,
        showInterview: PropTypes.boolean.isRequired,
        updateGameView: PropTypes.func.isRequired,
        updateScore: PropTypes.func.isRequired
    },

    componentDidMount: function(){
        this.renderPopContent();
    },

    onInteract: function(){
        this.setState({popState:"quiz"});
    },

    onSubmit: function(){

        var scoreObj = self.props.scoreObjColl[self.props.activeNode];
        var correct = $('input[name="missionConnectQuizRadio"]:checked').val();
        if (correct) {
            this.props.updateScore({'correct':true});
        }else{
            this.props.updateScore({'attempts':scoreObj.attempts + 1});
        }

        this.setState({popState:"feedback"});
    },

    onClosePop: function(){
        this.props.updateGameView("closePop");
    },

    renderPopContent: function(){

        var self = this;
        var gameData = self.props.gameData;
        var char = self.props.gameData.networkGameNodes[self.props.activeNode - 1];
        var origImg = self.props.images[parseInt(char.nodeNumber)].nodeImageName;
        var imgStyle = {background:'url('+ origImg + ') no-repeat 100% 100%'}

        var scenarioTempl = function() {
            return(
                <div className = "mission-connect-view-popCont">
                    <div className = "mission-connect-view-popSenImgCont">
                        <div className = "mission-connect-view-popSenImg" style={imgStyle}></div>
                        <div className = "mission-connect-view-popSenImgTitle"></div>
                    </div>

                    <div className = "mission-connect-view-popSenTextCont">{char.interactionWindowText}</div>

                    <div className = "mission-connect-view-popSenBtnGrpCont">
                        <div className = "mission-connect-view-popSenBtnCont">
                            <button type="button" className="btn btn-default mission-connect-view-popSenBtn"
                                    onClick={self.onInteract}>Interact</button>
                            <button type="button" className="btn btn-default mission-connect-view-popSenBtn"
                                    onClick={self.onClosePop}>Exit</button>
                            </div>
                    </div>
                </div>
            )
        };

        var quizTempl = function() {

            var questionObj = self.state.questionTemplColl[self.props.scoreObjColl[self.props.activeNode].attempts];

            return(
                <div className = "mission-connect-view-popCont">
                    <div className = "mission-connect-view-popIntImgCont">
                        <div className = "mission-connect-view-popIntImg" style={imgStyle}></div>
                        <div className = "mission-connect-view-popIntImgTitle"></div>
                    </div>

                    <div className = "mission-connect-view-popIntTextCont">
                        {questionObj.question}
                    </div>

                    <div className="mission-connect-view-popQuizCont">
                        {questionObj.answers}
                    </div>

                    <div className = "mission-connect-view-popIntBtnGrpCont">
                        <div className = "mission-connect-view-popIntBtnCont">
                            <button type="button" className="btn btn-default"
                                    onClick={self.onSubmit}>Submit</button>
                        </div>
                    </div>
                </div>
            )
        };

        var feedbackTempl = function() {

            var questionObj = self.state.questionTemplColl[self.props.scoreObjColl[self.props.activeNode].attempts];
            var scoreObj = self.props.scoreObjColl[self.props.activeNode];

            return(
                <div className = "mission-connect-view-popCont">

                    <div className = "mission-connect-view-popFeedbackImg" style={imgStyle}></div>

                    <div className = "mission-connect-view-popFeedbackTextQuote">
                        {scoreObj.correct ? char.positiveFeedback: char.negativeFeedback}
                    </div>
                    <div className = "mission-connect-view-popFeedbackTextTitle">
                        {scoreObj.correct ? gameData.feedbackCorrectTitle: gameData.feedbackIncorrectTitle}</div>

                    <div className = "mission-connect-view-popFeedbackText">
                        {questionObj.feedback}
                    </div>

                    <div className = "mission-connect-view-popFeedbackBtnGrpCont">
                        <div className = "mission-connect-view-popFeedbackBtnCont">
                            <button type="button" className="btn btn-default"
                                    onClick={self.onInteract}>close</button>
                        </div>
                    </div>
                </div>
            )
        };

        //ready questions/answers
        var questionTemplColl = [];

        for (var i = 0; i < char.questions.length ; i++) {

            var questionObj = {};
            
            questionObj["question"] = char.questions[i].prompt;
            questionObj["feedback"] = [];

            var answersTempl = char.questions[i].choices.map(function(answer,index){

               questionObj["feedback"].push(answer.feedback);

               return(
                   <input type="radio" name={"missionConnectQuizRadio"} //+self.props.activeNode
                          value={answer.correct}
                          className="mission-connect-view-popIntRadio"
                          key={index}>{answer.choice}</input>
               )
            });

            questionObj["answers"] = answersTempl;
            questionTemplColl.push(questionObj);
        }

        self.setState({scenarioTempl:scenarioTempl, quizTempl:quizTempl, feedbackTempl:feedbackTempl, questionTemplColl:questionTemplColl});
    },

    render: function() {

        var self = this;
        var popStyle = {display: 'block', width: '515px', height:'auto', top:'20%', left:'15%',
                        minHeight: '315px', background: '#fff', padding:'20px'};
        
        return (<div>
                    {self.state.showInterview ?
                     <PopupView
                        id = {"missionConnectPop"+self.pop.activeNode}
                        popupStyle = {popStyle}
                        onClickOutside = {null}
                      >
                    {self.state[self.state.popState + "Templ"]}
                </PopupView>:null}
            </div>
        )
    }
});

module.exports = MissionConnectInterviewView;