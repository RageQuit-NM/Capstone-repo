import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../consts";

class Launcher extends AppWindow {
    private static _instance: Launcher;
    //private _gameEventsListener: OWGamesEvents;
    private mainWindowObject: Window;
    private remoteAddress: string = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";
    public bedTime: string;
  
    private constructor() {
      super(kWindowNames.launcher);
      //this.remoteAddress = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";
      //Constructor inexplicably runs 3 times, make it so only 1 listener is set for each element. This seems to run when the dismiss button is hit too
      if (document.getElementById("smiley").getAttribute('listener') != 'true') {
        document.getElementById("smiley").setAttribute('listener', 'true');

        //Adds event listeners
        // document.getElementById("smiley").addEventListener("click", this.clickSmiley);
        // document.getElementById("straight").addEventListener("click", this.clickSmiley);
        // document.getElementById("sad").addEventListener("click", this.clickSmiley);
        //document.getElementById("parentPortalButton").addEventListener("click", this.parentPortalOpen); 
        document.getElementById("message_send").addEventListener("click", this.twilio);

        this.collectPreferences();
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
      
      //this.parentPortalOpen();
      //this.parentPortalClose();
      setInterval(this.checkBedtime, 1000*10);
      setInterval(this.collectPreferences, 1000*5);
    }

    public async checkBedtime(){
      if(Launcher.instance().bedTime != null){
        let date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let hoursString = (hours as unknown as string), minutesString = (minutes as unknown as string);
        if(hours < 10){
          hoursString = "0" + (hours as unknown as string);
        }
        if(minutes < 10){
          minutesString = "0" + (minutes as unknown as string);
        }
        let localBedTime = hoursString + ":" + minutesString;
        document.getElementById("test_message").innerHTML = "betime is: " + Launcher.instance().bedTime + "and current time is: " + date.toLocaleTimeString();
        if(Launcher.instance().bedTime > localBedTime){
          document.getElementById("test_message3").innerHTML = "It is not your bedtime yet. " + Launcher.instance().bedTime + " > " + localBedTime;
        }else{
          document.getElementById("test_message3").innerHTML = "It is bedtime, time to stop playing."  + Launcher.instance().bedTime + " !> " + localBedTime;
          //Launcher.instance().sendBedtimeMessage();
        }
        
      }
      //document.getElementById("test_message").innerHTML += "bedtime null";
    }

    private sendBedtimeMessage(){
      let messageData = {cellNum: "69"};
      let serverAction = "bedtime-message";  //
      let remoteServer = "http://" +  this.remoteAddress + ":5000/" + serverAction;
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("POST", remoteServer, true);
      xmlHttp.setRequestHeader('Content-Type', 'application/json');
      xmlHttp.send(JSON.stringify(messageData));
  
      xmlHttp.onreadystatechange = function () {
        if (this.readyState != 4) return;
        if (this.status == 200) {
          var response = (this.responseText); // we get the returned data
          //document.getElementById("test_message").innerHTML = "reponse from /upload-game-data = " + response;
          //console.log("reponse from /send-message1 = " + response);
        }
        // end of state change: it can be after some time (async)
      };
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
      let currentGameSessionLength: string = this.mainWindowObject.document.getElementById("currentGameSessionLength").innerHTML;
      document.getElementById("currentGameSessionLength").innerHTML = currentGameSessionLength;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // public parentPortalOpen(){
    //   document.getElementById("parentPortalItems").classList.toggle("show");
    // }

    // //Closes the parent portal, updates locally stored settings, updates remote settings
    // public parentPortalClose(){
    //   window.onclick = async function(event) {
    //     if (!event.target.matches('.parentdd')) {
    //       var elements = document.getElementsByClassName("parentPortalItems");
    //       var i;
    //       for (i = 0; i < elements.length; i++) {
    //         var openDropdown = elements[i];
    //         if (openDropdown.classList.contains('show')) {
    //           openDropdown.classList.remove('show');
    //         }
    //       }
    //     let preferencesData = await Launcher.instance().readFileData(`${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\parentPreferences.json`);
    //     let preferences = JSON.parse(preferencesData);
    //     preferences["cellNum"] = 69;
    //     preferences["timeLimitRule"] = (document.getElementById("timeLimitRule") as HTMLInputElement).value;
    //     preferences["bedTimeRule"] = (document.getElementById("bedTimeRule") as HTMLInputElement).value;
    //     preferences["gameLimitRule"] = (document.getElementById("gameLimitRule") as HTMLInputElement).value;
    //     (document.getElementById("timeLimitToggle") as HTMLFormElement).checked ? preferences["timeLimitToggle"] = true : preferences["timeLimitToggle"] = false;
    //     (document.getElementById("bedTimeToggle") as HTMLFormElement).checked ? preferences["bedTimeToggle"] = true : preferences["bedTimeToggle"] = false;
    //     (document.getElementById("gameLimitToggle") as HTMLFormElement).checked ? preferences["gameLimitToggle"] = true : preferences["gameLimitToggle"] = false;
    //     (document.getElementById("dailyDigestToggle") as HTMLFormElement).checked ? preferences["dailyDigestToggle"] = true : preferences["dailyDigestToggle"] = false;
    //     (document.getElementById("weeklyDigestToggle") as HTMLFormElement).checked ? preferences["weeklyDigestToggle"] = true : preferences["weeklyDigestToggle"] = false;
    //     (document.getElementById("monthyDigestToggle") as HTMLFormElement).checked ? preferences["monthyDigestToggle"] = true : preferences["monthyDigestToggle"] = false;
    //     Launcher.instance().writeFile(JSON.stringify(preferences), `${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\parentPreferences.json`);
        
    //     //Update remote server
    //     // let serverAction = "update-settings";
    //     // let remoteServer = "http://" +  Launcher.instance().remoteAddress + ":5000/" + serverAction;
    //     // var xmlHttp = new XMLHttpRequest();
    //     // xmlHttp.open("POST", remoteServer, true);
    //     // xmlHttp.setRequestHeader('Content-Type', 'application/json');
    //     // xmlHttp.send(JSON.stringify(preferences));

    //     //document.getElementById("test_message").innerHTML = "Message sent(/update-settings): " + JSON.stringify(preferences);  //For debugging
    //     //document.getElementById("test_message").innerHTML = "bedLimitRule: " + JSON.stringify(preferences["bedTimeRule"]);  //For debugging
    //     }
    //   }
    // }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private async collectPreferences(){
      var sendData = {cellNum:"0"};
      sendData["cellNum"] = "69";

      //let remoteAddress = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";
      let serverAction = "get-settings";
      let remoteServer = "http://" +  Launcher.instance().remoteAddress + ":5000/" + serverAction;
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("POST", remoteServer, true);
      xmlHttp.setRequestHeader('Content-Type', 'application/json');
      xmlHttp.send(JSON.stringify(sendData));

      xmlHttp.onreadystatechange = function () {
        if (this.readyState != 4) return;
        if (this.status == 200) {
          var response = (this.responseText); // we get the returned data
          var parsed = JSON.parse(response);
          //document.getElementById("test_message").innerHTML += "Your bedtime is: " + parsed["bedTimeRule"];
          Launcher.instance().bedTime = parsed["bedTimeRule"];
          //document.getElementById("test_message").innerHTML += "its set to: " + Launcher.instance().bedTime;
        }
        // end of state change: it can be after some time (async)
      };
    }

  //Testing function for remote server connections
  private async twilio(){
    let serverAction = "test-sms";  //test-sms
    let remoteServer = "http://" +  Launcher.instance().remoteAddress + ":5000/" + serverAction;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", remoteServer, true ); // false for synchronous request
    xmlHttp.send( null );

    xmlHttp.onreadystatechange = function () {
      if (this.readyState != 4) return;
      if (this.status == 200) {
        var response = (this.responseText); // we get the returned data
        document.getElementById("test_message").innerHTML = "reponse = " + response;
      }
      // end of state change: it can be after some time (async)
    };
  }

  private async readFileData(file_path:string){
    const result = await new Promise(resolve => {
      overwolf.io.readFileContents(
        file_path,
        overwolf.io.enums.eEncoding.UTF8,
        resolve
      );
    }); //returns result["success"] + ", " + result["content"] + ", " +  result["error"]
    //console.log("readFileData()", result["success"] + ", " + result["content"] + ", " +  result["error"]);
    return result["content"];
  }

    //Writes data into a file specified in file_path, returns the result
    private async writeFile(data:string, file_path:string){
      let result = await new Promise((resolve, reject) => {
        overwolf.io.writeFileContents(
          file_path,
          data,
          overwolf.io.enums.eEncoding.UTF8,
          true,
          r => r.success ? resolve(r) : reject(r)
        );
      });
      //console.log('writeFile()', result);
      return result;
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