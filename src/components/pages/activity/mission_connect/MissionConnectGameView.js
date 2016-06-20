var React = require('react');
var PropTypes  = React.PropTypes;
var MissionConnectInterviewView = require('./MissionConnectInterviewView');
var MissionConnectGameView = React.createClass({

    
    getInitialState: function() {

        return {
            activeNode:null,
            showInterview:false,
            scoreObjColl:[]
        };
    },

    propTypes: {
        gameData: PropTypes.object,
        images: PropTypes.array.isRequired,
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
            //for (var key in self.props.images[parseInt(char.nodeNumber) - 1]) console.log(key + " -- " + self.props.images[parseInt(char.nodeNumber) - 1][key]);

            var houseImg = self.props.images[parseInt(char.nodeNumber) - 1].houseUrl;
            var houseImgWidth = self.props.images[parseInt(char.nodeNumber) - 1].houseWidth;
            var houseImgHeight = self.props.images[parseInt(char.nodeNumber) - 1].houseHeight;
            var houseStyle = {background:'url(' + houseImg + ') no-repeat', backgroundSize: houseImgWidth +'px ' + houseImgHeight+'px'};

            var iconImg = self.props.images[parseInt(char.nodeNumber) - 1].charIconUrl;
            var iconImgWidth = self.props.images[parseInt(char.nodeNumber) - 1].charIconWidth;
            var iconImgHeight = self.props.images[parseInt(char.nodeNumber) - 1].charIconHeight;
            var iconStyle = {background:'url(' + iconImg + ') no-repeat', backgroundSize: iconImgWidth +'px ' + iconImgHeight+'px'};

            var ableToInteract = char.startNode ? "auto":"none";
            var blockStyle = {top: char.yPos+'px', left: char.xPos+'px', pointerEvents:ableToInteract};

            return(
                <div className = "mission-connect-view-piece-block" style={blockStyle} key={index}>
                    <div className = "mission-connect-view-home" style={houseStyle}></div>
                    <div className = "mission-connect-view-icon" style={iconStyle}
                         id = {"MissionConnectIcon" + char.nodeNumber}
                         onClick = {self.onIconClick}
                         visible = {char.startNode}
                         active  = {char.startNode}
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

        switch (update){
            case "closePop":
                this.setState({showInterview:false});
                break;
        }
    },

    updateScore: function(update){
        var self = this;
        self.state.scoreObjColl[self.state.activeNode].update.key = update.value;
    },

    onIconClick: function(e){
        console.log("Clicked on : " + e.target.id);
        this.setState({activeNode:parseInt(e.target.id.substring(18)), showInterview:true});
    },

    render: function() {

        var self = this;
        var piecesContStyle = {zIndex:'100'};
        return (<div>



                <div className = "mission-connect-view-pieces-cont" id="missionConnectPiecesCont" style={piecesContStyle}>
                    {self.renderPieces()}
                </div>
            </div>
        )
    }
});

module.exports = MissionConnectGameView;