function parse() {
    var messages_json = new XMLHttpRequest();
    messages_json.onreadystatechange = function() {
        if (messages_json.readyState == 4 && messages_json.status == 200 ) {
            var parsed_mes = JSON.parse(messages_json.responseText)
            messages = document.getElementById("messages");
            for (count = 0; count < parsed_mes.length; count++) {
                messages.innerHTML += parsed_mes[count]["content"] + " " + 
                                      parsed_mes[count]["username"] + "</br>"
            }
        }
    };
    messages_json.open("GET", "http://messagehub.herokuapp.com/messages.json"); 
    messages_json.send();
}
