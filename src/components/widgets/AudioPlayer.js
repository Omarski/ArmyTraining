var React = require('react');
var PropTypes  = React.PropTypes;

var AudioPlayer = React.createClass({
    propTypes: {
        id: PropTypes.string.isRequired,
        sources: PropTypes.array.isRequired,
        autoPlay: PropTypes.bool,
        loop: PropTypes.bool,
        controls: PropTypes.bool,
        controller: PropTypes.string
    },

    componentDidMount: function() {
        this.renderAudioSources();
        this.audioController();
    },

    renderAudioSources: function(){

        //self = this;
        var audioSources = this.props.sources.map(function(source, index){
            var type = "audio/"+source.format;
            var id = source.format+"Source";
            return(
                <source src={source.url} id = {id} type = {type} key={index}/>
            )
        });

        return audioSources;
    },

    audioController: function(){

        var player = $("#"+this.props.id);

        switch (this.props.controller){
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

    render: function() {

        var autoPlay = this.props.autoPlay? true:false;
        var loop = this.props.loop? true:false;
        var controls = this.props.controls? true:false;
        return (
            <audio id={this.props.id} preload="auto" autoPlay={autoPlay} loop={loop} controls = {controls}>
                {this.renderAudioSources()}
            </audio>
        )
    }
});

module.exports = AudioPlayer;