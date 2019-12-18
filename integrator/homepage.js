currenurl = window.location.href
reload = document.getElementById("log")
reload.href = currenurl

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

x = getParams(currenurl)
urlParams = x
w = 'Welcome '+ x['uname'][0].toUpperCase() + x['uname'].slice(1);
disp = document.getElementById("usernameDisp")
disp.innerHTML = w;

var corsURL = ""
corsURL = "https://cors-anywhere.herokuapp.com/"

//var url = "http://127.0.0.1:67";  //Local Running
var url = "ec2-18-218-174-73.us-east-2.compute.amazonaws.com:";  //AWS Running
port = "67"
path = '/api/v1/book'
turl = url + port + path
Url = corsURL + turl

port = "67"
path = '/api/v1/recommend'
turl = url + port + path
PredictUrl = corsURL + turl

port = "67"
path = '/api/v1/cart'
turl = url + port + path
CartUrl = corsURL + turl


nextPage = "search.html?uname=" + x['uname'] + "&query="

function search(){
	text = document.getElementById("searchtext").value
	window.location.href = nextPage+text
}

cartlink = document.getElementById("CartLink")
cartlink.href = "cart.html?uname=" + x["uname"]


function recommend1(){
   setTimeout(recommend, 2000)
}

function recommend(){
    cartUrl = corsURL + url + port + "/api/v1/cart?uname=" + urlParams["uname"];
    console.log(cartUrl)
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", cartUrl, true);
    xhttp.setRequestHeader('Content-type','application/json; charset=utf-8');
    
    xhttp.onreadystatechange = function () {

        if(xhttp.readyState == 4){
            if(xhttp.status == "204"){
              var bookTitle = "Harry Potter"
            }
            else if(xhttp.status == "200"){
              var book = JSON.parse(xhttp.response)
              book = book[book.length-1]
              console.log(book)
              var bookTitle = book.title
            }
            data2 = {"bookname": bookTitle};
            console.log(data2)
            json2 = JSON.stringify(data2);
            console.log(json2)
           var xhttp2 = new XMLHttpRequest();
           xhttp2.open("POST", PredictUrl, true);
           xhttp2.setRequestHeader('Content-type','application/json; charset=utf-8');

           xhttp2.onreadystatechange = function () {

              if(xhttp2.readyState==4 && xhttp2.status==200) {
                var list = xhttp2.response;
              list = JSON.parse(list);
              console.log(list)

              //carousel = document.getElementById('carousel')
              
              for(var i=0;i<list.length;i++) {
                var obj = list[i];
                document.getElementById("item-"+(i+1).toString()).src = obj.image_url
                nextProductPage = "product.html?uname=" + urlParams['uname'] + '&bookid=' + obj.book_id
                document.getElementById("a"+(i+1).toString()).href = nextProductPage
              }
              for(var i=0;i<5-list.length;i++)
              {
                document.getElementById("item-"+(5-i).toString()).style.display = "none"
                document.getElementById("a"+(5-i).toString()).style.display = "none"
              }
              }
           }
           xhttp2.send(json2)
        }

    } 
    xhttp.send();
}

window.onload = recommend1()

