//
// ASR adapter that provides the same methods as exposed by the ASR applet.
// Construct an instance of the adapter object by calling:
//
// var asr = new asrAdapter(pluginObjectId)
//
//
function addEvent(obj, name, func)
{
    if (window.addEventListener) {
        obj.addEventListener(name, func, false);
    } else {
        obj.attachEvent("on"+name, func);
    }
}

function AsrAdapter(pluginObject)
{
    this.pluginObject = pluginObject;

    this.initialize = function() {
        addEvent(this.pluginObject, 'modelinitialized', this.modelInitialized);
        addEvent(this.pluginObject, 'recognizeresult', this.recognizeResult);
        addEvent(this.pluginObject, 'recordstarted', this.recordStarted);
        addEvent(this.pluginObject, 'recordstopped', this.recordStopped);
        addEvent(this.pluginObject, 'recordlevel', this.recordLevel);
        addEvent(this.pluginObject, 'playstarted', this.playStarted);
        addEvent(this.pluginObject, 'playstopped', this.playStopped);
        addEvent(this.pluginObject, 'modelloadsuccess', this.modelLoadSuccess);
        addEvent(this.pluginObject, 'modelloadfailure', this.modelLoadFailure);

    };

    this.getVersion = function() {
        // returns the version of the plugin.
        return this.pluginObject.getVersion();
    };

    this.initializeASR = function(lang) {
        this.pluginObject.initialize(lang);
    };
	
	this.installModel = function (lang,fileUrl) {
		this.pluginObject.installModel(lang, fileUrl);
	};

	this.isModelInstalled = function (lang) {
		return this.pluginObject.isModelInstalled(lang);
	};

    this.getSampleRate = function() {

    };

    this.startRecording = function() {
        this.pluginObject.startRecording();
    };

    this.startRecordingWithVolume = function() {
        this.pluginObject.startRecording();
    };

    this.stopRecording = function() {
        this.pluginObject.stopRecording();
    };

    this.playbackRecording = function() {
        this.pluginObject.startPlaying();

    };

    this.recordingData = function() {

    };

    this.recognize = function(grammar) {
        this.pluginObject.recognize(grammar);

    };

    this.recognizeFile = function(grammar, soundfile) {
        this.pluginObject.recognizeFile(grammar, soundfile);
    };

    this.getGrammarNames = function() {
        return this.pluginObject.getGrammars();
    };

    this.getGrammarPhrases = function(grammar) {
        return this.pluginObject.getPhrases(grammar);
    };


    // Event listeners
    this.modelInitialized = function(modelName, sampleRate, numChannels) {

		var param = {samplerate: sampleRate};
        asr_initialized(param);

    };

    this.recognizeResult = function(finalResult, pass1Result, pass2Result, cleanedResult, duration, warnings) {

        post_result_object(duration, pass1Result, pass2Result, finalResult, warnings, "", "", "", cleanedResult);

    };

    this.recordStarted = function() {

        recordingStarted();

    };

    this.recordStopped = function() {

        recordingStopped();

    };

    this.recordLevel = function(level) {

        soundLevel(level);

    };

    this.playStarted = function() {

        // No corresponding api in applet-based asr.

    };

    this.playStopped = function() {

        // No corresponding api in applet-based asr.

    };

	this.modelLoadSuccess = function(modelName) {
		modelLoadSuccess(modelName);
	}

	this.modelLoadFailure = function(modelName) {
		modelLoadFailure(modelName);
	}
}



