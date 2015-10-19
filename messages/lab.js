function parse() {
    var messages_json = new XMLHttpRequest();
    messages_json.onload = function() {
        console.log(messages_json.responseText);
    };
    messages_json.open("GET", "data.json"); 
    messages_json.send();
}
