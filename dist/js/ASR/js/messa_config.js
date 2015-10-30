
var MessajsConfig = function()
{
    /**
     * MessajsConfig.getMessajer - REQUIRED to use messa.js
     *
     * @param{string} nid - messajer namespace id
     * @return{object} messajer handle
     */
    function getMessajer( nid )
    {
		debug("getMessajer", ":", nid);

		if (nid == "UnityCommunicator") return UnityCommunicator;
	    if (nid == "urn:UnityCommunicator:Unity") return UnityCommunicator;
        
        if (nid == "WeleMessajr")  return document.getElementById('WelePlatform');   
        if (nid == "urn:WeleMessajr:MessajsImpl1")  return document.getElementById('WelePlatform');
        
        if (nid == "UTMessajr")  return document.getElementById('UtteranceTrainer');   
        if (nid == "urn:UTMessajr:MessajsImpl1")  return document.getElementById('UtteranceTrainer');
        
        if (nid == "ASRMessajsTester") return ASRMessajsTester;
        if (nid == "urn:ASRMessajsTester:MessajsImpl1") return ASRMessajsTester;
        
        if (nid == "ASRApplet")
        {
            if (document.getElementById("ASRApplet").getSubApplet)
            {
                return document.getElementById("ASRApplet").getSubApplet();
            }
            else
            {
                return document.getElementById("ASRApplet");
            }
        }
        
    	return null;
    } 

	function debug(a,b,c) 
	{
		//document.getElementById('Testoutput').innerHTML += "\n" + a + "\t" + b + "\t" + c + "\n";
        //window.status = a + ',' + b + ',' + c;
	}

    return { /** MessajsConfig public functions */
        getMessajer: getMessajer,
		debug : debug
    }
}();

