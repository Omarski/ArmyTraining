var React = require('react');
var PropTypes  = React.PropTypes;
var MissionConnectInterviewView = require('./MissionConnectInterviewView');
var MissionConnectProgressView = require('./MissionConnectProgressView');

var MissionConnectGameView = React.createClass({

    
    getInitialState: function() {

        return {
            activeNode:null,
            showInterview:false,
            scoreObjColl:[],
            charList:[],
            wrongAttempts:0
        };
    },

    propTypes: {
        gameData: PropTypes.object,
        images: PropTypes.array.isRequired,
        mediaPath: PropTypes.string.isRequired,
        viewUpdate: PropTypes.func.isRequired
    },

    componentWillMount: function(){

        //find init active node
        var char = this.props.gameData.networkGameNodes.filter(function (obj) {
            return obj.startNode === true;
        })[0];
        this.setState({activeNode:char.nodeNumber});
    },

    componentDidMount: function(){
        this.renderPieces();
        this.prepScoreObjColl();
    },

    renderPieces: function(){

        var self = this;
        var chars = self.props.gameData.networkGameNodes;

        var pieces = chars.map(function(char,index){

            var houseImg = self.props.images[parseInt(char.nodeNumber) - 1].houseUrl;
            var houseStyle = {background:'url(' + houseImg + ') no-repeat', backgroundSize:'100% 100%'};

            var iconImg = self.props.images[parseInt(char.nodeNumber) - 1].charIconUrl;
            var iconStyle = {background:'url(' + iconImg + ') no-repeat', backgroundSize: '100% 100%'};

            var ableToInteract = char.startNode ? "auto":"none";
            var visible = char.startNode? "1":"0";
            if (char.endNode) visible = 0.4;
            var blockStyle = {top: char.yPos+'px', left: char.xPos+'px',
                pointerEvents:ableToInteract, opacity:visible};

            return(
                <div className = "mission-connect-view-piece-block" style={blockStyle} id={"missionConnectViewPieceBlock"+char.nodeNumber} key={index}>
                    <div className = "mission-connect-view-home" style={houseStyle}></div>
                    <div className = "mission-connect-view-icon" style={iconStyle}
                         id = {"MissionConnectIcon" + char.nodeNumber}
                         onClick = {self.onIconClick}
                         ></div>
                </div>
            )
        });

        return pieces;
    },

    prepScoreObjColl: function(){

        var scoreObjColl = [];

        for (var i = 0; i < this.props.gameData.networkGameNodes.length - 1; i++){ //minus chief
            var scoreObject = {
                attempts:0,
                allAttempts:0,
                answered: false
            };

            scoreObjColl.push(scoreObject);
        }

        this.setState({scoreObjColl:scoreObjColl});
    },

    viewUpdate: function(mode){
        //propagate up
        this.props.viewUpdate(mode)
    },

    updateGameView: function(update){

        switch (update.task){
            case "closePop":
                this.setState({showInterview:false});
                break;
            case "updateList":
                var list = this.state.charList;
                list.push(update.value);
                this.setState({charList:list});
        }
    },

    updateScore: function(updateColl){
        var self = this;
        var tempScoreColl = self.state.scoreObjColl;
        var scoreObj = tempScoreColl[self.state.activeNode - 1];
        for (var i = 0 ; i < updateColl.length; i++){
            scoreObj[updateColl[i].property] = updateColl[i].value;
        }
        tempScoreColl[self.state.activeNode - 1] = scoreObj;
        self.setState({scoreObjColl:tempScoreColl});
    },

    updateWrongAttempts: function(){
        var wrongAttempts = this.state.wrongAttempts;
        this.setState({wrongAttempts:wrongAttempts + 1});
    },

    onIconClick: function(e){
        this.setState({activeNode:parseInt(e.target.id.substring(18)), showInterview:true});
    },

    render: function() {

        var self = this;
        return (<div>

                <MissionConnectProgressView
                    mediaPath = {self.props.mediaPath}
                    charList  = {self.state.charList}
                    wrongAttempts = {self.state.wrongAttempts}
                />

                {self.state.showInterview ? <MissionConnectInterviewView
                    gameData = {self.props.gameData}
                    images = {self.props.images}
                    mediaPath = {self.props.mediaPath}
                    viewUpdate = {self.viewUpdate}
                    activeNode = {self.state.activeNode}
                    scoreObjColl = {self.state.scoreObjColl}
                    showInterview = {self.state.showInterview}
                    updateGameView = {self.updateGameView}
                    updateScore = {self.updateScore}
                    updateWrongAttempts = {self.updateWrongAttempts}
                />:null}


                <div className = "mission-connect-view-pieces-cont" id="missionConnectPiecesCont" >
                    {self.renderPieces()}
                </div>
            </div>
        )
    }
});

module.exports = MissionConnectGameView;