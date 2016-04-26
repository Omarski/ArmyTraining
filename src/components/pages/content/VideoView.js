var React = require('react');
var PageStore = require('../../../stores/PageStore');


function getPageState(props) {
    var title = "";
    var pageType = "";
    var noteItems = "";
    var mediaItems = "";

    if (props && props.page) {
        title = props.page.title;
        pageType = props.page.type;
        if (props.page.note) {
            var notes = props.page.note;

            noteItems = notes.map(function(item, index) {
                return (
                    <p key={index}>{item.text}</p>
                );
            });
        }

        if (props.page.media) {
            var media = props.page.media;
            mediaItems = media.map(function(item, index) {
                var filePath = "data/media/" + item.file;
                var result = <div key={index}>Unknown File Type</div>

                if (item.type === "video") {
                    result = <div key={index}>
                        <video width="320"
                               height="240"
                               controls
                               volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()} >
                            <source src={filePath} type="video/mp4"></source>
                        </video>
                    </div>
                }

                if (item.type === "image") {
                    result = <div key={index}>
                        <img src={filePath}></img>
                    </div>
                }
                return result;

            });
        }
    }

    return {
        title: title,
        note: noteItems,
        media: mediaItems,
        pageType: pageType
    };
}

var VideoView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },
    render: function() {

        return (
            <div>
                <div className="container" key={"page-" + this.state.page.xid}>
                    <h3>{this.state.title} : {this.state.pageType}</h3>
                    <div>
                        {this.state.note}
                        {this.state.media}
                    </div>
                </div>
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        this.setState(getPageState());
    }
});

module.exports = VideoView;