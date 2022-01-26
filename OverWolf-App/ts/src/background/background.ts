
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
  private send_message: string;
  private test_message: string;
  private primary_message: string;

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

    //To send a message to the bus which is background.html, first we must get the windowObject
    this.mainWindowObject = overwolf.windows.getMainWindow();

    this.sendMessageToLauncher();
    this.updateSecondaryMessage();
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

    console.log("readFileData()", result["success"] + ", " + result["content"] + ", " +  result["error"]);
    return result;
  }

  //Arrange lines into an array object
  //All information before a ";" character is stored into an entry in the messageObject
  private buildMessageObject(originMessage:Object){
    var messageObject:string[] = new Array();
    while(originMessage["content"].indexOf(";") != -1){
      messageObject.push(originMessage["content"].substr(0, originMessage["content"].indexOf(";")));
      originMessage["content"] = originMessage["content"].substr(originMessage["content"].indexOf(";")+1);
    }
    return messageObject;
  }

  //Sends a random message in Messages.txt to the primary_message bus
  private async sendMessageToLauncher(){
    let result = await this.readFileData(`${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\Messages.txt`);
    let messageObject:string[] = this.buildMessageObject(result);
    let randNum:number = this.pickRandomNumWithinObjectSize(messageObject);

    this.mainWindowObject = overwolf.windows.getMainWindow()
    this.mainWindowObject.document.getElementById("primary_message").innerHTML = messageObject[randNum];
  }

  private async updateSecondaryMessage(){
    let result = await this.readFileData(`${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\kill_data.json`);
    let result_string:string = result["content"] as string;  //Typecasting
    console.log("My error: " + result["error"]);

    if(result["error"] == undefined){
      if(!(result_string.indexOf("count") == -1)){                                      //check if there is a message and that it is formatted as expected
        var sub1:string = result_string.substr(result_string.indexOf("count\": \"")+9); //Erase all characters before the kill count
        var kills:string = sub1.substr(0, sub1.indexOf("\","));                         //Make a substring that is only until the next "
        this.mainWindowObject.document.getElementById("secondary_message").innerHTML = "You got " + kills + " kills!";
      }
    }

    result = await this.readFileData(`${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\death_data.json`);
    result_string = result["content"] as string;  //Typecasting
    console.log("result_string = " + result_string);
    if(result["error"] == undefined){
      if(!(result_string.indexOf("count") == -1)){
        var sub2:string = result_string.substr(result_string.indexOf("count\": \"")+9);
        var deaths:string = sub2.substr(0, sub2.indexOf("\""));
        document.getElementById("secondary_message").innerHTML = "You've died " + deaths + " times";
      }
    }

  }

  private pickRandomNumWithinObjectSize(myObject:Array<string>){
    let min:number = 0;
    let max:any = myObject.length;
    let randomNum:number =  Math.floor(Math.random() * max ) + min;
    return randomNum;
  }

  private async onAppLaunchTriggered(e: AppLaunchTriggeredEvent) {
    console.log('onAppLaunchTriggered():', e);

    if (!e || e.origin.includes('gamelaunchevent')) {
      return;
    }
    
    if (await this.isSupportedGameRunning()) {
      this._windows[kWindowNames.launcher].close();
      this._windows[kWindowNames.inGame].restore();
    } else {
      this._windows[kWindowNames.launcher].restore();
      setTimeout(() => overwolf.windows.bringToFront(kWindowNames.launcher, true, (result) => {}), 3000);
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
    } else {
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
