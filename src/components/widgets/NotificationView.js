var React = require('react');
var NotificationStore = require('../../stores/NotificationStore');
var LocalizationStore = require('../../stores/LocalizationStore');

function getNotificationState() {
    return {
        title: NotificationStore.title(),
        body: NotificationStore.body(),
        visibile: NotificationStore.isVisible(),
        allowDismiss: NotificationStore.allowDismiss(),
        percent: NotificationStore.percent(),
        image: NotificationStore.image()
    }
}

var NotificationView = React.createClass({
    getInitialState: function() {
        var notificationState = getNotificationState(this.props);
        return notificationState;
    },

    componentWillMount: function() {
        NotificationStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        NotificationStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        NotificationStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var dismiss = '';
        var close = '';
        var progress = '';
        var image = '';
        var isSplashCls = "";
        var percent = {
          width: this.state.percent + '%'
        };

        if (this.state.percent !== '') {
            progress =  <div className="progress">
                            <div
                                style={percent}
                                className="progress-bar progress-bar-success progress-bar-striped active" role="progressbar"  aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" >
                                <span className="sr-only">60% Complete</span>
                            </div>
                        </div>;
        }
        if (this.state.allowDismiss) {
            dismiss = <button type="button" className="close" data-dismiss="modal" aria-label={LocalizationStore.labelFor("tools", "mdlClose")}><span aria-hidden="true">&times;</span></button>;
            close = <button type="button" className="btn btn-default" data-dismiss="modal">{LocalizationStore.labelFor("tools", "mdlClose")}</button>;
        }

        if (this.state.image) {
            image = (<img className="splash-image" src={this.state.image} height="90%" width="90%"></img>);
            isSplashCls = " big-splash";
        }

        return <div id="notificationView" className="modal fade" data-backdrop="static">
                <div className={"modal-dialog notification-view-dialog" + isSplashCls}>
                    <div className="modal-content">
                        <div className="modal-header">
                            {dismiss}
                            <h4 className="modal-title">{this.state.title}</h4>
                        </div>
                        <div className="modal-body">
                            {image}
                            <p>{this.state.body}</p>
                            {progress}
                        </div>
                        <div className="modal-footer">
                            {close}
                        </div>
                    </div>
                </div>
            </div>
    },
    _onChange: function() {
        this.setState(getNotificationState());
    }
});

module.exports = NotificationView;