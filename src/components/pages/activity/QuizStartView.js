var ImageCaption = require('../../widgets/ImageCaption');
var PageHeader = require('../../widgets/PageHeader');
var PageActions = require('../../../actions/PageActions');
var PageStore = require('../../../stores/PageStore');
var React = require('react');
var SettingsStore = require('../../../stores/SettingsStore');


function getPageState(props) {
    var data = {
        media: "",
        note: "",
        noteAudio: [],
        page: "",
        pageType: "",
        title: ""
    };
    var mediaItems = "";
    var noteItems = "";


    // get media for the page
    if(props && props.page && props.page.media){

        // iterate over each media object composing the html
        mediaItems = props.page.media.map(function(item, index) {
            var filePath = "data/media/" + item.file;
            var result = <div key={index}>Unknown File Type</div>;

            if (item.type === "video") {
                if(item.file.split(".")[1] === "mp4") {
                    result = <div className={data.videoType} key={index}>
                        <video id="video" controls autoPlay={SettingsStore.autoPlaySound()} volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                            <source src={filePath} type="video/mp4"></source>
                        </video>
                        {data.caption}
                    </div>
                }
            }

            if (item.type === "image") {
                result = (<ImageCaption videoType={data.videoType} src={filePath} key={index} altText={item.title} />);
            }

            return result;
        });
    }

    // get note data for the page
    if (props.page.note) {
        var notes = props.page.note;

        if(notes && notes.length > 1){
            noteItems = notes.map(function(item, index) {
                var hasBullet = (item.text.indexOf('-') === 0);
                var str = item.text;
                if (hasBullet) {
                    var arr = str.split('- ');
                    var len = arr.length;
                    var result = "";
                    for ( var i = 1; i < len; i++) {
                        result += '<p><span class="info-view-bullet-item"></span>' + arr[i] + '</p>';
                    }
                    str = result;
                }

                // if statement to detect media in note, should be true
                if(item.media && item.media[0]){
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
        } else {
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


    if (props && props.page) {
        data.media = mediaItems;
        data.note = noteItems;
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
    }

    return data;
}

function playAudio(xid){
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    source.src = "data/media/" + xid;
    audio.load();
    audio.play();
    audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
}

function playMediaAudio(xidArray){
    if(xidArray.length > 0){
        $("#audio").bind('ended', function(){
            xidArray.shift();
            playMediaAudio(xidArray);
        });
        playAudio(xidArray[0]);
    }
}


var QuizStartView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);

        // reset current quiz answers
        setTimeout(function() {
            PageActions.resetQuiz();
        }, 10);

        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //play audio recording for info page
        var self = this;
        var noteMedia = self.state.noteAudio;
        var video;

        playMediaAudio(noteMedia);
        video = document.getElementById("video");
        if(video){
            video.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
            video.onvolumechange=function(){
                self.updateVolume();
            };
        }
        $('[data-toggle="tooltip"]').tooltip();

    },

    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;
        var media = state.media;
        var pageNotes = state.note;

        // construct media container
        var mediaContainer = "";
        if (media) {
            mediaContainer = (
                <div className="infoMediaContainer">
                    {media}
                </div>
            );
        }

        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={state.page.xid}/>
                <div className="infoContainer" key={"page-" + this.state.page.xid}>
                    <div className="infoDataContainer container-fluid">
                        {mediaContainer}
                        <audio autoPlay id="audio" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                            <source id="mp3Source" src="" type="audio/mp3"></source>
                            Your browser does not support the audio format.
                        </audio>
                        <div className="infoNoteContainer">
                            <ul>{pageNotes}</ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getPageState(this.props));
        }
    }

});

module.exports = QuizStartView;