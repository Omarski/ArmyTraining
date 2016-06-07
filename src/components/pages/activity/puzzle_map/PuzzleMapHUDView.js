var React = require('react');
var PropTypes  = React.PropTypes;

var PuzzleMapHUDView = React.createClass({

    
    getInitialState: function() {

        return {
        };
    },

    propTypes: {
        hudStyle: PropTypes.object.isRequired,
        imageData: PropTypes.object.isRequired,
        loadedImageColl: PropTypes.array.isRequired,
        scoreObj: PropTypes.object.isRequired
    },

    render: function() {

        var self = this;

        return (
            <div className = "puzzle-map-view-HUD-cont" style = {self.props.hudStyle}>
                <div className="puzzle-map-view-HUD-completed">{self.props.scoreObj.remaining} countries left</div>
                <div className="puzzle-map-view-HUD-correct">{self.props.scoreObj.correct}/{self.props.scoreObj.totalCountries} correct</div>
            </div>
        )
    }
});

module.exports = PuzzleMapHUDView;