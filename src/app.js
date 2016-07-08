/** @jsx React.DOM */
var React = require('react');
var ReactDOM = require('react-dom');
var MainView = require('./components/MainView');
var ASRStore = require('./stores/ASRStore');
var SettingsStore = require('./stores/SettingsStore');

ReactDOM.render(
    <MainView />,
    document.getElementById('mainView')
);

$(document).on("click", ".btn-clk", function(){
    var audio = document.getElementById('mainViewAudio');
    var source = document.getElementById('mainViewMp3Source');

    source.src = "data/media/Neutral.mp3";
    audio.load();
    audio.play();
    audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
});
