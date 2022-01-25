
import {
  OWGames,
  OWGameListener,
  OWWindow
} from '@overwolf/overwolf-api-ts';

import { kWindowNames, kGameClassIds } from "../consts";

import RunningGameInfo = overwolf.games.RunningGameInfo;
import AppLaunchTriggeredEvent = overwolf.extensions.AppLaunchTriggeredEvent;


// The background controller holds all of the app's background logic - hence its name. it has
// many possible use cases, for example sharing data between windows, or, in our case,
// managing which window is currently presented to the user. To that end, it holds a dictionary
// of the windows available in the app.
// Our background controller implements the Singleton design pattern, since only one
// instance of it should exist.
class BackgroundController {
  private static _instance: BackgroundController;
  private _windows: Record<string, OWWindow> = {};
  private _gameListener: OWGameListener;
  private mainWindowObject: Window;
  private launcher_message: string;
  private in_game_message: string;
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

  // When running the app, start listening to games' status and decide which window should
  // be launched first, based on whether a supported game is currently running
  public async run() {
    this._gameListener.start();

    const currWindowName = (await this.isSupportedGameRunning())
      ? kWindowNames.inGame
      : kWindowNames.launcher;
    this._windows[currWindowName].restore();

    //displayMessageBox(messageParams, callback)    //Displays a customized popup message prompt.

    this.mainWindowObject = overwolf.windows.getMainWindow()
    this.launcher_message = this.mainWindowObject.document.getElementById("launcher_message").innerHTML; //colect a message from launcher

    this.send_message = "sent to launcher from background";

    //this.mainWindowObject.document.getElementById("background_message").innerHTML = this.send_message;  //send a message


    //collect contents of Messages.txt
    let result = this.readFileData(`${overwolf.io.paths.documents}\\GitHub\\Capstone-repo\\Overwolf-App\\ts\\src\\Messages.txt`);

    //arrange lines into an array object
    var messageObject:string[] = this.buildMessageObject(result);

    this.test_message = messageObject[1];  //Send the second line
    this.mainWindowObject.document.getElementById("test_message").innerHTML = this.test_message;  //update test_message

    let someConditionShaneWants:boolean = true;
    if(someConditionShaneWants){
      this.primary_message = messageObject[0];
      this.mainWindowObject.document.getElementById("primary_message").innerHTML = this.primary_message;
    }
  }

  private readFileData(file_path:string){
    const result = new Promise(resolve => {
      overwolf.io.readFileContents(
        file_path,
        overwolf.io.enums.eEncoding.UTF8,
        resolve
      );
    }); //returns result["success"] + ", " + result["content"] + ", " +  result["error"]
    return result;
  }

    //arrange lines into an array object
    //All information before a ";" character is stored into an entry in the messageObject
  private buildMessageObject(originMessage:string){
    var messageObject:string[] = new Array();
    while(originMessage["content"].indexOf(";") != -1){
      messageObject.push(originMessage["content"].substr(0, originMessage["content"].indexOf(";")));
      originMessage["content"] = originMessage["content"].substr(originMessage["content"].indexOf(";")+1);
    }
    return messageObject;
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

  private toggleWindows(info: RunningGameInfo) {
    if (!info || !this.isSupportedGame(info)) {
      return;
    }

    if (info.isRunning) {
      this._windows[kWindowNames.launcher].close();
      this._windows[kWindowNames.inGame].restore();
    } else {
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
