/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');

var TimerCountdown = React.createClass({

    //props  duration, styling, timerController, updateTimerController, message, reportAt, timerStatusReporter

    getInitialState: function() {

        return {
            timeLeft:"",
            interval:null,
            timer:null
        };
    },

    componentDidMount: function() {
        this.state.timer = this.props.duration;
        this.renderTime();
    },

    componentWillUnmount: function() {
        var self = this;
        clearInterval(self.state.interval);
        self.state.interval = null;
    },

    componentDidUpdate: function(prevProps, prevState){
        var self = this;
        if (self.props.timerParentAlerts === "timerReset") {
            self.state.timer = this.props.duration;
            self.props.timerStatusReporter("clearParentResetEvent");
        }
    },

    renderTime: function(){

        var self = this;
        var minutes, seconds;

        var interval = setInterval(function () {

            if (self.props.timerController !== "pause") {

                minutes = parseInt(self.state.timer / 60, 10);
                seconds = parseInt(self.state.timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;
                
                    self.setState({timeLeft:(minutes <= 0) ? seconds : minutes+":"+seconds});

                    if (--self.state.timer <= 0) {
                        self.props.timerStatusReporter("timeUp");
                    }

                    if (self.state.timer === self.props.reportAt.time){self.props.timerStatusReporter(self.props.reportAt.alert)}
            }
        }, 1000);

        self.setState({interval:interval});
    },


    render: function() {

        var self = this;
        return (<div>
                    {self.state.timeLeft !== "" ? <div style={this.props.styling}>{(self.props.message) ? self.props.message : "Time left " + self.state.timeLeft + " seconds"}</div>:null}
               </div>
            )
    }
});

module.exports = TimerCountdown;