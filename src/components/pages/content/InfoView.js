var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');
var ClosedCaption = require('../../widgets/ClosedCaption');


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
        caption: "",
        transcript: "",
        fullCoach: false,
        volume: SettingsStore.voiceVolume()
    };

    var caption = "";
    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;

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
                            data.fullCoach = true;
                            break;
                        case "mediadisplayblurb":
                            data.caption = (<p>{item.value}</p>);
                            break;
                        case "mediacaption":
                            data.sources.push(item.value);
                            break;
                        case "videoTranscript":
                            data.transcript = item.value;
                            break;
                        default:
                            data.videoType = "";
                    }
                })
            }
        }


        if (props.page.note) {
            var notes = props.page.note;

            if(notes && notes.length > 1){
                noteItems = notes.map(function(item, index) {
                    var hasBullet = (item.text.indexOf('-') === 0);

                    var str = item.text;
                    if (hasBullet) {
                        //str = str.replace('-', '<span class="info-view-bullet-item"></span>'); // first dash
                        //str = str.replace(new RegExp('- ', 'g'), '<span class="info-view-bullet-item"></span>');
                        var arr = str.split('- ');
                        var len = arr.length;
                        var result = "";
                        for ( var i = 1; i < len; i++) {
                            result += '<p><span class="info-view-bullet-item"></span>' + arr[i] + '</p>';
                        }
                        str = result;
                    }

                    if(item.media && item.media[0]){
                        // if statement to detect media in note, should be true
                        data.noteAudio.push(item.media[0].xid);
                    }

                    function createNote() {
                        return {__html: str};
                    }

                    return (
                        <li key={index}>
                            <p  key={data.page.xid + String(index) + "note"} dangerouslySetInnerHTML={createNote()}></p>
                        </li>
                    );
                });
            }else{
                noteItems = notes.map(function(item, index) {
                    if(item.media && item.media[0]){
                        // if statement to detect media in note, should be true
                        data.noteAudio.push(item.media[0].xid);
                    }
                    return (
                        <p key={data.page.xid + String(index) + "note"}>{item.text}</p>
                    );
                });
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
                            <video controls autoPlay>
                                <source src={filePath} type="video/mp4"></source>
                            </video>
                            {data.caption}
                        </div>
                    }
                }

                if (item.type === "image") {
                    result = (<div className="image-caption-container" key={index}>
                                <figure>
                                    <img className={data.videoType} src={filePath}></img>
                                    <figcaption>{data.caption}</figcaption>
                                </figure>
                            </div>);
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
        //play audio recording for info page
        var self = this;
        var noteMedia = self.state.noteAudio;
        // play all note media in order (see dnd for example)
        playMediaAudio(noteMedia);
        //PageStore.addChangeListener(this._onChange);
        $('[data-toggle="tooltip"]').tooltip();
    },

    componentWillUpdate: function(){

    },

    componentDidUpdate: function(){

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
        var isFullCoach = state.fullCoach;
        var content = "";
        var noteDisplay = <div className={mediaType + " infoNoteContainer"}>{pageNotes}</div>;
        if(state.page.note && state.page.note.length > 1){
            noteDisplay = <div className={mediaType + " infoNoteContainer"}>
                <ul>{pageNotes}</ul>
            </div>;
        }

        var cc = "";
        if (state.transcript !== "") {
            cc = (
                <div>
                    <ClosedCaption transcript={state.transcript}/>
                </div>
            );
        }

        var mediaContainer = "";
        if (media) {
            mediaContainer = (
                <div className="infoMediaContainer">
                    {media}
                </div>
                );
        }

        if (isFullCoach) {
            content = (
                <div className="row">
                    <div className="col-sm-6 col-md-6">
                        {mediaContainer}
                    </div>
                    <div className="col-sm-6 col-md-6">
                        {noteDisplay}
                    </div>
                </div>
            );

        } else {
            content = (
                <div>
                    {mediaContainer}
                    {noteDisplay}
                </div>
            );
        }


        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={this.state.page.xid}/>
                <div className="infoContainer" key={"page-" + this.state.page.xid}>
                    {cc}
                    <audio autoPlay id="audio" volume={this.state.volume}>
                        <source id="mp3Source" src="" type="audio/mp3"></source>
                        Your browser does not support the audio format.
                    </audio>
                    <div className="infoDataContainer container-fluid">
                        {content}
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