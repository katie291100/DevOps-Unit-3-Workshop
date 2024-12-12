from requests import get
from dotenv import load_dotenv
from os import getenv

def get_bus_arrival_times(stop_id: int) -> list:

    response = get(f"https://api.tfl.gov.uk/StopPoint/{stop_id}/Arrivals?app_key={getenv('API_KEY')}")
    return response

if __name__ == "__main__":
    # load .env file for apikey
    load_dotenv()

    response = get_bus_arrival_times("490012553B")
    print(response.json())

    