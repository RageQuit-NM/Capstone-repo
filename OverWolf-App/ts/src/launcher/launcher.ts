import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../consts";

class Launcher extends AppWindow {
    private static _instance: Launcher;
    private remoteAddress: string = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com"; //Move to the parent class, all app windows need this remote address
    public bedTime: string;
  

    private constructor() {
      super(kWindowNames.launcher);
      //Constructor runs multiple times, makes it so it only runs once.
      if(overwolf.windows.getMainWindow().document.getElementById("attributes").getAttribute('listener') != 'true'){
        overwolf.windows.getMainWindow().document.getElementById("attributes").setAttribute('listener', 'true');
       
        //document.getElementById("parent_portal_link").href=this.remoteAddress;//------------------------Type cast this---------------------------------||

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
    }


    //Check if bedtime rule is violated on an interval, display appropriate message, notify parent.
    public async checkBedtime(){
      if(Launcher.instance().bedTime != null){
        let date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let minutesString;
        let hoursString;

        //bry minutes code
        let bedtimeHours = parseInt(Launcher.instance().bedTime);
        let bedtimeMinutes = parseInt(Launcher.instance().bedTime.substring(3, 5))

        let hourDiff = bedtimeHours - hours;
        let minuteDiff = bedtimeMinutes - minutes;
        let diff = (hourDiff*60) + minuteDiff;

        let myMessage = "";
        // if (document.getElementById("test_message").innerHTML.search("Bedtime is set to") == -1){
        //   document.getElementById("test_message").innerHTML += "Bedtime is set to " + diff + " parsed: " + bedtimeHours + "__" + bedtimeMinutes;
        // }
        if(diff < 60 && diff >=45){
          myMessage = "You have time for about 2 more games.";
        }else if(diff < 45 && diff >=20){
          myMessage = "You have time for one last game.";
        }else if(diff < 20 && diff >=5){
          myMessage = "You dont have enough time to play a game before bedtime."; //Playing a game will put you past your bedtime?
        }else if(diff < 5 && diff >=-5){
          myMessage = "Its time to stop playing and say good night.";
          if(!(diff<0)){
            myMessage += " You have " + diff + " minutes until bedtime";
          }
        }else if(diff < -5){
          //myMessage = "You are " + -diff + " minutes past your bedtime."; //maybe delte this. We have the red stff popping up
          //send the bedtime text message here!!
        }
        document.getElementById("secondary_message").innerHTML = myMessage;


        hoursString = (hours as unknown as string);
        minutesString = (minutes as unknown as string);
        
        if(hours < 10){
          hoursString = "0" + (hours as unknown as string);
        }
        if(minutes < 10){
          minutesString = "0" + (minutes as unknown as string);
        }

//---- REFACTOR THIS --------------------------------------------------------------------------------------------||
        let isBedTime;
        let localTime = hoursString + ":" + minutesString;
        if(localTime > Launcher.instance().bedTime){
          isBedTime = true;
        }else{
          isBedTime = false;
        }

        //Normalize the time
        if(hours > 12){
          hoursString = (hours-12 as unknown as string);
          if(hours < 10){
            hoursString = "0" + hoursString;
          }
        }else{
          hoursString = (hours as unknown as string);
          if(minutes < 10){
            minutesString = "0" + minutesString;
          }
        }
        if(hoursString == "0"){
          hoursString = "00";
        }
        if(minutesString == "0"){
          minutesString = "00";
        }
       
        localTime = hoursString + ":" + minutesString;
        let mainWindowObject = overwolf.windows.getMainWindow();
        if(!isBedTime){
          document.getElementById("minimizeButton").innerHTML = "Back to Game";//-----------staticly sets it to "back to game"
          document.getElementById("primary_message").innerHTML = mainWindowObject.document.getElementById("primary_message").innerHTML;
        }else{
          document.getElementById("primary_message").innerHTML = "It is <span class='urgentText'>past your bedtime</span>, time to stop playing. <br/><br/>The time is: <span class='urgentText'>"  + localTime + " </span>";
          document.getElementById("minimizeButton").innerHTML = "See You Tomorrow";
          if (mainWindowObject.document.getElementById("attributes").getAttribute('bedTimeMessage') != 'true') {
            mainWindowObject.document.getElementById("attributes").setAttribute('bedTimeMessage', 'true');
            //document.getElementById("test_message").innerHTML += "  text sms sent||"
            //Launcher.instance().sendBedtimeMessage();
          }
        }
      }
    }


    private sendBedtimeMessage(){
      let messageData = {bedTime: Launcher.instance().bedTime};  //{cellNum: "#######"};
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
      //HARD CODED TEMPORARY///////////////////////
      var sendData = {cellNum:"0"};
      sendData["cellNum"] = "5551234";
      ////////////////////////////////////////////

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
          Launcher.instance().bedTime = parsed["bedTimeRule"]; //---------------------------Set all of parsed not only bedTimeRule----------------||
        }
      };
    }

  
    // private async _readFileData(file_path:string){
    //   const result = await new Promise(resolve => {
    //     overwolf.io.readFileContents(
    //       file_path,
    //       overwolf.io.enums.eEncoding.UTF8,
    //       resolve
    //     );
    //   }); //returns result["success"] + ", " + result["content"] + ", " +  result["error"]
    //   //console.log("readFileData()", result["success"] + ", " + result["content"] + ", " +  result["error"]);
    //   return result["content"];
    // }

    // //Writes data into a file specified in file_path, returns the result
    // private async _writeFile(data:string, file_path:string){
    //   let result = await new Promise((resolve, reject) => {
    //     overwolf.io.writeFileContents(
    //       file_path,
    //       data,
    //       overwolf.io.enums.eEncoding.UTF8,
    //       true,
    //       r => r.success ? resolve(r) : reject(r)
    //     );
    //   });
    //   //console.log('writeFile()', result);
    //   return result;
    // }
}  
Launcher.instance().run();
