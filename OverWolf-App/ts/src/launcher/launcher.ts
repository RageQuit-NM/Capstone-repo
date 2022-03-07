import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../consts";

class Launcher extends AppWindow {
    private static _instance: Launcher;
    private remoteAddress: string = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com"; //Move to the parent class, all app windows need this remote address
    //public bedTime: string;
    public parentPreferenes;  //timeLimitRule bedTimeRule gameLimitRule
    public isCellNumSet:boolean;
    public endIntializationIntervalId;

    private constructor() {
      super(kWindowNames.launcher);
      //Constructor runs multiple times, makes it so it only runs once.
      if(overwolf.windows.getMainWindow().document.getElementById("attributes").getAttribute('listener') != 'true'){
        overwolf.windows.getMainWindow().document.getElementById("attributes").setAttribute('listener', 'true');
       
        (document.getElementById("parent_portal_link") as HTMLAnchorElement).href="http://" + this.remoteAddress + ":5000/parentPortal";
        //document.getElementById("cellInput").addEventListener("change", this.setCellNum);
        document.getElementById("submitCellNum").addEventListener("click", this.submitCellNum);
      }
    }

    public async endIntialization(){
      if(await Launcher.instance().checkCellNum()){
        document.getElementById("test_message").innerHTML += " (shuldnt see this more than once. id of interval is: "+Launcher.instance().endIntializationIntervalId+") Phone number entered: " + await Launcher.instance()._readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`); + " ";
        document.getElementById("main").style.display = "inherit";
        document.getElementById("cellDisplay").style.display = "inherit";
        document.getElementById("initalization").style.display = "none";
        Launcher.instance().isCellNumSet = true;
        Launcher.instance().collectPreferences();
        Launcher.instance().setContent();

        //This code can be run without the first time intialization running, Everything inside here will only run after a first time intialization
        if(Launcher.instance().endIntializationIntervalId != null){
          document.getElementById("test_message").innerHTML += " Ending first time intialization! ";
          let result = await Launcher.instance()._readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
          var sendData = {cellNum:JSON.parse(result)["cellNum"]};

          let serverAction = "insert-cellNum";
          let remoteServer = "http://" +  Launcher.instance().remoteAddress + ":5000/" + serverAction;
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.open("POST", remoteServer, true);
          xmlHttp.setRequestHeader('Content-Type', 'application/json');
          xmlHttp.send(JSON.stringify(sendData));

          xmlHttp.onreadystatechange = function () {
            if (this.readyState != 4) return;
            if (this.status == 200) {
              var parsed = JSON.parse(this.responseText);
              document.getElementById("test_message2").innerHTML += " Response = parsed";
            }
          };
          clearInterval(Launcher.instance().endIntializationIntervalId);
        }
        setInterval(Launcher.instance().checkBedtime, 1000*2);
        setInterval(Launcher.instance().collectPreferences, 1000*2);

        let cellNum = await Launcher.instance()._readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
        document.getElementById("cellDisplay").innerHTML = cellNum;
      }
    }
    public async checkCellNum(){
      let cellNum = await Launcher.instance()._readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`)
      if (cellNum == null){
        return false;
      }else{
        return true;
      }
    }

    public initalize(){
      document.getElementById("main").style.display = "none";
      document.getElementById("initalization").style.display = "inline";
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
      //if cell num has been entered
      if(overwolf.windows.getMainWindow().document.getElementById("attributes").getAttribute('firstCellCheck') != 'true'){
        overwolf.windows.getMainWindow().document.getElementById("attributes").setAttribute('firstCellCheck', 'true');
        if(await Launcher.instance().checkCellNum()){
          //document.getElementById("test_message").innerHTML += "Skipping first insialize " + await Launcher.instance().checkCellNum() + "___";
          Launcher.instance().endIntialization();
        }
        else{
          document.getElementById("test_message").innerHTML += "Perfoming first intialize ";
          Launcher.instance().isCellNumSet = false;
          Launcher.instance().initalize();
          Launcher.instance().endIntializationIntervalId = setInterval(Launcher.instance().endIntialization, 1000*1);
        }
      }
    }
    // public setCellNum(){    //Shouldnt set cellNum completely without the submit button!! this fucniton should probs do nohting and th submit does everything
    //   // let myData = {cellNum: (document.getElementById("cellInput") as HTMLInputElement).value}
    //   // Launcher.instance()._writeFile(JSON.stringify(myData),  `${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
    // }

    public async submitCellNum(){
      let myData = {cellNum: (document.getElementById("cellInput") as HTMLInputElement).value}
      Launcher.instance()._writeFile(JSON.stringify(myData),  `${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
      // let result = await Launcher.instance()._readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
    }


    //Check if bedtime rule is violated on an interval, display appropriate message, notify parent.
    public async checkBedtime(){
      if(Launcher.instance().parentPreferenes == null){
        if (document.getElementById("test_message2").innerHTML.indexOf("ParentPrefecnes is not set") == -1){
          document.getElementById("test_message2").innerHTML += "ParentPrefecnes is not set";
        }
        return
      }
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
          //document.getElementById("test_message").innerHTML += "reponse from /upload-game-data = " + response;
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
      document.getElementById("test_message3").innerHTML = "Collecting preferneces" + new Date();
      let result = await Launcher.instance()._readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
      if(result == null){
        if (document.getElementById("test_message2").innerHTML.indexOf("cell_number.json does not exist") == -1){
          document.getElementById("test_message2").innerHTML += "cell_number.json does not exist";
        }
        return
      }
      var sendData = {cellNum:JSON.parse(result)["cellNum"]};
      if (document.getElementById("test_message").innerHTML.indexOf(JSON.stringify(sendData)) == -1){
        document.getElementById("test_message").innerHTML += " CellNum: " + JSON.stringify(sendData);
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
