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

l = requests.get("http://18.218.174.73:67/api/v1/cart?uname=" + "vishnu")
if(l.status_code == 204):
	d = {"book_id": 2,"title": "Harry Potter and the Sorcerer's Stone (Harry Potter, #1)","original_title": "Harry Potter and the Philosopher's Stone"}
	print(d)
else:
	l = l.json()
	temp = l[0]
	res = dict((k, temp[k]) for k in ['book_id', 'title', 'original_title'] if k in temp)
	print(res)

if __name__ == "__main__":
    app.secret_key = 'super secret key'
    app.config['SESSION_TYPE'] = 'mongodb'

    sess.init_app(app)

    app.run(debug=True)