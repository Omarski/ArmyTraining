var React = require('react');
var SettingsStore = require('../../stores/SettingsStore');

var PropTypes  = React.PropTypes;

var AudioPlayer = React.createClass({
    
    propTypes: {
        id: PropTypes.string.isRequired,
        sources: PropTypes.array.isRequired,
        autoPlay: PropTypes.bool,
        loop: PropTypes.bool,
        controls: PropTypes.bool,
        controller: PropTypes.func
    },

    componentDidMount: function() {
        this.renderAudioSources();
        if (this.props.controller) this.props.controller(this.audioController);
    },

    renderAudioSources: function(){

        var audioSources = this.props.sources.map(function(source, index){
            var type = "audio/"+source.format;
            var id = source.format+"Source";
            return(
                <source src={source.url} id = {id} type = {type} key={index}/>
            )
        });

        return audioSources;
    },

    audioController: function(mode){
        
        var player = document.getElementById(this.props.id);

        switch (mode){
            case "play":
                player.play();
                break;
            case "pause":
                player.pause();
                break;
            case "reset":
                player.seekable.start(0);
                break;
        }
    },

    setVolume: function(){
        var isMuted = SettingsStore.muted();
        var volumeSet = isMuted ? 0.0 : SettingsStore.voiceVolume();
        document.getElementById(this.props.id).volume = volumeSet;
    },

    render: function() {
        var self = this;
        var autoPlay = this.props.autoPlay? true:false;
        var loop = this.props.loop? true:false;
        var controls = this.props.controls? true:false;

        return (
            <audio id={this.props.id}
                   preload="auto"
                   autoPlay={autoPlay}
                   loop={loop}
                   controls={controls}
                   onLoadStart={self.setVolume}>
                {this.renderAudioSources()}
            </audio>
        )
    }
});

module.exports = AudioPlayer;