/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');

var TimerCountdown = React.createClass({

    //props  duration, styling, controller, message, reportAt, timerStatusReporter

    getInitialState: function() {

        return {
            timeLeft:null,
            interval:null,
            pause:false
        };
    },

    componentWillMount: function() {
    },

    componentDidMount: function() {
        this.renderTime();
        this.controlsListeners();
    },

    componentWillUnmount: function() {
    },

    controlsListeners: function() {

        var self = this;

        switch (self.state.controller){

            case "pause":
                 self.state.pause = true;
                 break;
            case "resume": case "play":
                self.state.pause = false;
                break;
            case "stop":
                 clearInterval(self.state.interval);
                 self.state.interval = null;
                 break;
         }
    },

    renderTime: function(){

        var self = this;
        var timer = this.props.duration;
        var minutes, seconds;

        self.state.interval =  setInterval(function () {

            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            if (!self.state.pause) self.setState({timeLeft:(minutes <= 0) ? seconds : minutes+":"+seconds});

            if (--timer < 0) {
                timer = 0;
                self.props.timerStatusReporter("timeUp");
            }

            if (timer === self.props.reportAt.time){self.props.timerStatusReporter(self.props.reportAt.alert)}
           
        }, 1000);
    },


    render: function() {

        var self = this;
        return (
           <div style={this.props.styling}>{(self.props.message) ? self.props.message : self.state.timeLeft}</div>
        )
    }
});

module.exports = TimerCountdown;