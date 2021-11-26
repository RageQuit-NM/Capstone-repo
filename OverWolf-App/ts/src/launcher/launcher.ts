import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../consts";

// The desktop window is the window displayed while game is not running.
// In our case, our desktop window has no logic - it only displays static data.
// Therefore, only the generic AppWindow class is called.
//new AppWindow(kWindowNames.desktop);

class Launcher extends AppWindow {
    private static _instance: Launcher;
    //private _gameEventsListener: OWGamesEvents;
    private htmlObject: Window;
    private background_message: HTMLElement;
    private launcher_message: HTMLElement;
    private message: string;
  
    private constructor() {
      super(kWindowNames.launcher);
  
      this.background_message = document.getElementById('background_message');
      this.launcher_message = document.getElementById('launcher_message');
  
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
      this.htmlObject = overwolf.windows.getMainWindow();

      //update from in_game
      this.message = this.htmlObject.document.getElementById("in_game_message").innerHTML;
      //console.log(this.message)
      document.getElementById("game_time").innerHTML = this.message;

      // this.message = this.htmlObject.document.getElementById("test_message").innerHTML;
      // document.getElementById("test_message").innerHTML = this.message;

      if(Number(this.message) > 10){
        //console.log(">10s")
        document.getElementById("detailed_message").innerHTML = "You have played for over 10s!"
      }
    }

}  
Launcher.instance().run();
