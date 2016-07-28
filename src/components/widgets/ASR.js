/**
 * Created by Alec on 6/7/2016.
 */
var React = require('react');
var ASRActions = require('../../actions/ASRActions');
var ASRStore = require('../../stores/ASRStore');

function asrState() {
    return {};
}
var ASR = React.createClass({
    getInitialState: function() {
        return asrState();
    },

    componentWillMount: function() {
        ASRStore.addChangeListener(this._onASRChange);
    },

    componentDidMount: function() {

    },

    componentWillUnmount: function() {
        ASRStore.removeChangeListener(this._onChange);
    },
    loadASR: function(){
        ASRActions.load();
    },

    render: function() {
        // setup plugin html code
        var pluginHTML = '<applet code="org.jdesktop.applet.util.JNLPAppletLauncher" archive="applet-launcher.jar,SpeechInterfaceApplet.jar" height="0" mayscript="yes" scriptable="true" id="ASRApplet" name="ASRApplet">\n';
        pluginHTML += '<param name="codebase_lookup" value="false"/>\n';
        pluginHTML += '<param name="prgressbar" value="true"/>\n';
        pluginHTML += '<param name="subapplet.classname" value="com.alelo.speechinterfaceapplet.SpeechInterfaceApplet"/>\n';
        pluginHTML += '<param name="subapplet.displayname" value="SpeechInterface"/>\n';
        pluginHTML += '<param name="jnlpNumExtensions" value="1"/>\n';
        pluginHTML += '<param name="jnlpExtension1" value="speechinterface15.jnlp"/>\n';
        pluginHTML += '<param name="installationType" value="wan"/>\n';
        pluginHTML += '<param name="jnlp_href" value="speechinterface16.jnlp"/>\n';
        pluginHTML += '</applet>\n';

        var self = this;
        setTimeout(function() {
            document.getElementById('asr').innerHTML = pluginHTML;

            setTimeout(function() {
                self.loadASR();
            });
        });

        //pluginHTML = "";

        //var dangerousMarkup = {

          //  __html: pluginHTML // the whole markup string you want to inject
        //};


        return (<div></div>);
        //return (
        //    <div dangerouslySetInnerHTML={dangerousMarkup}></div>);

    },

    /**
     * Event handler for 'change' events coming from the ASRStore
     */
    _onASRChange: function (){
        var self = this;

    },


});

module.exports = ASR;