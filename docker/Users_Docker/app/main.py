#Library Imports

from flask import Flask, request, session, Response
from flask_restful import Api, Resource
from flask_pymongo import PyMongo
from flask_session import Session
import re
import base64
import json
import pickle
from fuzzywuzzy import fuzz
import requests


# Initial Setup


#Flask Setup
app = Flask(__name__)
api = Api(app)

#Session Setup
sess = Session()

#MongoDB Setup
app.config["MONGO_URI"] = "mongodb://18.218.174.73:27017/test"
mongo = PyMongo(app)

def convertCursor(info):
    data = []
    for x in info:
        data.append(x)
    return data	

def strip(data):
    temp = data[0]['username']
    passtemp = data[0]['password']
    d = {'username': temp, 'password': passtemp}
    return d

def checkSHA1(password):
    try:
        temp = int(password,16)
    except:
        return False
    if(len(password)==40):
        return True
    else:
        return False


#Login Class

class Login(Resource):

	def post(self):
		data = request.get_json()

		if(not(data)):
			return "ERROR", 400

		else:

			uname = data.get('username')
			password = data.get('password')

			if(not(uname and password)):
				return "Enter Valid Credentials", 400

			else:

				x = mongo.db.user.find({'username': uname, 'password': password})
				y = convertCursor(x)

				if(y==[]):
					return "Enter Valid Credential", 405

				else:
					return {}, 200


# User Class

class User(Resource):

	def get(self, uname=None):
		if(uname):
			return "", 405
		user_info = mongo.db.user.find({}, {"_id": 0, "update_time": 0})
		user_list = []
		for user in user_info:
			user_list.append(user["username"])
		if(user_list == []):
			return "No Users", 204
		return user_list, 200


	
	def post(self, uname=None):
		if(uname):
			return "", 405
		data = request.get_json()
		if(not(data)):
			return "ERROR", 400
		else:
		    uname = data.get('username')
		    password = data.get('password')
		    if(uname and password):
		        if(checkSHA1(password)):
		            x = mongo.db.user.find({'username': uname})
		            y = convertCursor(x)
		            if(y!=[]):
		                return "username already exists.", 405
		            else:
		                mongo.db.user.insert_one(data)
		                return {}, 201
		        else:
		        	return "password is not SHA", 400
		    else:
		    	return "username or password missing", 400
		        

	def delete(self, uname=None):
		data = []
		if(uname):
			user_info = mongo.db.user.find({"username": uname})
			data = convertCursor(user_info)
			if(data==[]):
			    return 'user not found', 405
			else:
			    data = strip(data)
			    r = mongo.db.user.remove({"username": uname})
			    return {}, 200
		else:
			return "username missing", 400


class Test(Resource):

	def get(self):
		return "Working", 200


class Book(Resource):

	def post(self):
		data = request.get_json()

		if(not(data)):
			return "ERROR", 400

		else:

			bookid = data.get('book_id')
			
			if(not(bookid)):
				return "Enter Valid Book id", 400

			else:

				book_info = mongo.db.books.find({'book_id': int(bookid)})
				y = convertCursor(book_info)
				if(y==[]):
					return "Enter Valid book_id", 405
				temp = y[0]
				del temp['_id']
				return temp, 200



movie_to_index = pickle.load(open('mapper_dict.pkl','rb'))

def fuzzy_matching(fav_movie, mapper = movie_to_index, verbose=True):
    match_tuple = []
    for title, idx in mapper.items():
        title = str(title)
        ratio = fuzz.ratio(title.lower(), fav_movie.lower())
        if ratio >= 50:
            match_tuple.append((title, idx, ratio))
    match_tuple = sorted(match_tuple, key=lambda x: x[2])[::-1]
    if not match_tuple:
        return -20
    l = []
    for i in match_tuple:
    	l.append(i[1])
    return l

class Search(Resource):

	def post(self):
		data = request.get_json()

		if(not(data)):
			return "ERROR", 400

		else:

			bookname = data.get('bookname')
			
			if(not(bookname)):
				return "Enter Valid Book name", 400

			else:
				books_info = []
				books = fuzzy_matching(bookname)
				if(books == -20):
					return "", 204
				for idb in books:
					info = mongo.db.books.find({'book_id': int(idb)})
					y = convertCursor(info)
					if(y==[]):
						continue
					temp = y[0]
					res = dict((k, temp[k]) for k in ['book_id', 'title', 'authors', 'small_image_url'] if k in temp)
					books_info.append(res)
				return books_info, 200


