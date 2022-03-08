import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../consts";

class Launcher extends AppWindow {
    private static _instance: Launcher;
    private remoteAddress: string = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com"; //Move to the parent class, all app windows need this remote address
    //public bedTime: string;
    public parentPreferenes;  //timeLimitRule bedTimeRule gameLimitRule
  

    private constructor() {
      super(kWindowNames.launcher);
      //Constructor runs multiple times, makes it so it only runs once.
      if(overwolf.windows.getMainWindow().document.getElementById("attributes").getAttribute('listener') != 'true'){
        overwolf.windows.getMainWindow().document.getElementById("attributes").setAttribute('listener', 'true');
       
        (document.getElementById("parent_portal_link") as HTMLAnchorElement).href="http://" + this.remoteAddress + ":5000/parentPortal";
        // document.getElementById("cellInput").addEventListener("change", this.testFunction);
        // document.getElementById("poo").addEventListener("click", this.poo);

        this.collectPreferences();
        this.setContent();

        setInterval(this.checkBedtime, 1000*2);
        setInterval(this.collectPreferences, 1000*2);
      }
    }
    

    //Singleton design pattern
    public static instance() {
      if (!this._instance) {
        this._instance = new Launcher();
      }
      return this._instance;
    }
    

    //Called once to build the class
    public async run() {
      //this.testFunction();
    }
    // public async testFunction(){
    //   //let myData = {cellNum: '5551234'}
    //   //document.getElementById("test_message3").innerHTML += `${overwolf.io.paths.localAppData}\\Overwolf\\Log\\Apps\\RageQuit.NM\\game_data.json`;
    //   let myData = {cellNum: (document.getElementById("cellInput") as HTMLInputElement).value}
      
    //   Launcher.instance()._writeFile(JSON.stringify(myData),  `${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
    // }
    // public async poo(){
    //   let result = await Launcher.instance()._readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);

    //   let cellNum = JSON.parse(result)["cellNum"];
    //   var sendData = {"cellNum": cellNum, bedtime: "30"};
    //   document.getElementById("test_message").innerHTML += "cellnum " + cellNum + "you wrote: " + sendData["cellNum"] + "bedtime si " + sendData["bedtime"];
    // }


    //Check if bedtime rule is violated on an interval, display appropriate message, notify parent.
    public async checkBedtime(){
      //if(Launcher.instance().bedTime != null){
      if(Launcher.instance().parentPreferenes["bedTimeRule"] != null){
        //---------------------------------------------------------------------Make the time string foramtting into a functoin of its own?--||
        let date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let bedtimeHours = parseInt(Launcher.instance().parentPreferenes["bedTimeRule"]);
        let bedtimeMinutes = parseInt(Launcher.instance().parentPreferenes["bedTimeRule"].substring(3, 5))

        let hourDiff = bedtimeHours - hours;
        let minuteDiff = bedtimeMinutes - minutes;
        let diff = (hourDiff*60) + minuteDiff;

        let AmPm = "am";
        if (hours == 12){
          AmPm = "pm";
        }
        if(hours > 12){
          hours -= 12;
          AmPm = "pm";
        }
        let hoursString: string = hours.toString();
        let minutesString: string = minutes.toString();
        if(minutesString.length == 1){
          minutesString = "0" + minutesString;
        }
        let localTime = hoursString + ":" + minutesString + AmPm;

        let myMessage = "";
        let mainWindowObject = overwolf.windows.getMainWindow();
        if(diff < 60 && diff >=45){
          myMessage = "You have time for about 2 more games.";
        }else if(diff < 45 && diff >=20){
          myMessage = "You have time for one last game.";
        }else if(diff < 20 && diff >=5){
          myMessage = "You dont have enough time to play a game before bedtime."; //Playing a game will put you past your bedtime?
        }else if(diff < 5 && diff >=-5){
          myMessage = "Its time to stop playing and say good night.";
          if(!(diff<0)){
            myMessage += " You are" + -diff + " minutes past your bedtime";
          }
        }
        document.getElementById("secondary_message").innerHTML = myMessage;   //send the secondary message
        
        if(diff < -5){  //it is past your betime.
          //myMessage = "You are " + -diff + " minutes past your bedtime."; //maybe delte this. We have the red stff popping up
          //send the bedtime text message here!!
          document.getElementById("primary_message").innerHTML = "It is <span class='urgentText'>past your bedtime</span>, time to stop playing. <br/><br/>The time is: <span class='urgentText'>"  + localTime + " </span>";
          document.getElementById("minimizeButton").innerHTML = "See You Tomorrow";
          if (mainWindowObject.document.getElementById("attributes").getAttribute('bedTimeMessage') != 'true') {
            mainWindowObject.document.getElementById("attributes").setAttribute('bedTimeMessage', 'true');
            //document.getElementById("test_message").innerHTML += "  text sms sent||"
            //Launcher.instance().sendBedtimeMessage();
          }
        }else{  //It is not past your bedtime
          document.getElementById("minimizeButton").innerHTML = "Back to Game";//-----------staticly sets it to "back to game"
          document.getElementById("primary_message").innerHTML = mainWindowObject.document.getElementById("primary_message").innerHTML;
        }
      }
    }


