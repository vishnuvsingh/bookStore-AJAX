from flask import Flask, request, session, Response
from flask_restful import Api, Resource
from flask_session import Session
import re
import base64
import json

import pickle
from sklearn.neighbors import NearestNeighbors
from fuzzywuzzy import fuzz


# Initial Setup

movie_to_index = pickle.load(open('predict/mapper_dict.pkl','rb'))
movie_user_matrix_sparse = pickle.load(open('predict/pivot_df.pkl','rb'))
model_knn = pickle.load(open('predict/knn_model.sav','rb'))


#Flask Setup
app = Flask(__name__)
api = Api(app)

#Session Setup
sess = Session()

def fuzzy_matching(mapper, fav_movie, verbose=True):
    match_tuple = []
    for title, idx in mapper.items():
        title = str(title)
        ratio = fuzz.ratio(title.lower(), fav_movie.lower())
        if ratio >= 50:
            match_tuple.append((title, idx, ratio))
    match_tuple = sorted(match_tuple, key=lambda x: x[2])[::-1]
    if not match_tuple:
        #print('Oops! No match is found')
        #print('Error')
        return -20
    #print('Found possible matches in our database: {0}\n'.format([x[0] for x in match_tuple]))
    return match_tuple[0][1]

def make_recommendation(model_knn, data, mapper, fav_movie, n_recommendations):
    #print('You have input movie:', fav_movie)
    idx = fuzzy_matching(mapper, fav_movie)
    l = []
    if(idx != -20):
        #print('Recommendation system start to make inference')
        #print('\n')
        distances, indices = model_knn.kneighbors(data[idx], n_neighbors=n_recommendations+1)
        raw_recommends = sorted(list(zip(indices.squeeze().tolist(), distances.squeeze().tolist())), key=lambda x: x[1])[:0:-1]
        reverse_mapper = {v: k for k, v in mapper.items()}
        #print('Recommendations for {}:'.format(fav_movie))
        for i, (idx, dist) in enumerate(raw_recommends):
            #print('{0}: {1}, with distance of {2}'.format(i+1, reverse_mapper[idx], dist))
            l.append(idx)
        #print(l)
    return l

class Predict(Resource):

	def post(self):
		data = request.get_json()
		if(not(data)):
			return "", 400
		bname = data.get('bookname')
		l = make_recommendation(model_knn=model_knn, data=movie_user_matrix_sparse, fav_movie=bname, mapper=movie_to_index, n_recommendations=5)
		if(l==[]):
			return "", 204
		else:
			return l, 200

class Test(Resource):

	def get(self):
		return "Working", 200

api.add_resource(Predict, "/api/v1/predict", endpoint="predict")
api.add_resource(Test, "/api/v1/test", endpoint="test")


if __name__ == "__main__":
    app.secret_key = 'super secret key'

    sess.init_app(app)

    app.run(debug=False, host='0.0.0.0', port='68')