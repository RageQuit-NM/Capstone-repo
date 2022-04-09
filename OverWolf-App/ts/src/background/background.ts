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
  //private hasGameRun:boolean;
  //private firstGameRunTime: Date = null;
  public messageInterval:number;
  // private remoteAddress: string = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";
  private remoteAddress: string = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";


  private constructor() {
    // Populating the background controller's window dictionary
    this._windows[kWindowNames.launcher] = new OWWindow(kWindowNames.launcher);
    this._windows[kWindowNames.inGame] = new OWWindow(kWindowNames.inGame);
    //this.hasGameRun = false;
    
    // When a a supported game game is started or is ended, toggle the app's windows
    this._gameListener = new OWGameListener({
      onGameStarted: this.toggleWindows.bind(this),
      onGameEnded: this.toggleWindows.bind(this)
    });

    overwolf.extensions.onAppLaunchTriggered.addListener(
      e => this.onAppLaunchTriggered(e)
    );

    var attributes = document.getElementById('attributes');
    var observer = new MutationObserver(function(){
        if(attributes.getAttribute('cellNumSet') == 'true'){
          BackgroundController.instance().sendMessageToLauncher();
          if (BackgroundController.instance().messageInterval == null){
            BackgroundController.instance().messageInterval = setInterval(BackgroundController.instance().sendMessageToLauncher, 1000*5);
          }
        }
    });
    observer.observe(attributes, { attributes: true, childList: true });
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
      document.getElementById("attributes").setAttribute('cellNumSet', await BackgroundController.instance().checkCellNum());
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
    if(document.getElementById("attributes").getAttribute('cellNumSet') == "true"){
      console.log("sending message with cellNumSet=" + document.getElementById("attributes").getAttribute('cellNumSet'));
      let cellNumString = await BackgroundController.instance().readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);

      let serverAction = "get-message";
      let remoteServer = "https://" +  BackgroundController.instance().remoteAddress + ":5001/" + serverAction;
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("POST", remoteServer, true);
      xmlHttp.setRequestHeader('Content-Type', 'application/json');
      xmlHttp.send(cellNumString);
      console.log("sending: " + cellNumString + " to " + remoteServer);

      xmlHttp.onreadystatechange = function () {
        if (this.readyState != 4) return;
        if (this.status == 200) {
          var parsed = JSON.parse(this.responseText);
          console.log(this.responseText);
          console.log(parsed["dismissButtonMessage"]);
          document.getElementById("primary_message").innerHTML = parsed["body"];
          document.getElementById("dismiss_message").innerHTML = parsed["dismissButtonMessage"];
        }
      };
    }
  }


  //Called when a games ends. Sends all data in game_data.json, along with a cellnum and a timeStamp to /upload-game-data
  private async sendGameInfoToRemote(){
    //console.log("Sending Game info to remote");
    let fileData = await BackgroundController.instance().readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\game_data.json`);
    if (fileData == null){
      document.getElementById("test_message").innerHTML += "Couldnt collect info from game_data.json (sendGameInfoToRemote)";
      return;
    }
    let gameData = JSON.parse(fileData);

    let result = await BackgroundController.instance().readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
    if(result == null){
      console.log("setParentPrefences(); cell num not set");
      return;
    }

    let cellNumUnparsed = await BackgroundController.instance().readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
    let cellNum = JSON.parse(cellNumUnparsed)["cellNum"];
    gameData["cellNum"] = cellNum;
    gameData["timeStamp"] = new Date().toLocaleString('en-CA', {hour12:false});

    let serverAction = "upload-game-data";  
    let remoteServer = "https://" +  BackgroundController.instance().remoteAddress + ":5001/" + serverAction;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", remoteServer, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify(gameData));
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
      //clearInterval(this.messageInterval);
      this._windows[kWindowNames.inGame].restore();
    } else {
      this._windows[kWindowNames.launcher].restore();
      //this.messageInterval = setInterval(this.sendMessageToLauncher, 1000*60);
      setTimeout(() => overwolf.windows.bringToFront(kWindowNames.launcher, true, (result) => {}), 10000); //So app layers over the league launcher
      setTimeout(() => overwolf.windows.bringToFront(kWindowNames.launcher, true, (result) => {}), 12000);
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
      //clearInterval(this.messageInterval);
      this._windows[kWindowNames.inGame].restore();
      //this.hasGameRun = true;
    } else {
      //A game has just ended
      //console.log("game has ended. Primary is: " +  document.getElementById("primary_message").innerHTML);
      this.sendGameInfoToRemote();
      //this.messageInterval = setInterval(this.sendMessageToLauncher, 1000*60);
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
