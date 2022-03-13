import {
  OWGames, OWGameListener, OWWindow
} from '@overwolf/overwolf-api-ts';
import { kWindowNames, kGameClassIds } from "../consts";
import RunningGameInfo = overwolf.games.RunningGameInfo;
import AppLaunchTriggeredEvent = overwolf.extensions.AppLaunchTriggeredEvent;

//The background controller manages all of the logic used in the background of our application
class BackgroundController {
  private static _instance: BackgroundController;
  private _windows: Record<string, OWWindow> = {};
  private _gameListener: OWGameListener;
  private hasGameRun:boolean;
  //private firstGameRunTime: Date = null;
  private remoteAddress: string = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";
  public parentPreferenes: object;


  private constructor() {
    // Populating the background controller's window dictionary
    this._windows[kWindowNames.launcher] = new OWWindow(kWindowNames.launcher);
    this._windows[kWindowNames.inGame] = new OWWindow(kWindowNames.inGame);
    this.hasGameRun = false;
    
    // When a a supported game game is started or is ended, toggle the app's windows
    this._gameListener = new OWGameListener({
      onGameStarted: this.toggleWindows.bind(this),
      onGameEnded: this.toggleWindows.bind(this)
    });

    overwolf.extensions.onAppLaunchTriggered.addListener(
      e => this.onAppLaunchTriggered(e)
    );
  };


  //Singleton design pattern
  public static instance(): BackgroundController {
    if (!BackgroundController._instance) {
      BackgroundController._instance = new BackgroundController();
    }
    return BackgroundController._instance;
  }


  // When running the app, start listening to games' status and decide which window should
  // be launched first, based on whether a supported game is currently running
  public async run() {
    if(document.getElementById("attributes").getAttribute('firstCellCheck') != 'true'){
      document.getElementById("attributes").setAttribute('firstCellCheck', 'true');
      document.getElementById("isCellNumSet").innerHTML = await BackgroundController.instance().checkCellNum();
     // console.log("isCellNumSet: " +  document.getElementById("isCellNumSet").innerHTML);
    }

    this._gameListener.start();
    const currWindowName = (await this.isSupportedGameRunning())
      ? kWindowNames.inGame
      : kWindowNames.launcher;
    this._windows[currWindowName].restore();

    this.sendMessageToLauncher();
  }

