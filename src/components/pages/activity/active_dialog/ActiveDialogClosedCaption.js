var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var ActiveDialogClosedCaptionStore = require('../../../../stores/active_dialog/ActiveDialogClosedCaptionStore');
var ActiveDialogClosedCaptionActions = require('../../../../actions/active_dialog/ActiveDialogClosedCaptionActions');

var ActiveDialogClosedCaptionView = React.createClass({
    getInitialState: function() {
        return {};
    },

    toggle: function() {
        if (ActiveDialogClosedCaptionStore.visible()) {
            ActiveDialogClosedCaptionActions.hide();
        } else {
            ActiveDialogClosedCaptionActions.show();
        }
    },

    render: function() {
        return  (
            <Button title={"Closed Caption"}
                    alt={"Closed Caption or Transcript"}
                    aria-label={"Video Transcript"}
                    className="btn btn-default btn-link btn-lg active-dialog-closed-caption-button"
                    onClick={this.toggle}
            >
                <span className="glyphicon glyphicon-subtitles btn-icon" aria-hidden="true"></span>
            </Button>
        );
    }
});

module.exports = ActiveDialogClosedCaptionView;