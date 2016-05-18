/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');

var TimerCountdown = React.createClass({

    getInitialState: function() {

        return {
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

        return (
           <div></div>

        )
    }
});

module.exports = TimerCountdown;