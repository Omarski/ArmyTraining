var React = require('react');
var NotificationStore = require('../../stores/NotificationStore');

function getNotificationState() {
    return {
        title: NotificationStore.title(),
        body: NotificationStore.body(),
        visibile: NotificationStore.isVisible(),
        allowDismiss: NotificationStore.allowDismiss(),
        percent: NotificationStore.percent()
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
            dismiss = <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>;
            close = <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>;
        }
        return <div id="notificationView" className="modal fade">
                <div className="modal-dialog notification-view-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            {dismiss}
                            <h4 className="modal-title">{this.state.title}</h4>
                        </div>
                        <div className="modal-body">
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