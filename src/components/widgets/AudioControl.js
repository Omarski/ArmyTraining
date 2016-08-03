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
        var audio = $('#audio')[0];
        if (audio) {
            if (audio.duration > 0 && !audio.paused) { // is playing
                audio.pause();
            } else {
                audio.play();
            }
        }

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
                    <img src="images/icons/playn.png" className="bookmark-icon"/>
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
                    <img src="images/icons/pausenarrationn.png" className="bookmark-icon"/>
                </Button>
            );
        }
        return (
            <div className="audio-controls">
                <img id="audioControlIcon" src="images/icons/narrationn.png"/>
                {controlButton}
            </div>
        )
    }
});

module.exports = AudioControl;