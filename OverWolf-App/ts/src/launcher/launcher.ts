import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../consts";

class Launcher extends AppWindow {
    private static _instance: Launcher;
    private remoteAddress: string = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com"; //Move to the parent class, all app windows need this remote address
    public parentPreferenes;  //timeLimitRule bedTimeRule gameLimitRule

    private constructor() {
      super(kWindowNames.launcher);
      //Constructor runs multiple times, makes it so it only runs once.
      if(overwolf.windows.getMainWindow().document.getElementById("attributes").getAttribute('listener') != 'true'){
        overwolf.windows.getMainWindow().document.getElementById("attributes").setAttribute('listener', 'true');
       
        (document.getElementById("parent_portal_link") as HTMLAnchorElement).href="https://" + this.remoteAddress + ":5001/parentPortal";
        document.getElementById("submitCellNum").addEventListener("click", this.submitCellNum);
        document.getElementById("submitCode").addEventListener("click", this.submitCode);

        if(overwolf.windows.getMainWindow().document.getElementById("isCellNumSet").innerHTML == "false"){
          document.getElementById("main").style.display = "none";
          document.getElementById("initalization").style.display = "inline";
        }else{
          document.getElementById("initalization").style.display = "none";

          Launcher.instance().setContent();
          setInterval(Launcher.instance().setContent, 1000*2);

          //Launcher.instance().collectPreferences();
          //setInterval(Launcher.instance().checkBedtime, 1000*2);
          //setInterval(Launcher.instance().collectPreferences, 1000*2);

          Launcher.instance().displayCellNum();
        }
      }
    }

    public async displayCellNum(){
      let fileData = await Launcher.instance().readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
      fileData = JSON.parse(fileData);
      document.getElementById("cellDisplay").innerHTML = fileData["cellNum"].substring(0, 3) + "-" + fileData["cellNum"].substring(3, 6) + "-" + fileData["cellNum"].substring(6);
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
      //Launcher.instance().updateparentalInfo();
      Launcher.instance().collectPreferences();
    }

    // private async updateparentalInfo(){
    //   await Launcher.instance().collectPreferences();
    //   let currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12:false});
    //   document.getElementById("test_message").innerHTML += currentTime + " vs. "; //+ Launcher.instance().parentPreferenes["bedTimeRule"] +" ";
    //   document.getElementById("test_message2").innerHTML +=Launcher.instance().parentPreferenes;
    //   let timeLeft;
    // }

    public async submitCellNum(){
      var cellNum = (document.getElementById("cellInput") as HTMLInputElement).value;
      var sendData = {cellNum:cellNum};

      var regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
      if(!regex.test(cellNum)){
        document.getElementById("cellInputFeedback").innerHTML = "Invalid cellphone # format!";
        return;
      }
    
      let serverAction = "send-code";
      let remoteServer = "https://" +  Launcher.instance().remoteAddress + ":5001/" + serverAction;
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("POST", remoteServer, true);
      xmlHttp.setRequestHeader('Content-Type', 'application/json');
      xmlHttp.send(JSON.stringify(sendData));
    
      xmlHttp.onreadystatechange = function () {
        if (this.readyState != 4) return;
        if (this.status == 200) {
          var response = (this.responseText); // we get the returned data
          //Open up the verify code option
        }
      };
    }



