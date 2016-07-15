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
        gameData: PropTypes.object.isRequired,
        mediaPath: PropTypes.string.isRequired,
        images: PropTypes.array.isRequired,
        viewUpdate: PropTypes.func.isRequired,
        activeNode: PropTypes.number.isRequired,
        scoreObjColl: PropTypes.array.isRequired,
        showInterview: PropTypes.bool.isRequired,
        updateGameView: PropTypes.func.isRequired,
        updateScore: PropTypes.func.isRequired,
        objectNodesNum: PropTypes.number.isRequired,
        stats: PropTypes.object.isRequired
    },

    componentDidMount: function(){
        this.renderPopContent();
    },

    viewUpdate: function(update){
        //propagate up
        this.props.viewUpdate(update)
    },

    onInteract: function(){
        this.setState({popState:"quiz"});
    },

    onSubmit: function(){

        var correct = $('input[name="missionConnectQuizRadio"]:checked').val();
        if (correct){
            var self = this;
            var scoreObj = self.props.scoreObjColl[self.props.activeNode - 1];
            var choiceNum = parseInt($('input[name="missionConnectQuizRadio"]:checked').attr('id'));
            var attempt = scoreObj.attempts < 3 ? scoreObj.attempts + 1 : 0;
            var attempts = scoreObj.allAttempts + 1;
            var char = self.props.gameData.networkGameNodes[self.props.activeNode - 1];
            var localStats = self.props.stats;

            if (correct === "true") {

                var iconCheckImg = self.props.images[parseInt(self.props.activeNode) - 1].charIconCheckUrl;
                self.props.updateScore([{property:'answered', value:true},
                    {property:'attempts', value:attempt},
                    {property:'allAttempts', value:attempts},
                    {property:'choiceNum', value:choiceNum}]);

                $("#MissionConnectIcon"+self.props.activeNode).css({
                    background: 'url('+iconCheckImg+') no-repeat 100% 100%', pointerEvents:'none'
                });

                if (char.gameObjective){

                    self.props.updateGameView({task:"updateList", value:"leaders"});
                    localStats.completed = self.props.stats.completed + 1;

                    if (localStats.completed === self.props.objectNodesNum) {
                        self.viewUpdate({task:"won", value:null});
                    }
                }else{
                    if (!char.startNode) self.props.updateGameView({task:"updateList", value:"contractors"});
                }

                localStats.hits = self.props.stats.hits + 1;

                setTimeout(function(){self.renderFeedback();},250);

            }else{
                self.props.updateScore([{property:'attempts', value:attempt},
                    {property:'allAttempts', value:attempts},
                    {property:'choiceNum', value:choiceNum}]);

                self.props.updateGameView({task:"updateWrong", value:null});

                localStats.misses = self.props.stats.misses + 1;

                if (localStats.misses === 6) {
                    self.viewUpdate({task:"timeUp", value:null});
                }

                setTimeout(function(){self.renderFeedback();},250);
            }

            self.props.viewUpdate({task:"updateStats", value:localStats});
        }

    },

    onClosePop: function(){

        this.props.updateGameView({task:"closePop", value:null});

        var scoreObj = this.props.scoreObjColl[this.props.activeNode - 1];
        var connectNodes = this.props.gameData.networkGameNodes[this.props.activeNode - 1].connectedNodes;

        if (scoreObj.answered) {
            for (var i=0; i < connectNodes.length; i++){
                var node = $("#missionConnectViewPieceBlock"+connectNodes[i]);
                $(node).animate({'opacity':'1'},500).css({'pointerEvents':'auto'});
            }
        }
    },

    renderPopContent: function(){

        var self = this;
        var char = self.props.gameData.networkGameNodes[self.props.activeNode - 1];
        var origImg = self.props.images[parseInt(char.nodeNumber) - 1].charOrigUrl;
        var imgScnStyle = {background:'url('+ origImg + ') no-repeat', backgroundSize:'164px 164px'};
        var imgQuizStyle = {background:'url('+ origImg + ') no-repeat', backgroundSize:'93px 93px'};

        //ready questions/answers
        var questionTemplColl = [];

        for (var i = 0; i < char.questions.length ; i++) {

            var questionObj = {};

            questionObj["question"] = char.questions[i].prompt;
            questionObj["feedback"] = [];

            var answersTempl = char.questions[i].choices.map(function(answer,index){

                questionObj["feedback"].push(answer.feedback);

                return(<div key={index}>
                    <input type="radio" name={"missionConnectQuizRadio"} //+self.props.activeNode
                           style={{float:"left"}}
                           value={answer.correct}
                           id={index}
                           className="mission-connect-view-popIntRadio"
                           /><div style={{float:"left", width:"92%"}}>{answer.choice}</div>
                    </div>
                )
            });

            questionObj["answers"] = answersTempl;
            questionTemplColl.push(questionObj);
        }

        var scenarioTempl = function() {
            return(
                <div className = "mission-connect-view-popCont">
                    <div className = "mission-connect-view-popSenImgCont">
                        <div className = "mission-connect-view-popSenImg" style={imgScnStyle}></div>
                        <div className = "mission-connect-view-popSenImgTitle">{char.profileName}</div>
                    </div>

                    <div className = "mission-connect-view-popSenTextCont" dangerouslySetInnerHTML={{__html:char.interactionWindowText}}></div>

                    <div className = "mission-connect-view-popSenBtnGrpCont">
                        <div className = "mission-connect-view-popSenBtnCont">
                            <div type="button" className="btn btn-default mission-connect-view-popSenBtn"
                                    onClick={self.onInteract}>Interact</div>
                            <div type="button" className="btn btn-default mission-connect-view-popSenBtn"
                                    onClick={self.onClosePop}>Exit</div>
                            </div>
                    </div>
                </div>
            )
        };

        var quizTempl = function() {

            var questionObj = questionTemplColl[self.props.scoreObjColl[self.props.activeNode - 1].attempts];

            return(
                <div className = "mission-connect-view-popCont">
                    <div className = "mission-connect-view-popIntImgCont">
                        <div className = "mission-connect-view-popIntImg" style={imgQuizStyle}></div>
                        <div className = "mission-connect-view-popIntImgTitle">{char.profileName}</div>
                    </div>

                    <div className = "mission-connect-view-popIntTextCont" dangerouslySetInnerHTML={{__html:questionObj.question}}></div>

                    <div className="mission-connect-view-popQuizCont">
                        {questionObj.answers}
                    </div>

                    <div className = "mission-connect-view-popIntBtnGrpCont">
                        <div className = "mission-connect-view-popIntBtnCont">
                            <div type="button" className="btn btn-default"
                                    onClick={self.onSubmit}>Submit</div>
                        </div>
                    </div>
                </div>
            )
        };

        self.setState({scenarioTempl:scenarioTempl(), quizTempl:quizTempl(), questionTemplColl:questionTemplColl});
    },

    renderFeedback: function(){

        var self = this;
        var gameData = self.props.gameData;
        var char = self.props.gameData.networkGameNodes[self.props.activeNode - 1];
        var origImg = self.props.images[parseInt(char.nodeNumber) - 1].charOrigUrl;
        var imgFeedStyle = {background:'url('+ origImg + ') no-repeat', backgroundSize:'103px 103px'};
        var questionTemplColl = self.state.questionTemplColl;
        var scoreObj = self.props.scoreObjColl[self.props.activeNode - 1];

        if (scoreObj.attempts === 0){
            var questionObj = questionTemplColl[0];
        }else{
            var questionObj = questionTemplColl[parseInt(scoreObj.attempts - 1)];
        }

        
        var feedback = function(){
            var feedbackQuote =  scoreObj.answered ? char.positiveFeedback : char.negativeFeedback;
            return(
                <div className = "mission-connect-view-popCont">

                    <div className = "mission-connect-view-popFeedbackImg" style={imgFeedStyle}></div>

                    <div className = "mission-connect-view-popFeedbackTextQuote" dangerouslySetInnerHTML={{__html:feedbackQuote}}></div>

                    <div className = "mission-connect-view-popFeedbackTextTitle">
                        {scoreObj.answered ? gameData.feedbackCorrectTitle: gameData.feedbackIncorrectTitle}</div>

                    <div className = "mission-connect-view-popFeedbackText" dangerouslySetInnerHTML={{__html:questionObj.feedback[scoreObj.choiceNum]}}></div>

                    <div className = "mission-connect-view-popFeedbackBtnGrpCont">
                        <div className = "mission-connect-view-popFeedbackBtnCont">
                            <div type="button" className="btn btn-default"
                                    onClick={self.onClosePop}>Exit</div>
                        </div>
                    </div>
                </div>
            );
        };

        if (scoreObj.attempts >= 3) scoreObj.attempts = 0;

        self.setState({feedbackTempl:feedback(), popState:"feedback"});

    },

    render: function() {

        var self = this;
        var popStyle = {display: 'block', width: '515px', height:'auto', top:'20%', left:'15%',
                        minHeight: '315px', background: '#fff', padding:'20px'};
        
        return (<div>
                    {self.props.showInterview ?
                     <PopupView
                        id = {"MissionConnectPop"+self.props.activeNode}
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