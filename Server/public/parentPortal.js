var remoteAddress = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";

//listener for parent preference submission
document.getElementById("parent_control_submit").addEventListener("click", parentFormHandler);
document.getElementById("choose_cellNum_submit").addEventListener("click", setCellNum);

document.getElementById("first_cellNum_submit").addEventListener("click", sendCode);
document.getElementById("code_submit").addEventListener("click", submitCode);

//
function sendCode(){
  var cellNum = document.getElementById("firstCellNum").value;
  setCookie("cellNum", cellNum);
  var sendData = {cellNum:cellNum};

  let serverAction = "send-code";
  let remoteServer = "https://" +  remoteAddress + ":5001/" + serverAction;
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

function submitCode(){
  var code = document.getElementById("codeInput").value;
  var cellNum = getCookie("cellNum");
  setCookie("cellNum", cellNum, "code", code);

  if (verifyCode()){
    //Initalize the parent portal
  }
}


function verifyCode(){
  var code = getCookie("code");
  var cellNum = getCookie("cellNum");
  var sendData = {cellNum:cellNum, code:code};

  let serverAction = "verify-code";
  let remoteServer = "https://" +  remoteAddress + ":5001/" + serverAction;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("POST", remoteServer, true);
  xmlHttp.setRequestHeader('Content-Type', 'application/json');
  xmlHttp.send(JSON.stringify(sendData));

  xmlHttp.onreadystatechange = function () {
    if (this.readyState != 4) return;
    if (this.status == 200) {
      var response = (this.responseText); // we get the returned data
      document.getElementById("test").innerHTML = response;

      if(resposne == "VAILD_CODE"){
        setCookie("cellNum", cellNum, "code", code);
        return true;
      }else{
        document.getElementById("codeFeedback").innerHTML = "Incorrect code.";
        delCookie();  //Remove the cookie. makes sure the code feild is not set
        setCookie("cellNum", cellNum); 
        return false;
      }
    }
  };
}

//Initialize tooltips
createToolTips();

//if the cellNum cookie is set then populate the parent portal with corresponding data from server
///--------------Might not need to use checkCookie() anymore
if(checkCookie() && verifyCode()){
  // document.getElementById("test2").innerHTML = "cookie is set to: " + document.cookie + " checkCookie() is " + checkCookie();
  // document.getElementById("test").innerHTML = "cookie SET: " + getCookie("cellNum");
  var sendData = {cellNum:0};
  sendData["cellNum"] = getCookie("cellNum");

  let serverAction = "get-settings";
  let remoteServer = "https://" +  remoteAddress + ":5001/" + serverAction;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("POST", remoteServer, true);
  xmlHttp.setRequestHeader('Content-Type', 'application/json');
  xmlHttp.send(JSON.stringify(sendData));

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
    let remoteServer = "https://" +  remoteAddress + ":5001/" + serverAction;
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




//Re loads all tooltips to reflect current relevant properties, must run this for a change to be applied
function createToolTips() {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })
}




