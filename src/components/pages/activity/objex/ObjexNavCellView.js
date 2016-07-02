var React = require('react');
var PropTypes  = React.PropTypes;

var ObjexNavCellView = React.createClass({

    propTypes: {
        activeObjex: PropTypes.object.isRequired,
        onCellOver: PropTypes.func.isRequired
    },

    render: function() {

        var self = this;
        var objex = self.props.activeObjex;

        var img = objex.iconImgSrc;
        var cellImgStyle = {background:'url('+img+') no-repeat', backgroundSize:'72px 72px'};

        return (<div className="objex-view-cell" id={"objexViewCell"+objex.hog_id} onMouseOver={self.props.onCellOver}>
                    <div className="objex-view-cellImg" id={"objexViewCellImg"+objex.hog_id} style={cellImgStyle}></div>
                    <div className="objex-view-cellTitle">{objex.abbreviation}</div>
               </div>
        )
    }
});

module.exports = ObjexNavCellView;