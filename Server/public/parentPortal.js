var remoteAddress = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";

//listener for parent preference submission
document.getElementById("parent_control_submit").addEventListener("click", parentFormHandler);


//Enable tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})


//if the cellNum cookie is set then populate the parent portal with corresponding data from server
if(checkCookie()){
  //document.getElementById("test").innerHTML = "cookie SET: " + getCookie("cellNum");
  var sendData = {cellNum:0};
  sendData["cellNum"] = getCookie("cellNum");

  // let remoteAddress = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";
  let serverAction = "get-settings";
  let remoteServer = "http://" +  remoteAddress + ":5000/" + serverAction;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("POST", remoteServer, true);
  xmlHttp.setRequestHeader('Content-Type', 'application/json');
  xmlHttp.send(JSON.stringify(sendData));

  // document.getElementById("test").innerHTML = "sent = " + JSON.stringify(sendData);

  xmlHttp.onreadystatechange = function () {
    if (this.readyState != 4) return;
    if (this.status == 200) {
      var response = (this.responseText); // we get the returned data
      buildPreferences(response);
    }


//*************************************************************************************************************** */
//*************************************************************************************************************** */
//*************************************************************************************************************** */
//*************************************************************************************************************** */
//*************************************************************************************************************** */
    let serverAction = "get-stats";
    let remoteServer = "http://" +  remoteAddress + ":5000/" + serverAction;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", remoteServer, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify(sendData));
  
    // document.getElementById("test").innerHTML = "2" + JSON.stringify(sendData);
  
    xmlHttp.onreadystatechange = function () {
      if (this.readyState != 4) return;
      if (this.status == 200) {
        var response = (this.responseText); // we get the returned data
        buildStats(response);
      }
    }
//*************************************************************************************************************** */
//*************************************************************************************************************** */
//*************************************************************************************************************** */
//*************************************************************************************************************** */
//*************************************************************************************************************** */
    // end of state change: it can be after some time (async)
  };
//If the cellNum cookie is not set, do not populate page.
}else{
  document.getElementById("test").innerHTML = "cookie not set: " + document.cookie;
}





//Async function for calculating win/loss ratio
async function getWinLossRatio(statistics) {
  let winLossRatioPromise = new Promise(function(resolve, reject) {
    let wins = 0;
    let losses = 0;
    let parsed = JSON.parse(statistics);

    for (let i=0; i<parsed.length; i++) {
      document.getElementById("test_response").innerHTML += statistics[i] + "\n";
      if (parsed[i].hasOwnProperty("win")) {
        console.log("loop entered");
        document.getElementById("test_response").innerHTML += "does have property-";
          if (parsed[i].win == "true") {
            wins ++;
          } else {
            losses ++;
          }
      }
    }
    let winLossR = 0;
    if (losses !=0) {
      winLossR = wins/losses;
    } else if (wins > 0){
      winLossR = 1;
    } else {
      winLossR = 0;
    }
    resolve(winLossR);
    });

    return await winLossRatioPromise;
}


//Async function for calculating kill/death ratio
async function getKillDeathRatio(statistics) {
  let killDeathRatioPromise = new Promise(function(resolve, reject) {
    let kills = 0;
    let deaths = 0;
    let parsed = JSON.parse(statistics);

    for (let i=0; i<parsed.length; i++) {
      document.getElementById("test_response").innerHTML += statistics[i] + "\n";
      if (parsed[i].hasOwnProperty("kills")) {
        kills += parseInt(statistics[i]["kills"]);
      }
      if (parsed[i].hasOwnProperty("deaths")) {
        deaths += parseInt(statistics[i]["deaths"]);
      }
    }

    let killDeathR = 0;
    if (deaths !=0) {
      killDeathR = kills/deaths;
    } else if (kills > 0){
      killDeathR = 1;
    } else {
      killDeathR = 0;
    }
    console.log("kills: " + kills + " deaths: " + deaths + " kill/death: " + killDeathR);
    resolve(killDeathR);
    });

    return await killDeathRatioPromise;
}




