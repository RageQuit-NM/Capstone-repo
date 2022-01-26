import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../consts";

// The desktop window is the window displayed while game is not running.
// In our case, our desktop window has no logic - it only displays static data.
// Therefore, only the generic AppWindow class is called.
//new AppWindow(kWindowNames.desktop);

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
  
    public async run() {
      this.mainWindowObject = overwolf.windows.getMainWindow(); //Gets the HTML Object of the main window for messaging
      
      //collect time message
      let time_message: string;
      time_message = this.mainWindowObject.document.getElementById("time_message").innerHTML;
      document.getElementById("time_played").innerHTML = time_message;

      let test_message: string;
      test_message = this.mainWindowObject.document.getElementById("test_message").innerHTML;
      document.getElementById("test_message").innerHTML = test_message;

      let primary_message: string;
      primary_message = this.mainWindowObject.document.getElementById("primary_message").innerHTML;
      document.getElementById("primary_message").innerHTML = primary_message;
    }

}  
Launcher.instance().run();