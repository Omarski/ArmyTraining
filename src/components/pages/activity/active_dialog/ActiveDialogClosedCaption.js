var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var LocalizationStore = require('../../../../stores/LocalizationStore');
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
            <Button title={LocalizationStore.labelFor("evaluation", "lblClosedCaptions")}
                    alt={"Closed Caption or Transcript"}
                    aria-label={"Video Transcript"}
                    className="btn btn-default btn-link btn-lg active-dialog-closed-caption-button"
                    onClick={this.toggle}
            >
                <span className="glyphicon btn-icon" aria-hidden="true">
                    <img src="images/icons/ClosedCaptionIcon2.png"/>
                </span>
            </Button>
        );
    }
});

module.exports = ActiveDialogClosedCaptionView;