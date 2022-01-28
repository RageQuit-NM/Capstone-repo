import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../consts";

class Launcher extends AppWindow {
    private static _instance: Launcher;
    //private _gameEventsListener: OWGamesEvents;
    private mainWindowObject: Window;
  
    private constructor() {
      super(kWindowNames.launcher);
      //this.setToggleHotkeyBehavior();
      //this.setToggleHotkeyText();
      let smiley = document.getElementById("smiley");

      //Had an issue with contrudctor running 3 times, make it so only 1 listener is set on the elements
      if (smiley.getAttribute('listener') != 'true') {
        smiley.setAttribute('listener', 'true');
        smiley.addEventListener("click", this.clickSmiley);

        //i added these in a check on the smiley, should prob check each one before applying
        document.getElementById("straight").addEventListener("click", this.clickSmiley);
        document.getElementById("sad").addEventListener("click", this.clickSmiley);
      }

      //Hide messages within content (so only smileys are showing)
      document.getElementById("content").style.display = "none";
      document.getElementById("broad_message").style.display = "none";
   }
  
    public static instance() {
      if (!this._instance) {
        this._instance = new Launcher();
      }
      return this._instance;
    }
    
    //collect all messages from bus to be shown on the launcher page
    public async run() {
      //this.setContent(); 
    }

    private async clickSmiley(){
      document.getElementById("smilies").style.display = "none";
      document.getElementById("smiley_title").style.display = "none";

      document.getElementById("content").style.display = "inherit";
      document.getElementById("broad_message").style.display = "inherit";
      Launcher.instance().setContent();     //?? idk it should be this.setContent() but that doesnt work so we access it from the Launcher class
    }

    //Sets all message content from the bus
    public setContent(){
      this.mainWindowObject = overwolf.windows.getMainWindow(); //Gets the HTML Object of the main window for messaging

      let primary_message: string = this.mainWindowObject.document.getElementById("primary_message").innerHTML; // collect the primary_message
      document.getElementById("primary_message").innerHTML = primary_message;                                   //Update HTML document

      let secondary_message: string = this.mainWindowObject.document.getElementById("secondary_message").innerHTML;
      document.getElementById("secondary_message").innerHTML = secondary_message;
      
      let time_message: string = this.mainWindowObject.document.getElementById("time_message").innerHTML;
      document.getElementById("time_played").innerHTML = time_message;

      let test_message: string = this.mainWindowObject.document.getElementById("test_message").innerHTML;
      document.getElementById("test_message").innerHTML = test_message;
    }
}  
Launcher.instance().run();