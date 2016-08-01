

var React = require('react');
var PropTypes  = React.PropTypes;
var VideoPlayer = React.createClass({

    propTypes: {

        id: PropTypes.string.isRequired,
        style: PropTypes.object,
        sources: PropTypes.array.isRequired,
        width: PropTypes.string.isRequired,
        height: PropTypes.string.isRequired,
        autoPlay: PropTypes.bool,
        loop: PropTypes.bool,
        controls: PropTypes.bool,
        controller: PropTypes.string,
        onVidEnded: PropTypes.func
    },

    componentDidMount: function() {
        this.renderVideoSources();
        this.videoController();

        if (this.props.onVidEnded){
            document.getElementById(this.props.id).addEventListener('ended',this.onVidEnded,false);
        }
    },

    renderVideoSources: function(){

        //self = this;
        var videoSources = this.props.sources.map(function(source, index){
            var type = "video/"+source.format;
            var id = source.format+"Source";
            return(
                <source src={source.url} id = {id} type = {type} key={index}/>
            )
        });

        return videoSources;
    },

    videoController: function(){

        var player = $("#"+this.props.id);

        switch (this.props.controller){
            case "play":
                player.play();
                break;
            case "pause":
                player.pause();
                break;
            case "reset":
                player.currentTime = 0;
                break;
        }
    },

    onVidEnded: function(){
        var self = this;
        window.setTimeout(function(){$("#"+self.props.id).remove();
            self.props.onVidEnded();
        },1000);

    },

    render: function() {

        var autoPlay = this.props.autoPlay? true:false;
        var loop = this.props.loop? true:false;
        var controls = this.props.controls? true:false;
        return (
            <video id={this.props.id}
                   style = {this.props.style}
                   preload="auto"
                   autoPlay={autoPlay}
                   autostart={autoPlay}
                   loop={loop}
                   controls={controls}>
                {this.renderVideoSources()}
            </video>
        )
    }
});

module.exports = VideoPlayer;