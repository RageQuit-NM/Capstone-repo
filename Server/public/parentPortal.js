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
      var parsed = JSON.parse(response);
      //document.getElementById("test_response").innerHTML = "reponse = " + response + "  also dailyDigest is: " + parsed["dailyDigest"];
      document.getElementById("test_response").innerHTML = "1" + response;
      buildPreferences(parsed);
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

//returns the win loss ratio
async function getWinLossRatio(statistics) {
  let winLossRatioPromise = new Promise(function(resolve, reject) {
    let wins = 0;
    let losses = 0;
    document.getElementById("test").innerHTML = JSON.stringify(statistics);
    for (let i=0; i<statistics.length; i++) {
      document.getElementById("test_response").innerHTML += "looping-" + i;
      if (statistics[key].hasOwnProperty("win")) {
        console.log("loop entered");
        document.getElementById("test_response").innerHTML += "does have property-";
          if (statistics[key].win == "true") {
            wins ++;
            console.log("win counted");
          } else {
            losses ++;
            console.log("loss counted");
          }
      }
      document.getElementById("test_response").innerHTML += "NO property-";
    }
    let winLossR = 0;
    if (losses !=0) {
      winLossR = wins/losses;
    } else if (wins > 0){
      winLossR = 1;
    } else {
      winLossR = 0;
    }
    console.log("wins: " + wins + " losses: " + losses + " win/loss: " + winLossR);
    resolve(winLossR);
    });

    return await winLossRatioPromise;
}

function buildStats(statistics) {
  getWinLossRatio(statistics).then(
    function(winLossRatio) { 
      // document.getElementById("test").innerHTML = "WLR = " + winLossRatio;
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
