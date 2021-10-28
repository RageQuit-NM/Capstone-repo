#Credit to SNAP on youtube for his tutorial: https://youtu.be/0NycEiHOeX8

import requests
import RiotConsts as Consts

class RiotAPI(object):
    
    """ UTILITY FUNCTIONS """
    def __init__(self, api_key, region=Consts.REGIONS['summoner_na']):
        self.api_key = api_key
        self.region = region
    
    
    def update_region(self, region):
        # update the region the requests should be directed towards
        self.region = Consts.REGIONS[region]
        
    """ QUERYING FUNCTIONS """
    def _request(self, api_url, params={}):
        # Format the generic portion of the request and return the response.
        args = {'api_key': self.api_key}
        for key, value in params.items():
            if key not in args:
                args[key] = value
             
        response = requests.get(
            Consts.URL['base'].format(
                proxy=self.region,
                url=api_url  
            ),
            params = args
        )
        return response.json()
    
    
    def get_summoner_by_name(self, name, params={}):
        # Get information about a single summoner by name in a {dictionary} (a summoner is a LOL player) 
        api_url = Consts.URL['summoner_by_name'].format(
            version=Consts.API_VERSIONS['summoner'],
            summonerNames=name
        )
        return self._request(api_url, params)
    

    def get_match_ids_by_player_id(self, player_id, params={}):
        # Get a [list] of match ID's for a given player using their player ID (puuid)
        api_url = Consts.URL['match_ids_by_player_id'].format(
            version = Consts.API_VERSIONS['match'],
            playerID = player_id
        )
        return self._request(api_url, params)
    

    def get_match_data_by_match_id(self, match_id, params={}):
        # Get the data for a specific match by match ID in a {dictionary}
        api_url = Consts.URL['match_data_by_match_id'].format(
            version = Consts.API_VERSIONS['match'],
            matchID = match_id
        )
        return self._request(api_url, params)


    def get_master_players(self, chosen_queue, params={}):
        # Get a list of all master ranked players in the selected queue, formatted as a {dictionary} of {dictionaries}
        api_url = Consts.URL['master_league_players'].format(
            queue = Consts.QUEUES[chosen_queue]
        )
        return self._request(api_url, params)
   
   
    """ TASK FUNCTIONS """
    def get_x_masters_names(self, num, queue=Consts.QUEUES['solo_duo'], region=Consts.REGIONS['summoner_na']):
        # Get a [list] of only the names of x (num) master players
        self.update_region(region)
        response = self.get_master_players(queue)
        nameList = []
        for x in range(num):
            nameList.append(response['entries'][x]['summonerName'])
        return nameList
    
    
    def get_puuid_by_name(self, name, region=Consts.REGIONS['summoner_na']):
        # Get a summoners player ID (puuid) by their summoner name
        self.update_region(region)
        response = self.get_summoner_by_name(name)
        if 'puuid' in response:
            return response['puuid']
        else:
            print('ERROR: No puuid available for player ', name)
    
    
    def get_x_matches_by_puuid(self, num, puuid, region=Consts.REGIONS['match_na']):
        # Get a [list] of match id's of x (num) matches using player ID (puuid)
        self.update_region(region)
        params={
            'count': str(num)
            }
        return self.get_match_ids_by_player_id(puuid, params)
    
    
    def get_participant_data_by_match_id(self, match_id, region=Consts.REGIONS['match_na']):
        # Get a [list] of game data for each participant from a specific game
        self.update_region(region)
        result = self.get_match_data_by_match_id(match_id)['info']['participants']
        participantData = []
        for x in range(len(result)):
            participantData.append({
                'puuid': result[x]['puuid'],
                'kills': result[x]['kills'],
                'deaths': result[x]['deaths'],
                'assists': result[x]['assists'],
                'win': result[x]['win']
                    })
        return participantData
    
    
    def get_participant_data_for_x_matches(self, match_ids, region=Consts.REGIONS['match_na']):
        # Get data for all participants of x matches
        # Relies on get_participant_data_by_match_id, this is bad practice but it will make things easier
        self.update_region(region)
        participantData = []
        for x in range(len(match_ids)):
            participantData.append(
                self.get_participant_data_by_match_id(match_ids[x], region)
            )
        return participantData
    
    
    def get_specific_players_match_data(self, match_id, puuid, region=Consts.REGIONS['match_na']):
        # Get match data for a single player by puuid, returns data as a {dictionary}
        # Relies on get_participant_data_by_match_id, this is bad practice but it will make things easier
        self.update_region(region)
        matchData = self.get_participant_data_by_match_id(match_id, region)
        for x in range(len(matchData)):
            if matchData[x]['puuid']==puuid:
                return matchData[x]
        return 'PLAYER_NOT_FOUND'
        