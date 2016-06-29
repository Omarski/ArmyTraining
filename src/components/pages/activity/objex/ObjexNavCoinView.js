var React = require('react');
var PropTypes  = React.PropTypes;

var ObjexNavCoinView = React.createClass({

    propTypes: {
        coinArt: PropTypes.string.isRequired,
        activeObjex: PropTypes.object.isRequired,
        onCoinClick: PropTypes.func.isRequired,
        coinOffset: PropTypes.string.isRequired
    },

    render: function() {

        var self = this;
        var coinStyle = {background:'url('+self.props.coinArt+') no-repeat',
                         backgroundSize:'25px 25px', left:self.props.coinOffset};

        return (<div className="objex-view-navCoin" 
                     id={"objexViewCoin_"+self.props.activeObjex.hog_id}
                     style={coinStyle} 
                     onClick={self.props.onCoinClick(e)}></div>
        )
    }
});

module.exports = ObjexNavCoinView;