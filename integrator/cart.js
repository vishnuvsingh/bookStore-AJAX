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
var url = "ec2-18-218-174-73.us-east-2.compute.amazonaws.com:67/api/v1/cart";  //AWS Running

url = corsURL + url


function checkout() {
	window.location.href = "checkout.html?uname=" + urlParams['uname']
}

function delItem() {

	var bookId = document.getElementById("DID").value;
	var cUrl = url + '/' + bookId.toString() + '/' + urlParams['uname'] ;
	
	var xhttp = new XMLHttpRequest()
    xhttp.open("DELETE", cUrl, true);

    xhttp.onreadystatechange = function () {

      if (xhttp.readyState == 4 && xhttp.status == "200") {
        window.location.reload()
      } 
      else if(xhttp.readyState == 4) {
         document.getElementById('inputError').style.display = "block"
      }

    }
    xhttp.send(null);
}


//Load Cart
function loadCart(){

	var cUrl = url + '?uname=' + urlParams['uname'];
	console.log(cUrl);


	var xhttp = new XMLHttpRequest();
	xhttp.open("GET",cUrl,true);

	xhttp.onreadystatechange = function() {

		 if (xhttp.readyState == 4 && xhttp.status == "200") {
		 	var list = xhttp.response;
		 	list = JSON.parse(list);
		 	
		 	for(var i=0;i<list.length;i++){

		 		var obj = list[i];

		 		var table = document.getElementById("cart");
				var row = document.createElement("TR");

				var id = document.createElement("TD");
				var t = document.createTextNode(obj.book_id);
				id.appendChild(t);

				var cover = document.createElement("TD");
				var anchor = document.createElement("A");
				anchor.href = "product.html?uname=" + urlParams['uname'] + "&bookid=" + obj.book_id;
				var img = document.createElement("img");
				img.setAttribute("src", obj.small_image_url);
				anchor.appendChild(img);
				cover.appendChild(anchor);

				var title = document.createElement("TD");
				var k = document.createTextNode(obj.title);
				title.appendChild(k);

				var price = document.createElement("TD");
				price.setAttribute("id","pr");
				price.innerHTML = "&#8377; 499.00";
				//var m = document.createTextNode("&#8377; 499.00");
				//price.appendChild(m);

				row.appendChild(id);
				row.appendChild(cover);
				row.appendChild(title);
				row.appendChild(price);

				table.appendChild(row);

		 	}
		 	// Add subtotal
		 		var total = list.length * 499;
		 		var table1 = document.getElementById("cart");
				var row1 = document.createElement("TR");

				var subtotal = document.createElement("TD");
				var t1 = document.createTextNode("Subtotal :");
				subtotal.appendChild(t1);

				var empty1 = document.createElement("TD");
				var empty2 = document.createElement("TD");

				var total1 = document.createElement("TD");
				total1.setAttribute("id","totalPrice");
				total1.innerHTML = "&#8377; " + total;
				//var m1 = document.createTextNode("&#8377;" + total);
				//total1.appendChild(m1);

				row1.appendChild(subtotal);
				row1.appendChild(empty1);
				row1.appendChild(empty2);
				row1.appendChild(total1);

				table1.appendChild(row1);			

		 }
		 else if(xhttp.readyState == 4)
		 {
		 	var emp = document.getElementById("noElem");
		 	emp.innerHTML = "Your shopping cart is empty.";
		 	document.getElementById('checkout').style.display = "none"
		 }
	}
	xhttp.send()
}
 window.onload = loadCart()



