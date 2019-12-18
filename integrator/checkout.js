var getParams = function (url) {
  var params = {};
  var parser = document.createElement('a');
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
};

currenturl = window.location.href

urlParams = getParams(currenturl)

cartlink = document.getElementById("CartLink")
cartlink.href = "cart.html?uname=" + urlParams["uname"]
logo = document.getElementById("log")
logo.href = "homepage.html?uname=" + urlParams["uname"]

searchPage = "search.html?uname=" + urlParams['uname'] + "&query="

function search(){
	text = document.getElementById("searchtext").value
	window.location.href = searchPage + text
}


var corsURL = ""
corsURL = "https://cors-anywhere.herokuapp.com/"
//var url = "http://127.0.0.1:67";  //Local Running
var url = "ec2-18-218-174-73.us-east-2.compute.amazonaws.com:67";  //AWS Running
url = corsURL + url
cart = "/api/v1/cart/"
cUrl = url + cart

function deleteCart(){
    cUrl = cUrl + urlParams['uname']
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", cUrl, true);
    xhttp.setRequestHeader('Content-type','application/json; charset=utf-8');

    xhttp.onreadystatechange = function () {

        if (xhttp.readyState == 4 && xhttp.status == "200") {
            console.log("ok")
        } 

        else if(xhttp.readyState == 4) {
         console.log(xhttp.status + " : " + xhttp.statusText + " : " + xhttp.responseText);
        }

    }
    xhttp.send();
}

window.onload = deleteCart()





