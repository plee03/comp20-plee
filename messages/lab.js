function parse() {
    var messages_json = new XMLHttpRequest();
    messages_json.onload = function() {
        var parsed_mes = JSON.parse(messages_json.responseText)
        messages = document.getElementById("messages");
        for (count = 0; count < parsed_mes.length; count++) {
            messages.innerHTML += parsed_mes[count]["content"] + " "
                                  parsed_mes[count]["username"] + "</br>"
    };
    messages_json.open("GET", "data.json"); 
    messages_json.send();
}
