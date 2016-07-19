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
        // check if caption object pass in is valid
        switch(typeof this.state.caption) {
            case "undefined":
                break;
            case "string":
                if (this.state.caption.length < 1) {
                    break;
                }
            default:
                captionDiv = (
                    <div className="caption">
                        {this.state.caption}
                    </div>
                );
        }

        return  (
            <div key={"imageCaptionContainer-" + this.state.filePath} className="image-caption-container">
                <img className={this.state.videoType} src={this.state.filePath} aria-label={this.state.altText} title={this.state.altText} alt={this.state.altText}></img>
                {captionDiv}
            </div>
        );
    }
});

module.exports = ImageCaptionView;