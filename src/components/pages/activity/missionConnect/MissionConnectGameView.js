var React = require('react');
var PropTypes  = React.PropTypes;

var MissionConnectGameView = React.createClass({

    
    getInitialState: function() {

        return {
            activeNode:null,
            activePopMode:null
        };
    },

    propTypes: {
        gameData: PropTypes.object,
        images: PropTypes.array.isRequired,
        viewUpdate: PropTypes.func.isRequired
    },

    componentDidMount: function(){
        this.renderPieces();
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

    onIconClick: function(e){
        console.log("Clicked on : " + e.target.id);
    },

    render: function() {



        return (
            <div className = "mission-connect-view-pieces-cont" id="missionConnectPiecesCont" >
            </div>
        )
    }
});

module.exports = MissionConnectGameView;