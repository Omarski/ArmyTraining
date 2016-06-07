var React = require('react');
var PropTypes  = React.PropTypes;

var PuzzleMapHUDView = React.createClass({

    
    getInitialState: function() {

        return {
        };
    },

    propTypes: {

        hudStyle: PropTypes.object.isRequired,
    },

    render: function() {

        var self = this;
        var blockStyle = {'fontSize': '20px', 'width':'30px','marginRight':'5px', 'padding':'2px',
            'border':'3px solid #333333', 'textAlign':'center'};

        return (
            <div className = "puzzle-map-view-HUD-cont" style = {self.props.hudStyle} />
        )
    }
});

module.exports = PuzzleMapHUDView