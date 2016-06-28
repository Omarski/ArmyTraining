var React = require('react');
var ObjexNavCellView = require('./ObjexNavCellView');
var PropTypes  = React.PropTypes;

var ObjexNavView = React.createClass({

    
    getInitialState: function() {

        return {
        };
    },

    propTypes: {
        gameData: PropTypes.object,
        activeObjexColl: PropTypes.array.isRequired,
        mediaPath: PropTypes.string.isRequired,
        updateGameView: PropTypes.func.isRequired
    },

    componentWillMount: function() {
    },

    componentDidMount: function(){
    },
    
    prepNav: function(){

        var self = this;

    },

    viewUpdate: function(update){
        //propagate up
        this.props.viewUpdate(update)
    },

    updateGameView: function(update){

        var self = this;
        switch (update.task){
        }
    },

    render: function() {

        var self = this;

        return (<div>

               </div>
        )
    }
});

module.exports = ObjexNavView;