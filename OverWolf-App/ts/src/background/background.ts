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
  private mainWindowObject: Window;
  private hasGameRun:boolean;
  private firstGameRunTime: Date = null;
  private remoteAddress: string = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";


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
    this._gameListener.start();

    const currWindowName = (await this.isSupportedGameRunning())
      ? kWindowNames.inGame
      : kWindowNames.launcher;
    this._windows[currWindowName].restore();

    this.sendMessageToLauncher();
  }
 
  //----------------------------------------------------------implement all messages for kid----------------||
  //Updates primary_message on bus
  private async sendMessageToLauncher(){
    let negativeKD:boolean = false;//--------------------Change to a single variable------------------------||
    let positiveKD:boolean = false;//-----------------------------------------------------------------------||


    //If game hasent run we will show Welcome Back too!! refactor for this
    let fileData = await this.readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\game_data.json`);
    if (fileData == null){
      //document.getElementById("test_message").innerHTML += "Couldnt collect info from game_data.json (sendMessageToLauncher)";
      document.getElementById("primary_message").innerHTML = "welcome (no game_data.json set)";
      overwolf.windows.getMainWindow().document.getElementById("test_message2").innerHTML += "No data";
      return;
    }
    //let fileData = await this.readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\Log\\Apps\\RageQuit.NM\\game_data.json`);
    let killDeath = JSON.parse(fileData);

    if(killDeath["kills"] > killDeath["deaths"]){
      positiveKD = true;
    }
    if(killDeath["deaths"] > killDeath["kills"]){
      negativeKD = true;
    }

    //let randNum:number = this._pickRandomNumWithinObjectSize(messageObject);

    // let result = await this.readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\messages.txt`);
    // if (result == null){
    //   document.getElementById("test_message").innerHTML += "Couldnt collect info from Messages.txt (sendMessageToLauncher)";
    //   return;
    // }
    // let messageObject:string[] = this._buildMessageObject(result);
   
    let messageID = "welcomeback";
    //if game has run send a message from Messages.txt else just a welcome message
    if(this.hasGameRun){
      overwolf.windows.getMainWindow().document.getElementById("test_message2").innerHTML += "game has run..."
      //this.mainWindowObject.document.getElementById("primary_message").innerHTML = messageObject[1];  //Should be randNum
      messageID = "homework";

      // let endTime = new Date()
      // let seconds = Math.floor((endTime.getTime() - this.firstGameRunTime.getTime()) / 1000);
      // let minutes = Math.floor(seconds / 60);
      // this.mainWindowObject.document.getElementById("test_message").innerHTML += (seconds as unknown as string) + " seconds."; //update the time played

      if(positiveKD){
        //this.mainWindowObject.document.getElementById("primary_message").innerHTML = messageObject[3];
        messageID = "doinggreat";
      }
      if(negativeKD){
        //this.mainWindowObject.document.getElementById("primary_message").innerHTML = messageObject[6];
        messageID = "takebreak";
      }
    } else {
      //this.mainWindowObject.document.getElementById("primary_message").innerHTML = "Welcome back!";
      messageID = "welcomeback";
      overwolf.windows.getMainWindow().document.getElementById("test_message2").innerHTML += "Game has not run"
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
        //Launcher.instance().bedTime = parsed["bedTimeRule"]; //---------------------------Set all of parsed not only bedTimeRule----------------||
        //document.getElementById("test_message3").innerHTML += " message response: " + this.responseText;
        overwolf.windows.getMainWindow().document.getElementById("primary_message").innerHTML = parsed["body"];
      }
    };
  }


  //Called when a games ends. Sends all data in game_data.json, along with a cellnum and a timeStamp to /upload-game-data
  private async sendGameInfoToRemote(){
    let fileData = await this.readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\game_data.json`);
    if (fileData == null){
      document.getElementById("test_message").innerHTML += "Couldnt collect info from game_data.json (sendGameInfoToRemote)";
      return;
    }
    let gameData = JSON.parse(fileData);

    let cellNumUnparsed = await BackgroundController.instance().readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
    let cellNum = JSON.parse(cellNumUnparsed)["cellNum"];
    gameData["cellNum"] = cellNum;
    gameData["timeStampTime"] = new Date().toLocaleTimeString();
    gameData["timeStampDay"] = new Date().toDateString();

    let serverAction = "upload-game-data";  //
    let remoteServer = "http://" +  this.remoteAddress + ":5000/" + serverAction;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", remoteServer, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify(gameData));

    this.mainWindowObject = overwolf.windows.getMainWindow();
    this.mainWindowObject.document.getElementById("test_message3").innerHTML += "Game end message(/upload-game-data): " + JSON.stringify(gameData) + "cellNum is " + cellNum;  //For debugging

    xmlHttp.onreadystatechange = await function () {
      if (this.readyState != 4) return;
      if (this.status == 200) {
        var response = (this.responseText); // we get the returned data
        //document.getElementById("test_message").innerHTML += "reponse from /upload-game-data = " + response;
      }
      // end of state change: it can be after some time (async)
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
      this._windows[kWindowNames.inGame].restore();
      this.hasGameRun = true;
      if(this.firstGameRunTime == null){
        this.firstGameRunTime = new Date(); //set the time for first game run time
      }
    } else {
      //A game has just ended
      this.sendGameInfoToRemote();
      this.sendMessageToLauncher();
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


  //Arrange lines into an array object
  //All information before a ";" character is stored into an entry in the messageObject
  private _buildMessageObject(originMessage:string){
    var messageObject:string[] = new Array();
    while(originMessage.indexOf(";") != -1){
      messageObject.push(originMessage.substr(0, originMessage.indexOf(";")));
      originMessage = originMessage.substr(originMessage.indexOf(";")+1);
    }
    return messageObject;
  }


  //Takes an array object and returns a number between 0 and length
  private _pickRandomNumWithinObjectSize(myObject:Array<string>){
    let min:number = 0;
    let max:any = myObject.length;
    let randomNum:number =  Math.floor(Math.random() * max ) + min;
    return randomNum;
  }
}
BackgroundController.instance().run();
