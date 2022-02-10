import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../consts";

class Launcher extends AppWindow {
    private static _instance: Launcher;
    //private _gameEventsListener: OWGamesEvents;
    private mainWindowObject: Window;
  
    private constructor() {
      super(kWindowNames.launcher);
      //Constructor inexplicably runs 3 times, make it so only 1 listener is set for each element. This seems to run when the dismiss button is hit too
      if (document.getElementById("smiley").getAttribute('listener') != 'true') {
        document.getElementById("smiley").setAttribute('listener', 'true');

        //Adds event listeners
        // document.getElementById("smiley").addEventListener("click", this.clickSmiley);
        // document.getElementById("straight").addEventListener("click", this.clickSmiley);
        // document.getElementById("sad").addEventListener("click", this.clickSmiley);
        document.getElementById("parentPortalButton").addEventListener("click", this.parentPortalOpen); 
        document.getElementById("message_send").addEventListener("click", this.twilio);

        this.buildPreferences();
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
      this.parentPortalClose();
    }
 

    private async twilio(){
      let objectData = "My message to shane from /game_end";
  
      let serverAction = "game_end";  //test-sms
      let remoteServer = "http://ec2-35-182-68-182.ca-central-1.compute.amazonaws.com:5000/" + serverAction;
  
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("POST", remoteServer, true);
      xmlHttp.setRequestHeader('Content-Type', 'application/json');
      xmlHttp.send(JSON.stringify({
        value: objectData
      }));

      // var xmlHttp = new XMLHttpRequest();
      // xmlHttp.open( "GET", remoteServer, true ); // false for synchronous request
      // xmlHttp.send( null );

      xmlHttp.onreadystatechange = function () {
        if (this.readyState != 4) return;
        if (this.status == 200) {
          var response = (this.responseText); // we get the returned data
          document.getElementById("test_message").innerHTML = "reponse = " + response;
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
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public parentPortalOpen(){
      document.getElementById("parentPortalItems").classList.toggle("show");
    }

    public parentPortalClose(){
      window.onclick = async function(event) {
        if (!event.target.matches('.parentdd')) {
          var elements = document.getElementsByClassName("parentPortalItems");
          var i;
          for (i = 0; i < elements.length; i++) {
            var openDropdown = elements[i];
            if (openDropdown.classList.contains('show')) {
              openDropdown.classList.remove('show');
            }
          }
        }
        let preferencesData = await Launcher.instance().readFileData(`${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\parentPreferences.json`);
        let preferences = JSON.parse(preferencesData);
        if ((document.getElementById("overTimeToggle") as HTMLFormElement).checked) {
          preferences["overTimeToggle"] = true;
        } else {
          preferences["overTimeToggle"] = false;
        }
        Launcher.instance().writeFile(JSON.stringify(preferences), `${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\parentPreferences.json`);
      }
    }

    private async buildPreferences(){
      let preferencesData = await Launcher.instance().readFileData(`${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\parentPreferences.json`);
      let preferences = JSON.parse(preferencesData);
      if (preferences["overTimeToggle"]) {
        (document.getElementById("overTimeToggle") as HTMLFormElement).checked = true;
      } else {
        (document.getElementById("overTimeToggle") as HTMLFormElement).checked = false;
      }
    }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

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