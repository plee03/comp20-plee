/* game.js
 * By Peter Lee
 * 
 * Draws Duck Hunt onto a canvas
 */
function init() {
var bg_canvas = document.getElementById("game_canvas").getContext("2d");
var bg = new Image();
bg.onload = function() {
    bg_canvas.drawImage(bg, 0, 0, 600, 800);
}

bg.src = "duckhunt-background.gif";

var ducks = new Image();
ducks.onload = function() {
    bg_canvas.drawImage(ducks, 0, 110, 40, 40, 300, 200, 100, 100) ;
    bg_canvas.drawImage(ducks, 40, 150, 40, 40, 400, 100, 100, 100) ;

}
    ducks.src = "duckhunt_various_sheet.png";
}
