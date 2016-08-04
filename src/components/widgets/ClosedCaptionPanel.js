var React = require('react');
var ClosedCaptionStore = require('../../stores/ClosedCaptionStore');
var ClosedCaptionActions = require('../../actions/ClosedCaptionActions');
var LocalizationStore = require('../../stores/LocalizationStore');

function getCCState(props) {
    return {
        show: ClosedCaptionStore.visible(),
        transcript: props.transcript || ''
    };
}

var ClosedCaptionPanelView = React.createClass({

    toggle: function() {
        if (ClosedCaptionStore.visible()) {
            ClosedCaptionActions.hide();
        } else {
            ClosedCaptionActions.show();
        }
    },

    getInitialState: function() {
        var ccState = getCCState(this.props);
        return ccState;
    },

    componentWillMount: function() {

    },

    componentDidMount: function() {
        ClosedCaptionStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ClosedCaptionStore.removeChangeListener(this._onChange);
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
                <div className="panel panel-default closed-caption-panel">
                    <div className="panel-heading">
                        <h3 className="panel-title">{LocalizationStore.labelFor("closedCaption", "lblTitle")}</h3>
                        <button className="btn btn-default closed-caption-close-button" onClick={this.toggle}>
                            <span className="glyphicon" aria-hidden="true">
                                <img src="images/icons/explorercloseh.png"/>
                            </span>
                        </button>
                    </div>
                    <div className="panel-body">
                        {t}
                    </div>
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

module.exports = ClosedCaptionPanelView;