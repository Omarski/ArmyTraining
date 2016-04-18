var React = require('react');

function getImageCaptionState(props) {
    return {
        videoType: props.videoType || "",
        filePath: props.src || "",
        caption: props.caption || "",
        altText: props.altText || ""
    };
}

var ImageCaptionView = React.createClass({
    getInitialState: function() {
        return getImageCaptionState(this.props);
    },
    render: function() {
        captionDiv = "";

        // if caption exists add it
        if (this.state.caption && this.state.caption.length > 0) {
            captionDiv = (
                <div className="caption">
                    {this.state.caption}
                </div>
            );
        }

        return  (
            <div className="image-caption-container">
                <img className={this.state.videoType} src={this.state.filePath} alt={this.state.altText}></img>
                {captionDiv}
            </div>
        );
    }
});

module.exports = ImageCaptionView;