var React = require('react');
var PropTypes  = React.PropTypes;

var ObjexNavCellView = React.createClass({

    
    getInitialState: function() {

        return {
        };
    },

    propTypes: {
        activeObjex: PropTypes.object.isRequired
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
        var img = objex.iconImgSrc;
        var cellImgStyle = {background:'url('+img+') no-repeat 100% 100%'};

        return (<div className="objex-view-cell">
                    <div className="objex-view-cellImg" style={cellImgStyle}></div>
                    <div className="objex-view-cellTitle">{objex.abbreviation}</div>
               </div>
        )
    }
});

module.exports = ObjexNavCellView;