import {
  OWGames,
  OWGamesEvents,
  OWHotkeys
} from "@overwolf/overwolf-api-ts";

import { AppWindow } from "../AppWindow";
import { kHotkeys, kWindowNames, kGamesFeatures } from "../consts";

import WindowState = overwolf.windows.WindowStateEx;

// The window displayed in-game while a game is running.
// It listens to all info events and to the game events listed in the consts.ts file
// and writes them to the relevant log using <pre> tags.
// The window also sets up Ctrl+F as the minimize/restore hotkey.
// Like the background window, it also implements the Singleton design pattern.
class InGame extends AppWindow {
  private static _instance: InGame;
  private _gameEventsListener: OWGamesEvents;
  private _eventsLog: HTMLElement;
  private _infoLog: HTMLElement;

  private constructor() {
    super(kWindowNames.inGame);

    this._eventsLog = document.getElementById('eventsLog');
    //this._infoLog = document.getElementById('infoLog');

    this.setToggleHotkeyBehavior();
    this.setToggleHotkeyText();

    //intializes the game_data.txt file to be used in dataUpdate()
    let inital_json = {
      "cellNum": 0,
      "kills": 0,
      "deaths": 0,
      "game_time": 0,
      "timeStamp":"0000-00-00:00"
    }
    let stringJson = JSON.stringify(inital_json);
    this.writeFile(stringJson, `${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\game_data.txt`);
  }

  public static instance() {
    if (!this._instance) {
      this._instance = new InGame();
    }
    return this._instance;
  }

  public async run() {
    const gameClassId = await this.getCurrentGameClassId();

    const gameFeatures = kGamesFeatures.get(gameClassId);

    if (gameFeatures && gameFeatures.length) {
      this._gameEventsListener = new OWGamesEvents(
        {
          onInfoUpdates: this.onInfoUpdates.bind(this),
          onNewEvents: this.onNewEvents.bind(this)
        },
        gameFeatures
      );

      this._gameEventsListener.start();
    }
  }

  private onInfoUpdates(info) {
    //this.logLine(this._infoLog, info, false);
  }

  //Highlights some events
  //Sends Matchclock to the html overlay
  //Performs updateData() on Kill and Death events
  private onNewEvents(e) {
    const shouldHighlight = e.events.some(event => {
      switch (event.name) {
         case 'kill':
         case 'death':
        // case 'assist':
        // case 'level':
        case 'matchStart':
        case 'match_start':
        case 'matchEnd':
        case 'match_end':
        return true;
      }
      return false;
    });
    this.logLine(this._eventsLog, e, shouldHighlight);

    if(e.events[0]["name"] == 'match_clock'){
      let time_message:string = e.events[0]["data"];
      this.updateData("time", parseInt(time_message, 10));
    }
    if(e.events[0]["name"] == 'kill'){
      //let kill_data:string = e.events[0]["data"];
      this.updateData("kills", null);
    }
    if(e.events[0]["name"] == 'death'){
      this.updateData("deaths", null);
    }
  }


  //Collects the information written in game_data.txt, builds a javascript object from the data, increments the dataField specified, stringifies the object and writes it back
  private async updateData(dataField:string, time:number){
    let fileData = await this.readFileData(`${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\game_data.txt`);
    document.getElementById("kill_message").innerHTML = fileData;  //for debugging
    
    let jsonData = JSON.parse(fileData);
    if(dataField == "kills"){
      jsonData["kills"]++;
    }
    if(dataField == "deaths"){
      jsonData["deaths"]++;
    }
    if(dataField == "time"){
      jsonData["game_time"] = time;
    }

    let stringified = JSON.stringify(jsonData);
    this.writeFile(stringified, `${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\game_data.txt`);
    document.getElementById("death_message").innerHTML = jsonData["deaths"]; //For debugging
  }


  //Reads the data in file specified in file_path and returns it
  //Sample file_path = `${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\Messages.txt`
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

  // Displays the toggle minimize/restore hotkey in the window header
  private async setToggleHotkeyText() {
    const gameClassId = await this.getCurrentGameClassId();
    const hotkeyText = await OWHotkeys.getHotkeyText(kHotkeys.toggle, gameClassId);
    const hotkeyElem = document.getElementById('hotkey');
    hotkeyElem.textContent = hotkeyText;
  }

  // Sets toggleInGameWindow as the behavior for the Ctrl+F hotkey
  private async setToggleHotkeyBehavior() {
    const toggleInGameWindow = async (
      hotkeyResult: overwolf.settings.hotkeys.OnPressedEvent
    ): Promise<void> => {
      //console.log(`pressed hotkey for ${hotkeyResult.name}`);
      const inGameState = await this.getWindowState();

      if (inGameState.window_state === WindowState.NORMAL ||
        inGameState.window_state === WindowState.MAXIMIZED) {
        this.currWindow.minimize();
      } else if (inGameState.window_state === WindowState.MINIMIZED ||
        inGameState.window_state === WindowState.CLOSED) {
        this.currWindow.restore();
      }
    }
    OWHotkeys.onHotkeyDown(kHotkeys.toggle, toggleInGameWindow);
  }

  // Appends a new line to the specified log
  private logLine(log: HTMLElement, data, highlight) {
    const line = document.createElement('pre');
    line.textContent = JSON.stringify(data);
    if (highlight) {
      line.className = 'highlight';
    }
    // Check if scroll is near bottom
    const shouldAutoScroll =
      log.scrollTop + log.offsetHeight >= log.scrollHeight - 10;

    log.appendChild(line);
    if (shouldAutoScroll) {
      log.scrollTop = log.scrollHeight;
    }
  }

  private async getCurrentGameClassId(): Promise<number | null> {
    const info = await OWGames.getRunningGameInfo();
    return (info && info.isRunning && info.classId) ? info.classId : null;
  }
}

InGame.instance().run();
