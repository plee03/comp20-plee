function parse() {
    var messages_json = new XMLHttpRequest();
    messages_json.onload = function() {
        messages_json.response;
    };
    messages_json.open("GET", "data.json"); 
}
