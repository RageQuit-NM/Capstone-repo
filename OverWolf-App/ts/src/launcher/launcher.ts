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
    }
  
    public static instance() {
      if (!this._instance) {
        this._instance = new Launcher();
      }
      return this._instance;
    }
    
    //collect all messages from bus to be shown on the launcher page
    public async run() {
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