class Cart(Resource):

	def get(self, bookid=None):
		username = request.args.get('uname')
		if(bookid):
			return "", 405
		if(not(username)):
			return "", 405
		cart_info = mongo.db.cart.find({'username': username})
		temp = convertCursor(cart_info)
		if(temp==[]):
			return "",204
		cart_list = temp[0]['items']
		if(cart_list == []):
			return "", 204
		books_info = []
		for idb in cart_list:
			info = mongo.db.books.find({'book_id': int(idb)})
			y = convertCursor(info)
			if(y==[]):
				continue
			temp = y[0]
			res = dict((k, temp[k]) for k in ['book_id', 'title', 'authors', 'small_image_url'] if k in temp)
			books_info.append(res)
		return books_info, 200


	def post(self, bookid=None):
		if(bookid):
			return "", 405
		data = request.get_json()
		if(not(data)):
			return "ERROR", 400
		else:
		    bookid = data.get('book_id')
		    username = data.get('username')
		    if(bookid and username):
		    	x = mongo.db.cart.find({'username': username})
		    	y = convertCursor(x)
		    	if(y==[]):
		    		indata = {"username": username, "items": [bookid]}
		    		mongo.db.cart.insert_one(indata)
		    		return {}, 201
		    	else:
		    		l = y[0]['items']
		    		l.append(bookid)
		    		mongo.db.cart.update_one({'username': username}, {"$set": {"items": l}})
		    		return {}, 201
		    else:
		    	return "", 405

		        

	def delete(self, bookid=None, uname=None):
		data = []
		if(bookid and uname):
			user_info = mongo.db.cart.find({"username": uname})
			data = convertCursor(user_info)
			if(data==[]):
			    return 'user not found', 405
			else:
			    l = data[0]['items']
			    l.remove(int(bookid))
			    mongo.db.cart.update_one({'username': uname}, {"$set": {"items": l}})
			    return {}, 200
		else:
			return "username missing", 400


class CartAll(Resource):

	def delete(self, uname=None):
		data = []
		if(uname):
			user_info = mongo.db.cart.find({"username": uname})
			data = convertCursor(user_info)
			if(data==[]):
			    return 'user not found', 405
			else:
			    r = mongo.db.cart.remove({"username": uname})
			    return {}, 200
		else:
			return "username missing", 400



class Recommend(Resource):

	def post(self):
		data = request.get_json()
		if(not(data)):
			return "", 400
		l = requests.post("http://18.218.174.73:68/api/v1/predict", json=data)
		l = l.json()
		books_info = []
		for idb in l:
			info = mongo.db.books.find({'book_id': int(idb)})
			y = convertCursor(info)
			if(y==[]):
				continue
			temp = y[0]
			res = dict((k, temp[k]) for k in ['book_id', 'image_url'] if k in temp)
			books_info.append(res)
		return books_info, 200




# Resources for User


api.add_resource(Login, "/api/v1/login", endpoint="login")

api.add_resource(User, "/api/v1/users", endpoint="add user")
api.add_resource(User, "/api/v1/users/<string:uname>", endpoint="delete")

api.add_resource(Book, "/api/v1/book", endpoint="add book")

api.add_resource(Test, "/api/v1/test", endpoint="test")

api.add_resource(Search, "/api/v1/search", endpoint="seach book")

api.add_resource(Cart, "/api/v1/cart", endpoint="add cart")
api.add_resource(Cart, "/api/v1/cart/<string:bookid>/<string:uname>", endpoint="delete cart")
api.add_resource(CartAll, "/api/v1/cart/<string:uname>", endpoint="delete all cart")

api.add_resource(Recommend, "/api/v1/recommend", endpoint="recommend")


# Run the App
if __name__ == "__main__":
    app.secret_key = 'super secret key'
    app.config['SESSION_TYPE'] = 'mongodb'

    sess.init_app(app)

    app.run(debug=True)