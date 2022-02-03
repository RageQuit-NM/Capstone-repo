import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../consts";

class Launcher extends AppWindow {
    private static _instance: Launcher;
    //private _gameEventsListener: OWGamesEvents;
    private mainWindowObject: Window;
  
    private constructor() {
      super(kWindowNames.launcher);
      //Constructor inexplicably runs 3 times, make it so only 1 listener is set for each element
      if (document.getElementById("smiley").getAttribute('listener') != 'true') {
        document.getElementById("smiley").setAttribute('listener', 'true');

        //Adds event listeners
        // document.getElementById("smiley").addEventListener("click", this.clickSmiley);
        // document.getElementById("straight").addEventListener("click", this.clickSmiley);
        // document.getElementById("sad").addEventListener("click", this.clickSmiley);
        document.getElementById("message_send").addEventListener("click", this.twilio);
      }

      //Hide these
      document.getElementById("smilies").style.display = "none";
      document.getElementById("smiley_title").style.display = "none";
   }
  
    public static instance() {
      if (!this._instance) {
        this._instance = new Launcher();
      }
      return this._instance;
    }
    
    //collect all messages from bus to be shown on the launcher page
    public async run() {
      this.setContent(); 
    }

    private twilio(){
    let serverAction = "test-sms";  //test-sms for twilio message, leave blank for deafualt action
    let remoteServer = "http://ec2-35-182-68-182.ca-central-1.compute.amazonaws.com:5000/" + serverAction;
    let response = httpGet(remoteServer);

    function httpGet(theUrl) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", theUrl, true ); // false for synchronous request
      xmlHttp.send( null );

      console.log(xmlHttp.response);
      console.log(xmlHttp.responseText);
      return xmlHttp.responseText;
    }

    document.getElementById("test_message").innerHTML = "reponse = " + response;
    }

    //Sets all message content from the bus
    public setContent(){
      this.mainWindowObject = overwolf.windows.getMainWindow(); //Gets the HTML Object of the main window for messaging

      let primary_message: string = this.mainWindowObject.document.getElementById("primary_message").innerHTML; //collect the primary_message
      document.getElementById("primary_message").innerHTML = primary_message;                                   //Update HTML document
      
      let time_message: string = this.mainWindowObject.document.getElementById("time_message").innerHTML;
      document.getElementById("time_played").innerHTML = time_message;

      let test_message: string = this.mainWindowObject.document.getElementById("test_message").innerHTML;
      document.getElementById("test_message").innerHTML = test_message;
    }


    // private async clickSmiley(){
    //   document.getElementById("smilies").style.display = "none";
    //   document.getElementById("smiley_title").style.display = "none";
    //   document.getElementById("content").style.display = "inherit";
    //   document.getElementById("broad_message").style.display = "inherit";
    //   Launcher.instance().setContent();     //?? idk it should be this.setContent() but that doesnt work so we access it from the Launcher class
    // }
}  
Launcher.instance().run();