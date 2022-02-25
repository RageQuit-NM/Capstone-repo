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
    document.getElementById("test").innerHTML = JSON.stringify(formData);
}


