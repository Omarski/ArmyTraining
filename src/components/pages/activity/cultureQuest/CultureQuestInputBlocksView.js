/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');

var CultureQuestInputBlocks = React.createClass({

    getInitialState: function() {

        return {
            mediaPath:'data/media/',
        };
    },

    componentWillMount: function() {

        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {

        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },

    render: function() {

        var self = this;

        return (
           <div></div>
        )
    }
});

module.exports = CultureQuestInputBlocks;