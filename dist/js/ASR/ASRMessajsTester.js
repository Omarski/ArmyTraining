


var ASRMessajsTester = function()
{
	var myURI = "urn:ASRMessajsTester:MessajsImpl1";
 	var delimiter = "\r\n";
	var chunksize = 256;

	var messagesToSendStack = new Array();
	var inbox = new Array();	

	function sendMessage(message, touri, mime) {
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
		}
		
	}

	function mjsStart( id, uri, mime, chunkSize, kind ) {
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
		}
	}


    function mjsRead( id, offset ) {
		for (i=0;i<messagesToSendStack.length;i++) {
			if (messagesToSendStack[i].id == id) {	

				var msg = messagesToSendStack[i];
				if (offset < msg.msg.length) {
					Messajs.post(id, offset, msg.msg.substr(offset, msg.chunksize));
				} else {
					Messajs.posted(id, offset);
				}
			}			
		}
	}
	
	function mjsWrite( id, offset, data ) {
		for (i=0;i<inbox.length;i++) {
			if (inbox[i].id == id) {
				inbox[i].data = inbox[i].data.substr(0, offset) + data;		
				Messajs.written(id, offset);		
			}
		}
	}
	
	function mjsStatus( id, code, text ) {
		for (i=0;i<messagesToSendStack.length;i++) {
			if (messagesToSendStack[i].id == id) {	
				if(window.console) {
					//console.log("Finished sending message: " + messagesToSendStack[i].msg);
				}
				return;
			}
		}

		for (i=0;i<inbox.length;i++) {
			if (inbox[i].id == id) {
				//var unityObject = $('unityframe').contentWindow.GetUnity();
				//unityObject.SendMessage("MessajsClient2", "receiveMessage", inbox[i].data);

                if (ASR.RecievedMessaj) {
					ASR.RecievedMessaj(inbox[i].data);
                }
                
				if (window.console) {
					//console.log("Finished receiving message: " + inbox[i].data);
				}
				return;
			}
		}

		var mashup = "" + id + delimiter + code + delimiter + text;
		//var unityObject = $('unityframe').contentWindow.GetUnity();
		//unityObject.SendMessage("MessajsClient2", "mjsStatus", mashup);
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


function SendMessageStub(msg, touri, mime, id, chunksize) {
    this.msg = msg;
    this.touri = touri;
    this.mime = mime;
	this.id = id;
	this.chunksize = chunksize;
}

function IncomingMessageStub(mid, uri, mime, chunkSize) {
    this.id = mid;
	this.fromuri = uri;
	this.mime = mime;
	this.chunksize = chunkSize;
	this.data = "";
}