  public async checkCellNum(){
    let cellNum = await BackgroundController.instance().readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`)
    if (cellNum == null){
      return 'false';
    }else{
      return 'true';
    }
  }
 
  //----------------------------------------------------------implement all messages for kid----------------||
  //Updates primary_message on bus
  private async sendMessageToLauncher(){
    //console.log("sendMessageToLauncher(). Primary is: " +  document.getElementById("primary_message").innerHTML);
    let messageID = "welcomeback";
    if(this.hasGameRun){
      document.getElementById("test_message2").innerHTML += "game has run..."
      messageID = "homework"; //if the player did not have a positive or negative KD deafault to homework

      let fileData = await this.readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\game_data.json`);
      if (fileData == null){
        document.getElementById("test_message2").innerHTML += "No data stored in game_data.json. This should never occur.";
        return;
      }
      let killDeath = JSON.parse(fileData);
      if(killDeath["kills"] > killDeath["deaths"]){
        messageID = "doinggreat"; //positiveKD
      }
      if(killDeath["deaths"] > killDeath["kills"]){
        messageID = "takebreak";  //negativeKD
      }
    }

    let serverAction = "get-message";
    let remoteServer = "http://" +  this.remoteAddress + ":5000/" + serverAction;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", remoteServer, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify({"messageID":messageID}));

    xmlHttp.onreadystatechange = function () {
      if (this.readyState != 4) return;
      if (this.status == 200) {
        var parsed = JSON.parse(this.responseText);
        document.getElementById("primary_message").innerHTML = parsed["body"];
      }
    };
  }


  //Called when a games ends. Sends all data in game_data.json, along with a cellnum and a timeStamp to /upload-game-data
  private async sendGameInfoToRemote(){
    //console.log("Sending Game info to remote");
    let fileData = await this.readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\game_data.json`);
    if (fileData == null){
      document.getElementById("test_message").innerHTML += "Couldnt collect info from game_data.json (sendGameInfoToRemote)";
      return;
    }
    let gameData = JSON.parse(fileData);

    let result = await this.readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
    if(result == null){
      console.log("setParentPrefences(); cell num not set");
      return;
    }
    var sendData = {cellNum:JSON.parse(result)["cellNum"]};

    let serverActionPreferences = "get-settings";
    let remoteServerPreferences = "http://" +  this.remoteAddress + ":5000/" + serverActionPreferences;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", remoteServerPreferences, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify(sendData));

    xmlHttp.onreadystatechange = async function () {
      if (this.readyState != 4) return;
      if (this.status == 200) {
        var parsed = JSON.parse(this.responseText);
        BackgroundController.instance().parentPreferenes = parsed;
        console.log(JSON.stringify(parsed));

        let cellNumUnparsed = await BackgroundController.instance().readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
        let cellNum = JSON.parse(cellNumUnparsed)["cellNum"];
        gameData["cellNum"] = cellNum;
        gameData["timeStampTime"] = new Date().toLocaleTimeString();
        gameData["timeStampDay"] = new Date().toDateString();

        if(BackgroundController.instance().parentPreferenes["bedTimeRule"] == null){
          gameData["bedTimeViolated"] = false; //No bedtime set
        }else{
          let date = new Date();
          let hours = date.getHours();
          let minutes = date.getMinutes();
          let bedtimeHours = parseInt(BackgroundController.instance().parentPreferenes["bedTimeRule"]);
          let bedtimeMinutes = parseInt(BackgroundController.instance().parentPreferenes["bedTimeRule"].substring(3, 5))

          let hourDiff = bedtimeHours - hours;
          let minuteDiff = bedtimeMinutes - minutes;
          let diff = (hourDiff*60) + minuteDiff;


          let bedTimeViolated:boolean;
          (diff < -5) ? bedTimeViolated = true : bedTimeViolated = false;
          gameData["bedTimeViolated"] = bedTimeViolated;
        }


        let serverAction = "upload-game-data";  //
        let remoteServer = "http://" +  BackgroundController.instance().remoteAddress + ":5000/" + serverAction;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", remoteServer, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.send(JSON.stringify(gameData));
      }
    };
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


  private async onAppLaunchTriggered(e: AppLaunchTriggeredEvent) {
    if (!e || e.origin.includes('gamelaunchevent')) {
      return;
    }
    
    if (await this.isSupportedGameRunning()) {
      this._windows[kWindowNames.launcher].close();
      document.getElementById("attributes").setAttribute('listener', 'false');
      this._windows[kWindowNames.inGame].restore();
    } else {
      this._windows[kWindowNames.launcher].restore();
      setTimeout(() => overwolf.windows.bringToFront(kWindowNames.launcher, true, (result) => {}), 3000); //So app layers over the league launcher
      this._windows[kWindowNames.inGame].close();
    }
  }


  //This is triggered when a game starts and ends
  private toggleWindows(info: RunningGameInfo) {
    if (!info || !this.isSupportedGame(info)) {
      return;
    }

    if (info.isRunning) {
      this._windows[kWindowNames.launcher].close();
      document.getElementById("attributes").setAttribute('listener', 'false');
      this._windows[kWindowNames.inGame].restore();
      this.hasGameRun = true;
    } else {
      //A game has just ended
      //console.log("game has ended. Primary is: " +  document.getElementById("primary_message").innerHTML);
      this.sendGameInfoToRemote();
      //this.sendMessageToLauncher();
      //console.log("Finished updating message from launcher. Primary is: " +  document.getElementById("primary_message").innerHTML);
      this._windows[kWindowNames.launcher].restore();
      setTimeout(() => overwolf.windows.bringToFront(kWindowNames.launcher, true, (result) => {}), 1500); //Brings the launcher window infront of the game launcher after 1.5s
      this._windows[kWindowNames.inGame].close();
    }
  }


  private async isSupportedGameRunning(): Promise<boolean> {
    const info = await OWGames.getRunningGameInfo();
    return info && info.isRunning && this.isSupportedGame(info);
  }


  // Identify whether the RunningGameInfo object we have references a supported game
  private isSupportedGame(info: RunningGameInfo) {
    return kGameClassIds.includes(info.classId);
  }
}
BackgroundController.instance().run();
