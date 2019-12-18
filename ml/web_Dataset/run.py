import csv
import json
import requests

filename = 'bookS_drop.csv'

fields = []
i=0

l = []
temp = {}

with open(filename, 'r') as csvfile: 
    csvreader = csv.reader(csvfile)
    for row in csvreader:
    	if(i==0):
    		fields = row
    		i += 1
    		continue
    	for k in range(len(row)):
    		temp[fields[k]] = row[k]
    	l.append(json.dumps(temp))


print(fields)
print(l[5])

url = 'http://18.218.174.73:68/api/v1/book'

for i in range(len(l)):
	x = requests.post(url, json=l[i])
	print(i)