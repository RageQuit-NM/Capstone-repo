import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../consts";

class Launcher extends AppWindow {
    private static _instance: Launcher;
    //private _gameEventsListener: OWGamesEvents;
    private mainWindowObject: Window;
  
    private constructor() {
      super(kWindowNames.launcher);
      //this.setToggleHotkeyBehavior();
      //this.setToggleHotkeyText();
      let aButton = document.getElementById("aButton");

      //Had an issue with contrudctor urnning 3 times, make it so only 1 listener is set
      if (aButton.getAttribute('listener') != 'true') {
        aButton.setAttribute('listener', 'true');
        aButton.addEventListener("click", this.clickSexyButton);
      }
   }
  
    public static instance() {
      if (!this._instance) {
        this._instance = new Launcher();
      }
      return this._instance;
    }
    
    //collect all messages from bus to be shown on the launcher page
    public async run() {
      this.mainWindowObject = overwolf.windows.getMainWindow(); //Gets the HTML Object of the main window for messaging

      let primary_message: string = this.mainWindowObject.document.getElementById("primary_message").innerHTML; // collect the primary_message
      document.getElementById("primary_message").innerHTML = primary_message;                                   //Update HTML document

      let secondary_message: string = this.mainWindowObject.document.getElementById("secondary_message").innerHTML;
      document.getElementById("secondary_message").innerHTML = secondary_message;
      
      let time_message: string = this.mainWindowObject.document.getElementById("time_message").innerHTML;
      document.getElementById("time_played").innerHTML = time_message;

      let test_message: string = this.mainWindowObject.document.getElementById("test_message").innerHTML;
      document.getElementById("test_message").innerHTML = test_message;
    }

    private clickSexyButton(){
      const bottomSection = document.getElementById("bottomSection");
      //bottomSection.remove();
      bottomSection.style.display = "none";

      let size:number = 100;

      let image1 = document.createElement("img");
      image1.src="img/smiley.jpg";
      image1.width=size;
      image1.height=size;
      image1.addEventListener("click", this.clickReturn);

      let image2 = document.createElement("img");
      image2.src="img/straightFace.png";
      image2.width=size;
      image2.height=size;

      let image3 = document.createElement("img");
      image3.src="img/sadFace.png";
      image3.width=size;
      image3.height=size;

      let main = document.getElementById("main");
      let picDiv = document.createElement("div");
      //picDiv.addEventListener("click", this.clickReturn);
      picDiv.setAttribute("id", "picDiv");
      main.appendChild(picDiv);

      picDiv.appendChild(image1);
      picDiv.appendChild(image2);
      picDiv.appendChild(image3);

      document.getElementById("broad_message").addEventListener("click", this.colour);
      console.log("heere2");
    }

    private clickReturn(){
      console.log("clicked a pic");
      let picDiv = document.getElementById("picDiv");
      picDiv.style.display = "none";

      const bottomSection = document.getElementById("bottomSection");
      bottomSection.style.display = "block";
    }

    private colour(){
      document.getElementById("broad_message").style.color = "red";
    }
}  
Launcher.instance().run();