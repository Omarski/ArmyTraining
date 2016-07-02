var React = require('react');
var PropTypes  = React.PropTypes;

var ObjexNavCellView = React.createClass({

    
    getInitialState: function() {

        return {
        };
    },

    propTypes: {
        activeObjex: PropTypes.object.isRequired,
        onCellOver: PropTypes.func.isRequired
    },

    componentWillMount: function() {
    },

    componentDidMount: function(){
    },
    
    prepNavCell: function(){

        var self = this;

    },

    updateGameView: function(update){

        var self = this;
        switch (update.task){
        }
    },

    render: function() {

        var self = this;
        var objex = self.props.activeObjex;
        //var cellImgStyle = self.props.imgStyle;

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