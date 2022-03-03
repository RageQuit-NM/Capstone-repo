import {
  OWGames,
  OWGamesEvents,
  OWHotkeys
} from "@overwolf/overwolf-api-ts";
import { AppWindow } from "../AppWindow";
import { kHotkeys, kWindowNames, kGamesFeatures } from "../consts";
import WindowState = overwolf.windows.WindowStateEx;


class InGame extends AppWindow {
  private static _instance: InGame;
  private _gameEventsListener: OWGamesEvents;
  private _eventsLog: HTMLElement;

  private constructor() {
    super(kWindowNames.inGame);

    //intializes the game_data.txt file to be used in dataUpdate()
    let inital_json = {
      "cellNum": 0,
      "kills": 0,
      "deaths": 0,
      "game_time": 0,
      "timeStampTime":"NULL",
      "timeStampDay":"NULL"
    }
    let stringJson = JSON.stringify(inital_json);
    this.writeFile(stringJson, `${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\game_data.txt`);
  }

  //Singleton design pattern
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


  //Performs updateData() on Kill and Death events, collects time_clock
  private onNewEvents(e) {
    //Events -> kill death assist level matchStart match_start matchEnd match_end
    if(e.events[0]["name"] == 'match_clock'){
      let time_message:string = e.events[0]["data"];
      this.updateData("time", parseInt(time_message, 10));
    }
    if(e.events[0]["name"] == 'kill'){
      this.updateData("kills", null);
    }
    if(e.events[0]["name"] == 'death'){
      this.updateData("deaths", null);
    }
  }


  //Updates game_data.txt
  private async updateData(dataField:string, time:number){
    let fileData = await this.readFileData(`${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\game_data.txt`);
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
    //document.getElementById("death_message").innerHTML = jsonData["deaths"]; //For debugging
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
    });
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
    return result;
  }


  private onInfoUpdates(info) {
    //do nothing
  }

  
  private async getCurrentGameClassId(): Promise<number | null> {
    const info = await OWGames.getRunningGameInfo();
    return (info && info.isRunning && info.classId) ? info.classId : null;
  }
}

InGame.instance().run();
