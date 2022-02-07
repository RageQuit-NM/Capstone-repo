
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

  private constructor() {
    // Populating the background controller's window dictionary
    this._windows[kWindowNames.launcher] = new OWWindow(kWindowNames.launcher);
    this._windows[kWindowNames.inGame] = new OWWindow(kWindowNames.inGame);

    // When a a supported game game is started or is ended, toggle the app's windows
    this._gameListener = new OWGameListener({
      onGameStarted: this.toggleWindows.bind(this),
      onGameEnded: this.toggleWindows.bind(this)
    });

    overwolf.extensions.onAppLaunchTriggered.addListener(
      e => this.onAppLaunchTriggered(e)
    );

    this.hasGameRun = false;
  };

  // Implementing the Singleton design pattern
  public static instance(): BackgroundController {
    if (!BackgroundController._instance) {
      BackgroundController._instance = new BackgroundController();
    }
    return BackgroundController._instance;
  }

  //displayMessageBox(messageParams, callback)    //Displays a customized popup message prompt.

  // When running the app, start listening to games' status and decide which window should
  // be launched first, based on whether a supported game is currently running
  public async run() {
    this._gameListener.start();

    const currWindowName = (await this.isSupportedGameRunning())
      ? kWindowNames.inGame
      : kWindowNames.launcher;
    this._windows[currWindowName].restore();

    this.sendMessageToLauncher();

    if(this.hasGameRun){
      if(this.firstGameRunTime == null){
        this.firstGameRunTime = new Date(); //set the time for first game run time
      }
    }
  }

  //Arrange lines into an array object
  //All information before a ";" character is stored into an entry in the messageObject
  private buildMessageObject(originMessage:string){
    var messageObject:string[] = new Array();
    while(originMessage.indexOf(";") != -1){
      messageObject.push(originMessage.substr(0, originMessage.indexOf(";")));
      originMessage = originMessage.substr(originMessage.indexOf(";")+1);
    }
    return messageObject;
  }

  //Sends a random message in Messages.txt to the primary_message bus
  private async sendMessageToLauncher(){
    let result = await this.readFileData(`${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\Messages.txt`);
    let messageObject:string[] = this.buildMessageObject(result);
    let randNum:number = this._pickRandomNumWithinObjectSize(messageObject);

    this.mainWindowObject = overwolf.windows.getMainWindow();
    //if game has run send a message from Messages.txt else just a welcome message
    if(this.hasGameRun){
      this.mainWindowObject.document.getElementById("primary_message").innerHTML = messageObject[randNum];
      this.mainWindowObject.document.getElementById("time_message").innerHTML = this.firstGameRunTime.toLocaleTimeString();
    } else{
      this.mainWindowObject.document.getElementById("primary_message").innerHTML = "Welcome back!";
    }
  }

  private async sendGameInfoToRemote(){
    let fileData = await this.readFileData(`${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\game_data.txt`);
    let objectData = JSON.parse(fileData);
    document.getElementById("kill_message").innerHTML = fileData;  //for debugging

    let serverAction = "game_end";  //
    let remoteServer = "http://ec2-35-182-68-182.ca-central-1.compute.amazonaws.com:5000/" + serverAction;

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", remoteServer, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify({
      value: objectData
    }));

    xmlHttp.onreadystatechange = function () {
      if (this.readyState != 4) return;
      if (this.status == 200) {
        var response = (this.responseText); // we get the returned data
        document.getElementById("test_message").innerHTML = "reponse from /game_end = " + response;
      }
      // end of state change: it can be after some time (async)
    };
  }

  //Takes an array object and returns a number between 0 and length
  private _pickRandomNumWithinObjectSize(myObject:Array<string>){
    let min:number = 0;
    let max:any = myObject.length;
    let randomNum:number =  Math.floor(Math.random() * max ) + min;
    return randomNum;
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


  private async onAppLaunchTriggered(e: AppLaunchTriggeredEvent) {
    //console.log('onAppLaunchTriggered():', e);
    if (!e || e.origin.includes('gamelaunchevent')) {
      return;
    }
    
    if (await this.isSupportedGameRunning()) {
      this._windows[kWindowNames.launcher].close();
      this._windows[kWindowNames.inGame].restore();
    } else {
      this._windows[kWindowNames.launcher].restore();
      //setTimeout(() => overwolf.windows.bringToFront(kWindowNames.launcher, true, (result) => {}), 3000); //Dont need to set a timeout for when the app launches
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
    //console.log("check is supported, info: " + info);
    return kGameClassIds.includes(info.classId);
  }
}

BackgroundController.instance().run();
