var React = require('react');
var PropTypes  = React.PropTypes;

var PuzzleMapHUDView = React.createClass({

    
    getInitialState: function() {

        return {
        };
    },

    propTypes: {
        hudStyle: PropTypes.object,
        scoreObj: PropTypes.object.isRequired
    },

    render: function() {

        var self = this;

        return (
            <div className = "puzzle-map-view-HUD-cont" id="puzzle-map-view-HUD-cont" style = {self.props.hudStyle}>
                <div className="puzzle-map-view-HUD-completed">{parseInt(self.props.scoreObj.totalPieces - self.props.scoreObj.correct)}&nbsp; countries left</div>
                <div className="puzzle-map-view-HUD-correct">{self.props.scoreObj.correct}/{self.props.scoreObj.totalPieces}&nbsp; correct</div>
            </div>
        )
    }
});

module.exports = PuzzleMapHUDView;