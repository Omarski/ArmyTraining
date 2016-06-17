var React = require('react');
var PropTypes  = React.PropTypes;

var MissionConnectProgressView = React.createClass({

    getInitialState: function() {

        return {

        };
    },

    propTypes: {
        scoreObjColl:PropTypes.object.isRequired
    },

    componentDidMount: function(){
        this.renderChecklist();
        this.renderTimer();
    },

    renderChecklist: function(){

    },

    renderTimer: function(){

    },

    render: function() {

        return (
            <div>
            </div>
        )
    }
});

module.exports = MissionConnectProgressView;