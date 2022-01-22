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
    private background_message: HTMLElement;
    private launcher_message: HTMLElement;
    private winLoss: number; // between 0 and 3 inclusive
    private lastThreeGames: overwolf.games.GetGameInfoResult; 
  
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
      this.mainWindowObject = overwolf.windows.getMainWindow(); //Gets the HTML Object of the main window for messaging
      // //Its probably possible for some of the games being returned not to be league games
      // overwolf.games.getRecentlyPlayedGames(3, (Result) => {
      //   this.lastThreeGames = Result;
      //   console.log("callback: " + JSON.stringify(this.lastThreeGames));
      //   let game_info_message: string = "Game information: " + JSON.stringify(this.lastThreeGames);
      //   document.getElementById("threeGame_message").innerHTML = game_info_message;
      // });
      

      //collect time message
      let time_message: string;
      time_message = this.mainWindowObject.document.getElementById("time_message").innerHTML;
      document.getElementById("timePlayed").innerHTML = time_message;

      let test_message: string;
      test_message = this.mainWindowObject.document.getElementById("test_message").innerHTML;
      document.getElementById("testMessage").innerHTML = test_message;

      let primary_message: string;
      primary_message = this.mainWindowObject.document.getElementById("primary_message").innerHTML;
      document.getElementById("primaryMessage").innerHTML = primary_message;


      // this.message = this.mainWindowObject.document.getElementById("test_message").innerHTML;
      // document.getElementById("test_message").innerHTML = this.message;

      // if(Number(this.message) > 10){
      //   //console.log(">10s")
      //   document.getElementById("detailed_message").innerHTML = "You have played for over 10s!"
      //   document.getElementById("broad_message").innerHTML = "Get back in the game!"
      // }
      // if(Number(this.message) > 60 && Number(this.message) < 3600){
      //   console.log(">60s")
      //   document.getElementById("detailed_message").innerHTML = "You have played for over 1 minute!"
      //   document.getElementById("broad_message").innerHTML = "Get back in the game!"
      // }
      // if(Number(this.message) > 3600){
      //   console.log(">3600s")
      //   document.getElementById("detailed_message").innerHTML = "You have played for over 1 hour! \n You should get a glass of water!"
      //   document.getElementById("broad_message").innerHTML = "Good Game!"
      // }

    }

}  
Launcher.instance().run();