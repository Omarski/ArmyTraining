var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var ClosedCaptionStore = require('../../stores/ClosedCaptionStore');
var ClosedCaptionActions = require('../../actions/ClosedCaptionActions');

var ClosedCaptionView = React.createClass({
    getInitialState: function() {
        return {};
    },

    toggle: function() {
        if (ClosedCaptionStore.visible()) {
            ClosedCaptionActions.hide();
        } else {
            ClosedCaptionActions.show();
        }
    },

    render: function() {
        return  (
            <Button title={"Closed Caption"}
                    alt={"Closed Caption or Transcript"}
                    aria-label={"Video Transcript"}
                    className="btn btn-default btn-link btn-lg closed-caption-button"
                    onClick={this.toggle}
            >
                <span>
                    <img src="images/icons/closedcaption.png"/>
                </span>
            </Button>
        );
    }
});

module.exports = ClosedCaptionView;