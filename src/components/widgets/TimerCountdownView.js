/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');

var TimerCountdown = React.createClass({

    //props  duration, styling, timerController, updateTimerController, message, reportAt, timerStatusReporter

    getInitialState: function() {

        return {
            timeLeft:null,
            interval:null,
        };
    },

    componentWillMount: function() {
    },

    componentDidMount: function() {
        this.renderTime();
    },

    componentWillUnmount: function() {
        clearInterval(this.state.interval);
        this.state.interval = null;
    },

    componentDidUpdate: function(prevProps, prevState){
    },

    renderTime: function(){

        var self = this;
        var timer = self.props.duration;
        var minutes, seconds;

        var interval =  setInterval(function () {

            if (self.props.timerController !== "pause") {

                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;
                
                    self.setState({timeLeft:(minutes <= 0) ? seconds : minutes+":"+seconds});

                    if (--timer <= 0) {
                        timer = self.props.duration;
                        self.props.updateTimerController("pause");
                        self.props.timerStatusReporter("timeUp");
                    }

                    if (timer === self.props.reportAt.time){self.props.timerStatusReporter(self.props.reportAt.alert)}
            }

            //console.log("mode "+  self.props.timerController + " duration: "+ self.props.duration);

        }, 1000);

        self.setState({interval:interval});
    },


    render: function() {

        var self = this;
        return (
           <div style={this.props.styling}>{(self.props.message) ? self.props.message : "Time left " + self.state.timeLeft + " seconds"}</div>
        )
    }
});

module.exports = TimerCountdown;