from flask import Flask, render_template, request, jsonify
from datetime import datetime
from requests import get
from os import getenv
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
bookings = []

@app.route('/api/arrivals/<stop_id>', methods=['GET'])
def arrivals(stop_id):
    response = get(f"https://api.tfl.gov.uk/StopPoint/{stop_id}/Arrivals?app_key={getenv('API_KEY')}")
    return response.json(), 200

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/api/allStops", methods=['GET'])
def allStops():
    lon = request.args.get('lon')
    lat = request.args.get('lat')
    response = get(f"https://api.tfl.gov.uk/StopPoint/?app_key={getenv('API_KEY')}&lon={lon}&lat={lat}&stopTypes=NaptanPublicBusCoachTram&radius=1000")
    if response.status_code == 404:
        return jsonify({"message": "No stops"}), 404
    return response.json(), 200

if __name__ == '__main__':
    app.run(debug=True)
