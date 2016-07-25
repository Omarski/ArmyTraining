var React = require('react');
var ActiveDialogClosedCaptionStore = require('../../../../stores/active_dialog/ActiveDialogClosedCaptionStore');
var ActiveDialogClosedCaptionActions = require('../../../../actions/active_dialog/ActiveDialogClosedCaptionActions');

function getCCState() {
    return {
        show: ActiveDialogClosedCaptionStore.visible(),
        transcript: ActiveDialogClosedCaptionStore.transcript()
    };
}

var ActiveDialogClosedCaptionPanelView = React.createClass({

    toggle: function() {
        if (ActiveDialogClosedCaptionStore.visible()) {
            ActiveDialogClosedCaptionActions.hide();
        } else {
            ActiveDialogClosedCaptionActions.show();
        }
    },

    getInitialState: function() {
        var ccState = getCCState(this.props);
        return ccState;
    },

    componentWillMount: function() {

    },

    componentDidMount: function() {
        ActiveDialogClosedCaptionStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ActiveDialogClosedCaptionStore.removeChangeListener(this._onChange);
    },

    render: function() {
        var panel = (<div></div>);

        if (this.state.show) {
            function createCC(transcript) {
                return {__html: transcript};
            }

            var t = (
                <p dangerouslySetInnerHTML={createCC(this.state.transcript)}></p>
            );

            panel = (
                <div className="active-dialog-closed-caption-panel">
                    {t}
                </div>
            );
        } else {

        }

        return panel;
    },

    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getCCState(this.props));
        }
    }
});

module.exports = ActiveDialogClosedCaptionPanelView;