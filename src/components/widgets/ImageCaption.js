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
        return  (
            <div className="image-caption-container">
                <img className={this.state.videoType} src={this.state.filePath} alt={this.state.altText}></img>
                <div className="caption">
                        {this.state.caption}
                </div>
            </div>
        );
    }
});

module.exports = ImageCaptionView;