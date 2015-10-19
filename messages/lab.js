function parse() {
    var messages_json = new XMLHttpRequest();
    messages_json.onload = function() {
        var jsondata = JSON.parse(messages_json.responseText)
        console.log(jsondata);
    };
    messages_json.open("GET", "data.json"); 
    messages_json.send();
}