//_____ASYNC_FUNCTIONS_FOR_CALCULATING_STATISTICS__________________________________________________________________________________________________________________
//Async function for calculating win/loss ratio
async function getWinLossRatio(statistics) {
  let winLossRatioPromise = new Promise(function(resolve, reject) {
    let wins = 0;
    let losses = 0;
    let parsed = JSON.parse(statistics);

    for (let i=0; i<parsed.length; i++) {
      document.getElementById("test_response").innerHTML += statistics[i] + "\n";
      if (parsed[i].hasOwnProperty("win")) {
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
      document.getElementById("test_response").innerHTML += parsed[i] + "\n";
      if (parsed[i].hasOwnProperty("kills")) {
        kills += parseInt(parsed[i]["kills"]);
      }
      if (parsed[i].hasOwnProperty("deaths")) {
        deaths += parseInt(parsed[i]["deaths"]);
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
    resolve(killDeathR);
    });
    return await killDeathRatioPromise;
}




function buildStats(statistics) {
  //Populate the win loss ratio progress bar
  console.log(JSON.parse(statistics));

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
      document.getElementById("wlRatioBar").innerHTML = winLossRatio.toString() + " wins/loss";
      document.getElementById("wlRatioBarColumn").title = winLossRatio.toString() + " wins/loss";
      createToolTips();
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
      document.getElementById("kdRatioBar").innerHTML = killDeathRatio.toString() + " kills/death";
      document.getElementById("kdRatioBarColumn").title = killDeathRatio.toString() + " kills/death";
      createToolTips();
    }
  );
}


//populate the parent portal preferences form
function buildPreferences(preferences) {
  preferences = JSON.parse(preferences);
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

function setCellNum(){
  var cellNum = document.getElementById("cellNum").value
  var regexCellNum = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  if(!regexCellNum.test(cellNum)){
    document.getElementById("cellChangeFeedback").innerHTML = "Please enter a valid phone number.";
    document.getElementById("cellNum").classList.add("is-invalid");
    return;
  }
  setCookie("cellNum", cellNum);
  location.reload();
}

function isFormValid(){
  var regexNumber = /^[1-9][0-9]*$/im;

  var timeLimitRule = document.getElementById("timeLimitRule").value
  if(!regexNumber.test(timeLimitRule)){
    document.getElementById("timeLimitFeedback").innerHTML = "Please enter a valid number.";
    document.getElementById("timeLimitRule").classList.add("is-invalid");
    document.getElementById("timeLimitRule").classList.remove("is-valid");
    return false;
  }else{
    document.getElementById("timeLimitFeedback").innerHTML = "";
    document.getElementById("timeLimitRule").classList.remove("is-invalid");
    document.getElementById("timeLimitRule").classList.add("is-valid");
  }

  var regexTime = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/im;

  var bedTimeRule = document.getElementById("bedTimeRule").value
  if(!regexTime.test(bedTimeRule)){
    document.getElementById("bedTimeFeedback").innerHTML = "Please enter a valid time.";
    document.getElementById("bedTimeRule").classList.add("is-invalid");
    document.getElementById("bedTimeRule").classList.remove("is-valid");
    return false;
  }else{
    document.getElementById("bedTimeFeedback").innerHTML = "";
    document.getElementById("bedTimeRule").classList.remove("is-invalid");
    document.getElementById("bedTimeRule").classList.add("is-valid");
  }

  var gameLimitRule = document.getElementById("gameLimitRule").value
  if(!regexNumber.test(gameLimitRule)){
    document.getElementById("gameLimitFeedback").innerHTML = "Please enter a valid number.";
    document.getElementById("gameLimitRule").classList.add("is-invalid");
    document.getElementById("gameLimitRule").classList.remove("is-valid");
    return false;
  }else{
    document.getElementById("gameLimitFeedback").innerHTML = "";
    document.getElementById("gameLimitRule").classList.remove("is-invalid");
    document.getElementById("gameLimitRule").classList.add("is-valid");
  }
  return true;
}

function setCellNum(){
  var cellNum = document.getElementById("cellNum").value
  setCookie("cellNum", cellNum);
  location.reload();
}

//Collect data from parent preferences and ...
function parentFormHandler() {
    var formData = Array.from(document.querySelectorAll('#parent_control_form input')).reduce((acc, input)=>({ ...acc, [input.id]: input.value }), {});
    formData["cellNum"] = document.getElementById("cellNum").value;

    if(!isFormValid()){
      document.getElementById("forumFeedback").innerHTML = "Please correct the marked fields above.";
      document.getElementById("forumFeedback").style.display = "inherit";
      return;
    }else{
      document.getElementById("forumFeedback").innerHTML = "";
    }


    setCookie("cellNum", formData["cellNum"]);

    //let remoteAddress = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";
    let serverAction = "update-settings";
    let remoteServer = "https://" +  remoteAddress + ":5001/" + serverAction;
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
function setCookie(paramName, value, paramName2="", value2="") {
  //Create expiration date
  var expiration_date = new Date();
  expiration_date.setFullYear(expiration_date.getFullYear() + 1);
  //Create/update cookie
  document.cookie = paramName + "=" + value + "; " + paramName2 + "=" + value2 + "; path=/; expires=" + expiration_date.toUTCString();
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