    private sendBedtimeMessage(){
      let messageData = {bedTime: Launcher.instance().parentPreferenes["bedTimeRule"]};  //{cellNum: "#######"};
      let serverAction = "bedtime-message";
      let remoteServer = "http://" +  this.remoteAddress + ":5000/" + serverAction;
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("POST", remoteServer, true);
      xmlHttp.setRequestHeader('Content-Type', 'application/json');
      xmlHttp.send(JSON.stringify(messageData));
      xmlHttp.onreadystatechange = function(){
        if (this.readyState != 4) return; //---------What is response code '4'?--------------------------------------------||
        if (this.status == 200) {
          var response = (this.responseText); // we get the returned data
          //document.getElementById("test_message").innerHTML = "reponse from /upload-game-data = " + response;
          //console.log("reponse from /send-message1 = " + response);
        }
      };
    }


    //Initially set all messages from bus(background.html)
    public setContent(){
      let mainWindowObject = overwolf.windows.getMainWindow(); //Gets the HTML Object of the main window for messaging
      document.getElementById("primary_message").innerHTML = mainWindowObject.document.getElementById("primary_message").innerHTML;
      document.getElementById("test_message").innerHTML += mainWindowObject.document.getElementById("test_message").innerHTML;
      document.getElementById("test_message2").innerHTML += mainWindowObject.document.getElementById("test_message2").innerHTML;
      document.getElementById("test_message3").innerHTML += mainWindowObject.document.getElementById("test_message3").innerHTML;
    }


    //Collect parental preferences at an interval
    private async collectPreferences(){
      let result = await Launcher.instance()._readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
      var sendData = {cellNum:JSON.parse(result)["cellNum"]};
      if (document.getElementById("test_message").innerHTML.indexOf(JSON.stringify(sendData)) == -1){
        document.getElementById("test_message").innerHTML += "sneding cell num " + JSON.stringify(sendData);
      }

      let serverAction = "get-settings";
      let remoteServer = "http://" +  Launcher.instance().remoteAddress + ":5000/" + serverAction;
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("POST", remoteServer, true);
      xmlHttp.setRequestHeader('Content-Type', 'application/json');
      xmlHttp.send(JSON.stringify(sendData));

      xmlHttp.onreadystatechange = function () {
        if (this.readyState != 4) return;
        if (this.status == 200) {
          var parsed = JSON.parse(this.responseText);
          //Launcher.instance().bedTime = parsed["bedTimeRule"]; //---------------------------Set all of parsed not only bedTimeRule----------------||
          Launcher.instance().parentPreferenes = parsed;
        }
      };
    }

  
    private async _readFileData(file_path:string){
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
    private async _writeFile(data:string, file_path:string){
      let result = await new Promise((resolve, reject) => {
        overwolf.io.writeFileContents(
          file_path,
          data,
          overwolf.io.enums.eEncoding.UTF8,
          true,
          r => r.success ? resolve(r) : reject(r)
        );
      });
      //console.log('writeFile()', JSON.stringify(result));
      document.getElementById("test_message3").innerHTML += 'writeFile()' + JSON.stringify(result);
      return result;
    }
}  
Launcher.instance().run();
