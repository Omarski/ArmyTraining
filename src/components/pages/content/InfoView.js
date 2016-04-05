var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');


function getPageState(props) {
    var noteItems = "";
    var mediaItems = "";
    var data = {
        title: "",
        pageType: "",
        note: "",
        noteAudio: [],
        page: "",
        media: "",
        videoType: "",
        sources: [],
        volume: SettingsStore.voiceVolume()
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        if (props.page.note) {
            var notes = props.page.note;


            noteItems = notes.map(function(item, index) {
                console.dir(item.media );
                if(item.media && item.media[0]){
                    // if statement to detect media in note, should be true
                    data.noteAudio.push(item.media[0].xid);
                }
                return (
                    <p className="lead" key={data.page.xid + String(index) + "note"}>{item.text}</p>
                );
            });
        }


        if(props.page.info){
            if(props.page.info.property){
                props.page.info.property.map(function(item){
                    switch(item.name){
                        case "cutscene":
                            // TODO: add a class that allows css to distinguish display types?
                            data.videoType = "cutscene";
                            break;
                        case "fullcoach":
                            data.videoType = "fullcoach";
                            break;
                        case "mediadisplayblurb":
                            caption = (<p>{item.value}</p>);
                            break;
                        default:
                            data.videoType = "";
                    }
                })
            }
        }

        if (props.page.media) {
            var media = props.page.media;
            mediaItems = media.map(function(item, index) {
                var filePath = "data/media/" + item.file;
                var result = <div key={index}>Unknown File Type</div>;

                if (item.type === "video") {
                    if(item.file.split(".")[1] === "mp4") {
                        result = <div className={data.videoType} key={index}>
                            <video controls>
                                <source src={filePath} type="video/mp4"></source>
                            </video>
                            {caption}
                        </div>
                    }
                }

                if (item.type === "image") {
                    result = <div key={index}>
                        <img className={data.videoType} src={filePath}></img>
                        {caption}
                    </div>
                }


                return result;

            });
        }
    }

    data.note = noteItems;
    data.media = mediaItems;
    //console.dir(data);
    return data;
}

function playMediaAudio(xidArray){
    //xid is of the form "000000000.mp3"

    if(xidArray.length > 0){
        $("#audio").bind('ended', function(){
            xidArray.shift();
            playMediaAudio(xidArray);
        });
        playAudio(xidArray[0]);
    }
}

function playAudio(xid){
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    source.src = "data/media/" + xid;
    audio.load();
    audio.play();
}

var InfoView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
        SettingsStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
        $('[data-toggle="tooltip"]').tooltip();
    },

    componentWillUpdate: function(){

    },

    componentDidUpdate: function(){
        //play audio recording for info page
        var self = this;
        var noteMedia = self.state.noteAudio;
        // play all note media in order (see dnd for example)
        playMediaAudio(noteMedia);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
        SettingsStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;
        var pageType = state.pageType;
        var pageNotes = state.note;
        var media = state.media;
        var mediaType = state.videoType;

        var mediaContainer = "";
        if (media) {
            mediaContainer = <div className="infoMediaContainer">{media}</div>;
        }

        function createMarkup(n) {
            var str = "";
            if (n.length) {
                for (var i = 0; i < n.length; i++) {
                    str += n[i];
                }
            } else {
                n = str;
            }

            return {__html: str};
        }
        return (
            <div>
                <div className="infoContainer" key={"page-" + this.state.page.xid}>
                    <audio id="audio" volume={this.state.volume}>
                        <source id="mp3Source" src="" type="audio/mp3"></source>
                        Your browser does not support the audio format.
                    </audio>
                    <div className="infoTitle">
                        <PageHeader sources={state.sources} title={title} key={this.state.page.xid}/>
                    </div>
                    <div className="infoDataContainer col-md-6 col-md-offset-3">
                        {mediaContainer}
                        <div className={mediaType + " infoNoteContainer"}>{pageNotes}</div>
                    </div>
                </div>
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getPageState(this.props));
        }

    }
});

module.exports = InfoView;