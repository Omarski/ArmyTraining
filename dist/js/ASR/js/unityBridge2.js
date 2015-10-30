function GetUnity () {
	if (navigator.appVersion.indexOf("MSIE") != -1 && navigator.appVersion.toLowerCase().indexOf("win") != -1)
		return document.getElementById("UnityObject");
	else if (navigator.appVersion.toLowerCase().indexOf("chrome") != -1)
		return document.getElementById("UnityEmbed");
	else if (navigator.appVersion.toLowerCase().indexOf("safari") != -1)
		return document.getElementById("UnityEmbed");
	else
		return document.getElementById("UnityEmbed");
}

function IncomingMessageStub(mid, uri, mime, chunkSize) {
    this.id = mid;
	this.fromuri = uri;
	this.mime = mime;
	this.chunksize = chunkSize;
	this.data = "";
}

function SendMessageStub(msg, touri, mime, id, chunksize) {
    this.msg = msg;
    this.touri = touri;
    this.mime = mime;
	this.id = id;
	this.chunksize = chunksize;
}

var UnityCommunicator = function()
{
	var myURI = "urn:UnityCommunicator:Unity";
 	var delimiter = "\r\n";
	var chunksize = 256;


	var messagesToSendStack = new Array();
	var inbox = new Array();	

	function sendMessage(message, touri, mime) 
	{
		var myid = Messajs.send(myURI, touri, mime, chunksize, "");
		var sms = new SendMessageStub(message, touri, mime, -1, chunksize);
		messagesToSendStack.push(sms);
 	}

	function mjsBegin(mid, uri, mime, chunkSize, kind) {
	
		if (kind == "read") {
			for (i=0;i<messagesToSendStack.length;i++) {
				if (messagesToSendStack[i].id == -1) {
					messagesToSendStack[i].id = mid;
					messagesToSendStack[i].chunksize = chunkSize;
					return;
				}
			}	

		} else {	
			var sms = new IncomingMessageStub(mid, uri, mime, chunkSize);
			inbox.push(sms);

			//var mashup = "" + mid + delimiter + uri + delimiter + mime + delimiter + chunkSize + delimiter + kind;
		    //var unityObject = $('unityframe').contentWindow.GetUnity();
			//unityObject.SendMessage("MessajsClient2", "mjsStart", mashup);
		}
		
	}

	function mjsStart( id, uri, mime, chunkSize, kind )
	{
		if (kind == "read") {
			for (i=0;i<messagesToSendStack.length;i++) {
				if (messagesToSendStack[i].id == mid) {
					messagesToSendStack[i].chunksize = chunkSize;
					return;
				}
			}
	
		} else {	
			var sms = new IncomingMessageStub(mid, uri, mime, chunkSize);
			inbox.push(sms);
			
			//var mashup = "" + id + delimiter + uri + delimiter + mime + delimiter + chunkSize + delimiter + kind;
			//var unityObject = $('unityframe').contentWindow.GetUnity();
			//unityObject.SendMessage("MessajsClient2", "mjsStart", mashup);
		}
	}


    	function mjsRead( id, offset )
    	{
		for (i=0;i<messagesToSendStack.length;i++) {
			if (messagesToSendStack[i].id == id) {	
				//console.log("Found message with id: " + id);
				var msg = messagesToSendStack[i];
				if (offset < msg.msg.length) {
					Messajs.post(id, offset, msg.msg.substr(offset, msg.chunksize));
				} else {
					Messajs.posted(id, offset);
				}
			}			
		}

		//console.log("Did not find message with id: " + id);
		
		//var mashup = "" + id + delimiter + offset;
		//var unityObject = $('unityframe').contentWindow.GetUnity();
		//unityObject.SendMessage("MessajsClient2", "mjsRead", mashup);
	}


	
	function mjsWrite( id, offset, data )
	{
		for (i=0;i<inbox.length;i++) {
			if (inbox[i].id == id) {
				inbox[i].data = inbox[i].data.substr(0, offset) + data;		
				Messajs.written(id, offset);		
			}
		}

		//var mashup = "" + id + "\r\n" + offset + "\r\n" + data;
		//var unityObject = $('unityframe').contentWindow.GetUnity();
		//unityObject.SendMessage("MessajsClient2", "mjsWrite", mashup);
	}
	
	function mjsStatus( id, code, text )
	{
		for (i=0;i<messagesToSendStack.length;i++) {
			if (messagesToSendStack[i].id == id) {	
				if(window.console) {
					console.log("Finished sending message: " + messagesToSendStack[i].msg);
				}
				return;
			}
		}

		for (i=0;i<inbox.length;i++) {
			if (inbox[i].id == id) {
				var unityObject = $('unityframe').contentWindow.GetUnity();
				unityObject.SendMessage("MessajsClient2", "receiveMessage", inbox[i].data);

				if (window.console) {
					console.log("Finished receiving message: " + inbox[i].data);
				}
				return;
			}
		}

		var mashup = "" + id + delimiter + code + delimiter + text;
		var unityObject = $('unityframe').contentWindow.GetUnity();
		unityObject.SendMessage("MessajsClient2", "mjsStatus", mashup);
	}
	
	return {
		sendMessage: sendMessage,
		mjsStart:  mjsStart,
		mjsRead:   mjsRead,
		mjsWrite:  mjsWrite,
		mjsStatus: mjsStatus,
		mjsBegin: mjsBegin,
		mjsEnd : mjsStatus
	};
}();

function unitySendMessage(message, touri, mime) {
	UnityCommunicator.sendMessage(message, touri, mime);
}

function unityPost(mid, offset, data) {
	//debug("posting");
	Messajs.post(mid, offset, data);
}

function unityPosted(mid, offset) {
	Messajs.posted(mid, offset);
}

function unityWritten(mid, offset) {
	Messajs.written(mid, offset);
}

function unityError(mid, code, text) {
	Messajs.error(mid, code, text);
}
