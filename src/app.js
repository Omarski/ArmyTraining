/** @jsx React.DOM */
var React = require('react');
var ReactDOM = require('react-dom');
var MainView = require('./components/MainView');
var ASRStore = require('./stores/ASRStore');


ReactDOM.render(
    <MainView />,
    document.getElementById('mainView')
);
/*
$('.btn-action').on('click', function(){
    var audio = document.getElementById('audio');
});
    */