function buildStats(statistics) {
  //Populate the win loss ratio progress bar
  getWinLossRatio(statistics).then(
    function(winLossRatio) { 
      //clear existing classes
      var classList = document.getElementById("wlRatioBar").classList;
      while (classList.length > 0) { classList.remove(classList.item(0));}

      //Apply correct new classes and styling
      let percent = 0;
      if(winLossRatio >= 1) {
        document.getElementById("wlRatioBar").classList.add("bg-success");
        document.getElementById("wlRatioBar").style.width = "100%";
      } else if (winLossRatio > 0.1) {
        percent = winLossRatio * 100;
        if (winLossRatio > 0.6) {  
          document.getElementById("wlRatioBar").classList.add("bg-success");
        } else if (winLossRatio > 0.4) {  
          document.getElementById("wlRatioBar").classList.add("bg-warning");
        } else if (winLossRatio > 0.1) {  
          document.getElementById("wlRatioBar").classList.add("bg-danger");
        }
        document.getElementById("wlRatioBar").style.width = percent.toString() + "%";
      } else {
        document.getElementById("wlRatioBar").classList.add("bg-danger");
        document.getElementById("wlRatioBar").style.width = "10%";
      }
    }
  );


  getKillDeathRatio(statistics).then(
    function(killDeathRatio) { 
      //clear existing classes
      var classList = document.getElementById("kdRatioBar").classList;
      while (classList.length > 0) { classList.remove(classList.item(0));}

      //Apply correct new classes and styling
      let percent = 0;
      if(killDeathRatio >= 1) {
        document.getElementById("kdRatioBar").classList.add("bg-success");
        document.getElementById("kdRatioBar").style.width = "100%";
      } else if (killDeathRatio > 0.1) {
        percent = killDeathRatio * 100;
        if (killDeathRatio > 0.6) {  
          document.getElementById("kdRatioBar").classList.add("bg-success");
        } else if (killDeathRatio > 0.4) {  
          document.getElementById("kdRatioBar").classList.add("bg-warning");
        } else if (killDeathRatio > 0.1) {  
          document.getElementById("kdRatioBar").classList.add("bg-danger");
        }
        document.getElementById("kdRatioBar").style.width = percent.toString() + "%";
      } else {
        document.getElementById("kdRatioBar").classList.add("bg-danger");
        document.getElementById("kdRatioBar").style.width = "10%";
      }
    }
  );

  


}



//populate the parent portal preferences form
function buildPreferences(preferences) {
  document.getElementById("cellNum").value = preferences["cellNum"];
  document.getElementById("timeLimitRule").value = preferences["timeLimitRule"];
  document.getElementById("bedTimeRule").value = preferences["bedTimeRule"];
  document.getElementById("gameLimitRule").value = preferences["gameLimitRule"];
  const toggles = ["timeLimitToggle", "bedTimeToggle", "gameLimitToggle", "dailyDigest", "weeklyDigest", "monthlyDigest"];
  for (let i = 0; i < toggles.length; i++) {
    if(preferences[toggles[i]] == "true"){
      document.getElementById(toggles[i]).checked = true;
      document.getElementById(toggles[i]).value = true;
    }else{
      document.getElementById(toggles[i]).checked = false;
      document.getElementById(toggles[i]).value = false;
    }
  }
}


//Collect data from parent preferences and ...
function parentFormHandler() {
    var formData = Array.from(document.querySelectorAll('#parent_control_form input')).reduce((acc, input)=>({ ...acc, [input.id]: input.value }), {});

    setCookie("cellNum", formData["cellNum"]);

    let remoteAddress = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";
    let serverAction = "update-settings";
    let remoteServer = "http://" +  remoteAddress + ":5000/" + serverAction;
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("POST", remoteServer, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify(formData));

    xmlHttp.onreadystatechange = function () {
        if (this.readyState != 4) return;
        if (this.status == 200) {
          var response = (this.responseText); // we get the returned data
          document.getElementById("test_response").innerHTML = "response: " + response;
        }
        // end of state change: it can be after some time (async)
    };
    document.getElementById("test").innerHTML = JSON.stringify(formData) + document.cookie;
}


//Check if the cookie is set
function checkCookie() {
  if(getCookie("cellNum") != ""){
    return true;
  }
  else{
    return false;
  }
}


//Set the cookie with an expiration date of t + 1 year
function setCookie(paramName, value) {
  //Create expiration date
  var expiration_date = new Date();
  expiration_date.setFullYear(expiration_date.getFullYear() + 1);
  //Create/update cookie
  document.cookie = paramName + "=" + value + "; path=/; expires=" + expiration_date.toUTCString();
}


//Get the cookie
function getCookie(paramName) {
  let name = paramName + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


//Delete the cookie
function delCookie() {
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