    //Writes the cellNum ino cell_number.json. Then sends the cellNum to remote. Then completes intialization and sets the launcher page back to normal functionality.
    public async submitCode(){
      var code = (document.getElementById("codeInput") as HTMLInputElement).value;
      var cellNum = (document.getElementById("cellInput") as HTMLInputElement).value;
      var sendData = {cellNum:cellNum, code:code};
      console.log("Checking if valid: " + JSON.stringify(sendData));
    
      let serverActionVerify = "verify-code";
      let remoteServerVerify = "https://" +  Launcher.instance().remoteAddress + ":5001/" + serverActionVerify;
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("POST", remoteServerVerify, true);
      xmlHttp.setRequestHeader('Content-Type', 'application/json');
      xmlHttp.send(JSON.stringify(sendData));
    
      xmlHttp.onreadystatechange = async function () {
        if (this.readyState != 4) return;
        if (this.status == 200) {
          var response = (this.responseText); // we get the returned data
          document.getElementById("test_message").innerHTML += response;
  
          if(response == "VAILD_CODE"){
            let userCellNum = {cellNum:cellNum};
            await Launcher.instance().writeFile(JSON.stringify(userCellNum), `${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);

            let serverAction = "insert-cellNum";
            let remoteServer = "https://" +  Launcher.instance().remoteAddress + ":5001/" + serverAction;
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("POST", remoteServer, true);
            xmlHttp.setRequestHeader('Content-Type', 'application/json');
            xmlHttp.send(JSON.stringify(userCellNum));

            document.getElementById("main").style.display = "inherit";
            document.getElementById("cellDisplay").style.display = "inherit";
            document.getElementById("initalization").style.display = "none";

            Launcher.instance().setContent();
            setInterval(Launcher.instance().setContent, 1000*2);
            Launcher.instance().displayCellNum();

            console.log("VAILD_CODE");
            console.log("verifyCode() building page")
            return true;
          }else{
            document.getElementById("codeInputFeedback").innerHTML += "Incorrect code."; 
            return false;
          }
        }
      };
    
      // xmlHttp.onreadystatechange = function () {
      //   if (this.readyState != 4) return;
      //   if (this.status == 200) {
      //     var parsed = JSON.parse(this.responseText);
      //     document.getElementById("test_message2").innerHTML += " insert-cellNum response = " + parsed;
      //   }
      // };

    }


    private async sendBedtimeMessage(){
      let messageData = await Launcher.instance().readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
      let serverAction = "bedtime-message";
      let remoteServer = "https://" +  this.remoteAddress + ":5001/" + serverAction;
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("POST", remoteServer, true);
      xmlHttp.setRequestHeader('Content-Type', 'application/json');
      xmlHttp.send(messageData);
      // xmlHttp.onreadystatechange = function(){
      //   if (this.readyState != 4) return; //---------What is response code '4'?--------------------------------------------||
      //   if (this.status == 200) {
      //     var response = (this.responseText); // we get the returned data
      //   }
      // };
    }


    //Initially set all messages from bus(background.html)
    public setContent(){
      let mainWindowObject = overwolf.windows.getMainWindow(); //Gets the HTML Object of the main window for messaging
      document.getElementById("primary_message").innerHTML = mainWindowObject.document.getElementById("primary_message").innerHTML;
      if(document.getElementById("primary_message").innerHTML.indexOf("localTime") != -1){
        let time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        let collection = document.getElementsByClassName("localTime");
        for (let i = 0; i < collection.length; i++) {
          collection[i].innerHTML = time;
        }
      }

      document.getElementById("minimizeButton").innerHTML = mainWindowObject.document.getElementById("dismiss_message").innerHTML;

      if(document.getElementById("test_message").innerHTML.indexOf(mainWindowObject.document.getElementById("test_message").innerHTML) == -1){
        document.getElementById("test_message").innerHTML += mainWindowObject.document.getElementById("test_message").innerHTML;
      }
      if(document.getElementById("test_message2").innerHTML.indexOf(mainWindowObject.document.getElementById("test_message2").innerHTML) == -1){
        document.getElementById("test_message2").innerHTML += mainWindowObject.document.getElementById("test_message2").innerHTML;
      }
      if(document.getElementById("test_message3").innerHTML.indexOf(mainWindowObject.document.getElementById("test_message3").innerHTML) == -1){
        document.getElementById("test_message3").innerHTML += mainWindowObject.document.getElementById("test_message3").innerHTML;
      }
    }


    //Collect parental preferences at an interval
    private async collectPreferences(){
      //document.getElementById("test_message3").innerHTML += "Collecting preferneces" + new Date();
      let result = await Launcher.instance().readFileData(`${overwolf.io.paths.localAppData}\\Overwolf\\RageQuit.NM\\cell_number.json`);
      if(result == null){
        if (document.getElementById("test_message2").innerHTML.indexOf("cell_number.json does not exist") == -1){
          document.getElementById("test_message2").innerHTML += "cell_number.json does not exist";
        }
        return
      }
      var sendData = {cellNum:JSON.parse(result)["cellNum"]};

      let serverAction = "get-settings";
      let remoteServer = "https://" +  Launcher.instance().remoteAddress + ":5001/" + serverAction;
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("POST", remoteServer, true);
      xmlHttp.setRequestHeader('Content-Type', 'application/json');
      xmlHttp.send(JSON.stringify(sendData));

      xmlHttp.onreadystatechange = function () {
        if (this.readyState != 4) return;
        if (this.status == 200) {
          var parsed = JSON.parse(this.responseText);
          Launcher.instance().parentPreferenes = parsed;
          //document.getElementById("test_message2").innerHTML += JSON.stringify(Launcher.instance().parentPreferenes);
          let currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12:false});
          document.getElementById("test_message").innerHTML += currentTime + " vs. " + Launcher.instance().parentPreferenes["bedTimeRule"];
          let hoursLeft = parseInt(Launcher.instance().parentPreferenes["bedTimeRule"]) - parseInt(currentTime);
          let minutesLeft = parseInt(Launcher.instance().parentPreferenes["bedTimeRule"].substring(Launcher.instance().parentPreferenes["bedTimeRule"].indexOf(":")+1)) - parseInt(currentTime.substring(currentTime.indexOf(":")+1));
          document.getElementById("test_message2").innerHTML += "Hours left " + hoursLeft + "minutes elft " + minutesLeft;
          
          if (minutesLeft < 0){
            hoursLeft -= 1;
            minutesLeft += 60;
          }
          let timeLeft = "Time left: " + hoursLeft + ":" + minutesLeft;
          document.getElementById("test_message3").innerHTML = timeLeft;
        }
        return;
      };
    }

    //Check if bedtime rule is violated on an interval, display appropriate message, notify parent.
    // public async checkBedtime(){
    //   if(Launcher.instance().parentPreferenes == null){
    //     if (document.getElementById("test_message2").innerHTML.indexOf("ParentPrefecnes is not set") == -1){
    //       document.getElementById("test_message2").innerHTML += "ParentPrefecnes is not set";
    //     }
    //     return;
    //   }
    //   if(Launcher.instance().parentPreferenes["bedTimeRule"] != null){
    //     let date = new Date();
    //     let hours = date.getHours();
    //     let minutes = date.getMinutes();
    //     let bedtimeHours = parseInt(Launcher.instance().parentPreferenes["bedTimeRule"]);
    //     let bedtimeMinutes = parseInt(Launcher.instance().parentPreferenes["bedTimeRule"].substring(3, 5))

    //     let hourDiff = bedtimeHours - hours;
    //     let minuteDiff = bedtimeMinutes - minutes;
    //     let diff = (hourDiff*60) + minuteDiff;

    //     let AmPm = "am";
    //     if (hours == 12){
    //       AmPm = "pm";
    //     }
    //     if(hours > 12){
    //       hours -= 12;
    //       AmPm = "pm";
    //     }
    //     let hoursString: string = hours.toString();
    //     let minutesString: string = minutes.toString();
    //     if(minutesString.length == 1){
    //       minutesString = "0" + minutesString;
    //     }
    //     let localTime = hoursString + ":" + minutesString + AmPm;

    //     let myMessage = "";
    //     let mainWindowObject = overwolf.windows.getMainWindow();
    //     if(diff < 60 && diff >=45){
    //       myMessage = "You have time for about 2 more games.";
    //     }else if(diff < 45 && diff >=20){
    //       myMessage = "You have time for one last game.";
    //     }else if(diff < 20 && diff >=5){
    //       myMessage = "You dont have enough time to play a game before bedtime."; //Playing a game will put you past your bedtime?
    //     }else if(diff < 5 && diff >=-5){
    //       myMessage = "Its time to stop playing and say good night.";
    //       if(diff<0){
    //         myMessage += " You are" + -diff + " minutes past your bedtime";
    //       }
    //     }
    //     document.getElementById("secondary_message").innerHTML = myMessage;   //send the secondary message
        
    //     if(diff < -5){  //it is past your betime.
    //       document.getElementById("primary_message").innerHTML = "It is <span class='urgentText'>past your bedtime</span>, time to stop playing. <br/><br/>The time is: <span class='urgentText'>"  + localTime + " </span>";
    //       document.getElementById("minimizeButton").innerHTML = "See You Tomorrow";
    //       if (mainWindowObject.document.getElementById("attributes").getAttribute('bedTimeMessage') != 'true') {
    //         mainWindowObject.document.getElementById("attributes").setAttribute('bedTimeMessage', 'true');
    //         //Launcher.instance().sendBedtimeMessage(); //<--------------------------------- sending bedtime text message
    //       }
    //     }else{  //It is not past your bedtime
    //       document.getElementById("minimizeButton").innerHTML = "Back to Game";//-----------staticly sets it to "back to game"
    //       Launcher.instance().setContent();
    //     }
    //   }
    // }

  
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
}  
Launcher.instance().run();
