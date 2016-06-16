var React = require('react');
var PropTypes  = React.PropTypes;
var MissionConnectInterviewView = require('./MissionConnectInterviewView');
var MissionConnectGameView = React.createClass({

    
    getInitialState: function() {

        return {
            activeNode:null,
            activePopMode:null,
            scoreObjColl:[]
        };
    },

    propTypes: {
        gameData: PropTypes.object,
        images: PropTypes.array.isRequired,
        viewUpdate: PropTypes.func.isRequired
    },

    componentDidMount: function(){
        this.renderPieces();
        //this.prepScoreObjColl();
    },

    renderPieces: function(){

        var self = this;
        var chars = self.props.gameData.networkGameNodes;

        chars.map(function(char,index){
            
            var houseImg = self.props.images[parseInt(char.nodeNumber)].availableImageName;
            var houseStyle = {background:"url (" + houseImg + ") no-repeat 100% 100%"};

            var iconImg = self.props.images[parseInt(char.nodeNumber)].availableIconImageName;
            var iconStyle = {background:"url (" + iconImg + ") no-repeat 100% 100%"};

            var blockStyle = {top: char.yPos+'px', left: char.xPos+'px'};
            return(
                <div className = "mission-connect-view-piece-block" style={blockStyle} key={index}>
                    <div className = "mission-connect-view-home" style={houseStyle}></div>
                    <div className = "mission-connect-view-icon" style={iconStyle}
                         id = {"MissionConnectIcon" + char.nodeNumber}
                         onClick = {this.onIconClick()}></div>
                </div>
            )
        });
    },

    prepScoreObjColl: function(){

        var scoreObjColl = [];
        for (var i = 0; i < self.props.gameData.networkGameNodes.length; i++){
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

    onIconClick: function(e){
        console.log("Clicked on : " + e.target.id);
        this.setState({activeNode:parseInt(e.target.id.substring(18))});
        //popup
    },

    render: function() {

        var self = this;

        return (<div>

                <MissionConnectInterviewView
                    gameData = {self.props.gameData}
                    images = {self.props.loadedImageColl}
                    viewUpdate = {self.props.viewUpdate}
                    activeNode = {self.state.activeNode}
                    scoreObjColl = {self.state.scoreObjColl}
                />

                <div className = "mission-connect-view-pieces-cont" id="missionConnectPiecesCont" >
                </div>
            </div>
        )
    }
});

module.exports = MissionConnectGameView;