'''
import requests

url = "https://tile.openstreetmap.org/5/19/9.png"
response = requests.get(url)

with open("map_tile.png", "wb") as f:
    f.write(response.content)


'''

'''
from urllib import request
# Define the remote file to retrieve
remote_url = 'https://tile.openstreetmap.org/5/19/9.png'
# Define the local filename to save data
local_file = 'local_copy.png'
# Download remote and save locally
request.urlretrieve(remote_url, local_file)
'''



import subprocess


def run(scale,x,y):
    print(scale,x,y)
    cmd = f'Invoke-WebRequest -UseBasicParsing -Uri "https://b.tile.openstreetmap.org/{scale}/{x}/{y}.png" -OutFile "m_file_{scale}_{x}_{y}.png"'
    print(cmd)
    completed = subprocess.run(["powershell", "-Command", cmd], capture_output=True)
    return completed


dataset = [
    {"scale":5,"start":(18,9),"end":(19,9)},
    {"scale":6,"start":(37,18),"end":(37,18)},
    {"scale":8,"start":(148,73),"end":(149,75)},
    {"scale":9,"start":(298,148),"end":(300,150)},
    {"scale":10,"start":(594,293),"end":(602,301)},
    {"scale":11,"start":(1195,590),"end":(1120,600)},
    {"scale":12,"start":(2390,1189),"end":(2394,1196)},
    {"scale":13,"start":(4780,2380),"end":(4794,2390)},
    {"scale":14,"start":(9563,4757),"end":(9584,4780)},
    {"scale":15,"start":(19127,9515),"end":(19168,9565)},
    {"scale":16,"start":(19127,9515),"end":(19168,9565)},
    
    
]

if __name__ == '__main__':
    for i in dataset:
        print("scale = "+str(i["scale"]))
        # print([i for i in range(i['start'][0],i[''][1]+1)])
        for x in range(i['start'][0],i['end'][0]+1):
            print(str(x-i['start'][0])+'/'+str(i['end'][0]-i['start'][0]))
            for y in range(i['start'][1],i['end'][1]+1):
                hello_info = run(i['scale'],x,y)
