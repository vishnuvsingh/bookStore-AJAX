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
	text = document.getElementById("SearchKey").value
	window.location.href = searchPage + text
}
function search2(){
	text = document.getElementById("searchtext").value
	window.location.href = searchPage + text
}

titlespan = document.getElementById("searchtitle")
titlespan.innerHTML = urlParams['query']






var corsURL = ""
corsURL = "https://cors-anywhere.herokuapp.com/"


//var url = "http://127.0.0.1:67";  //Local Running
var url = "ec2-18-218-174-73.us-east-2.compute.amazonaws.com:67/api/v1/search";  //AWS Running

Url = corsURL + url

cname ="";

div = document.getElementById('noElem')

//Search Results
function searchResults() {

	var data = {"bookname": urlParams["query"]};
	//console.log(data)
    var json = JSON.stringify(data);

	var xhttp = new XMLHttpRequest();
	xhttp.open("POST",Url,true);
	xhttp.setRequestHeader('Content-type','application/json; charset=utf-8');


	xhttp.onreadystatechange = function() {

		//console.log('hi')

		 if (xhttp.readyState == 4 && xhttp.status == "200") {
		 	var list = xhttp.response;
		 	list = JSON.parse(list);
		 	console.log(list)

		 	//Create table and add coloumn names

			var table = document.createElement("TABLE");
    		table.setAttribute("id","searchTab");

			var headrow =  document.createElement("TR");

		 	var headCover = document.createElement("TH");
		 	var t = document.createTextNode("Cover");
			headCover.appendChild(t);

	 		var headTitle = document.createElement("TH");
		 	var q = document.createTextNode("Title and Author Details");
		 	headTitle.appendChild(q);

			var headPrice = document.createElement("TH");
	 		headPrice.setAttribute("id","pri");
	 		var l = document.createTextNode("Price");
		 	headPrice.appendChild(l);

			headrow.appendChild(headCover);
			headrow.appendChild(headTitle);
			headrow.appendChild(headPrice);

			table.appendChild(headrow);

			div.appendChild(table)


		 	for(i=0;i<list.length;i++){
		 		console.log(list[i])
		 		var obj = list[i];
		 		//console.log(obj)
		 		var row = document.createElement("TR");

				var cover = document.createElement("TD");
				var anchor = document.createElement("A");
				anchor.href = "product.html?uname=" + urlParams['uname'] + "&bookid=" + obj.book_id;
				var img = document.createElement("img");
				img.setAttribute("src", obj.small_image_url);
				anchor.appendChild(img);
				cover.appendChild(anchor);

				var title = document.createElement("TD");
				var br = document.createElement("DIV");
				br.innerHTML = obj.title + "<br/><br/>" + "by " + obj.authors
				title.appendChild(br);


				var price = document.createElement("TD");
				price.setAttribute("id","pr");
				var m = document.createTextNode("499.00");
				price.appendChild(m);

				row.appendChild(cover);
				row.appendChild(title);
				row.appendChild(price);

				table.appendChild(row);


		 	}

		 }

		 else if(xhttp.readyState == 4 && xhttp.status == "204")
		 {
		 	div.innerHTML = "Sorry, no results found!<br>Please check the spelling or try searching for something else.";
		 }

	}
	xhttp.send(json)
}	

window.onload = searchResults()




