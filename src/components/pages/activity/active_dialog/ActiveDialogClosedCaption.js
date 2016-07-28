var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Tooltip = ReactBootstrap.Tooltip;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
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
        var tt = (<Tooltip id="closedCaptionTooltip">{LocalizationStore.labelFor("evaluation", "lblClosedCaptions")}</Tooltip>);
        return  (
            <OverlayTrigger
                overlay={tt} placement="top"
                delayShow={300} delayHide={150}
            >
            <Button title={"Closed Caption"}
                    alt={"Closed Caption or Transcript"}
                    aria-label={"Video Transcript"}
                    className="btn btn-default btn-link btn-lg active-dialog-closed-caption-button"
                    onClick={this.toggle}
            >
                <span className="glyphicon glyphicon-subtitles btn-icon" aria-hidden="true"></span>
            </Button>
        </OverlayTrigger>


        );
    }
});

module.exports = ActiveDialogClosedCaptionView;