var React = require('react');

function getImageCaptionState(props) {
    return {
        videoType: props.videoType || "",
        filePath: props.src || "",
        caption: props.caption || "",
        altText: props.altText || "",
        onImageLoaded: props.onImageLoaded || null
    };
}

var ImageCaptionView = React.createClass({
    checkImage: function() {
        var img = document.getElementById('captionImage');

        if (img && img.clientWidth && this.state.onImageLoaded) {
            this.state.onImageLoaded(img.clientWidth, img.clientHeight);
        }
    },

    handleImageLoaded: function () {
        this.checkImage();
    },

    handleImageErrored: function () {
        // handle error
    },

    getInitialState: function() {
        return getImageCaptionState(this.props);
    },

    componentDidMount: function() {
        //this.checkImage();
    },

    componentDidUpdate: function() {
        //this.checkImage();
    },


    render: function() {
        var captionDiv = "";
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
                <img
                    id="captionImage"
                    className={this.state.videoType}
                    src={this.state.filePath}
                    aria-label={this.state.altText}
                    title={this.state.altText}
                    alt={this.state.altText}
                    onLoad={this.handleImageLoaded}
                    onError={this.handleImageErrored}
                >
                </img>
                {captionDiv}
            </div>
        );
    }
});

module.exports = ImageCaptionView;