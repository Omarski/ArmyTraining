var React = require('react');

function getImageCaptionState(props) {
    return {
        transcript: props.transcript || ''
    };
}

var ImageCaptionView = React.createClass({
    getInitialState: function() {
        return getImageCaptionState(this.props);
    },
    render: function() {
        return  (
            <div>
            </div>
        );
    }
});

module.exports = ImageCaptionView;