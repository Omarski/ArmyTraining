var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
var DefaultPageView = require('./pages/content/DefaultPageView');
var InfoView = require('./pages/content/InfoView');
var LocalizationStore = require('../stores/LocalizationStore');
var PageTypeConstants = require('../constants/PageTypeConstants');
var PronunciationView = require('./pages/activity/PronunciationView');
var RemediationActions = require('../actions/RemediationActions');
var RemediationStore = require('../stores/RemediationStore');

function getCompState() {
    var page = null;
    var show = false;

    // get loaded page data
    if (RemediationStore.loadingComplete()) {
        page = RemediationStore.getCurrentPage();
        show = true;
    }

    return {
        enableNext: RemediationStore.hasNextPage(),
        enablePrev: RemediationStore.hasPreviousPage(),
        page: page,
        show: show
    };
}

var RemediationView = React.createClass({
    getInitialState: function() {
        return getCompState();
    },

    componentWillMount: function() {
        RemediationStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        RemediationStore.removeChangeListener(this._onChange);
    },

    hideModal: function() {
        RemediationActions.destroy();
    },

    onClose: function() {
        RemediationActions.destroy();
    },

    onNext: function() {
        RemediationActions.loadNext();
    },

    onPrevious: function() {
        RemediationActions.loadPrev();
    },

    render: function() {
        var pageId = "";
        var page = <div></div>;

        if (this.state.page) {
            pageId = this.state.page.xid;

            switch (this.state.page.type) {
                case PageTypeConstants.INFO:
                    page = <InfoView page={this.state.page} />;
                    break;
                case PageTypeConstants.PRONUNCIATION:
                    page = <PronunciationView page={this.state.page} />;
                    break;
                default:
                    page = <DefaultPageView page={this.state.page} />;
            }
        }

        return (
            <Modal show={this.state.show} onHide={this.hideModal}>
                <Modal.Body>
                    <div key={"remediation-" + pageId}>
                        {page}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-default" aria-label="Previous" onClick={this.onPrevious} disabled={!this.state.enablePrev}>
                        {LocalizationStore.labelFor("remediation", "btnPrevious")}
                    </button>
                    <button type="button" className="btn btn-default" aria-label="Next" onClick={this.onNext} disabled={!this.state.enableNext}>
                        {LocalizationStore.labelFor("remediation", "btnNext")}
                    </button>
                    <button type="button" className="btn btn-default" aria-label="Close" onClick={this.onClose}>
                        {LocalizationStore.labelFor("remediation", "btnClose")}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    },

    _onChange: function() {
        this.setState(getCompState());
    }
});

module.exports = RemediationView;