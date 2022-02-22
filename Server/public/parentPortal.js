//listener for parent preference submission
document.getElementById("parent_control_submit").addEventListener("click", parentFormHandler);

//Enable tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

//Collect data from parent preferences and ...
function parentFormHandler(){
    var formData = Array.from(document.querySelectorAll('#parent_control_form input')).reduce((acc, input)=>({ ...acc, [input.id]: input.value }), {});

    let remoteAddress = "ec2-35-183-27-150.ca-central-1.compute.amazonaws.com";
    let serverAction = "update-settings";  //
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
    document.getElementById("test").innerHTML = JSON.stringify(formData);
}
