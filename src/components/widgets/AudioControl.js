var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var LocalizationStore = require('../../stores/LocalizationStore');

var AudioControl = React.createClass({
    getInitialState: function() {
        return {isPlaying: false};
    },

    toggle: function() {
      this.setState({isPlaying:!this.state.isPlaying});
    },

    render: function() {
        var controlButton = "";
        if (this.state.isPlaying) {
            controlButton = (
                <Button
                    id="audioControlButton"
                    title={LocalizationStore.labelFor("audio", "tooltipPlay")}
                    alt={LocalizationStore.labelFor("audio", "tooltipPlay")}
                    type="button"
                    aria-label={LocalizationStore.labelFor("audio", "tooltipPlay")}
                    className="btn btn-default btn-link main-nav-bookmark"
                    onClick={this.toggle}
                >
                    <span className="glyphicon glyphicon-play" aria-hidden="true"></span>
                </Button>
            );
        } else {
            controlButton = (
                <Button
                    id="audioControlButton"
                    title={LocalizationStore.labelFor("audio", "tooltipPause")}
                    alt={LocalizationStore.labelFor("audio", "tooltipPause")}
                    type="button"
                    aria-label={LocalizationStore.labelFor("audio", "tooltipPause")}
                    className="btn btn-default btn-link main-nav-bookmark"
                    onClick={this.toggle}
                >
                    <span className="glyphicon glyphicon-pause" aria-hidden="true"></span>
                </Button>
            );
        }
        return (
            <div className="audio-controls">
                <i id="audioControlIcon" className="fa fa-commenting" aria-hidden="true"></i>
                {controlButton}
            </div>
        )
    }
});

module.exports = AudioControl;