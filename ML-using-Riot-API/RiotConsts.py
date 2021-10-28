#Credit to SNAP on youtube for his tutorial: https://youtu.be/0NycEiHOeX8

URL = {
    'base': 'https://{proxy}.api.riotgames.com{url}',
    'summoner_by_name': '/lol/summoner/v{version}/summoners/by-name/{summonerNames}',
    'match_ids_by_player_id': '/lol/match/v{version}/matches/by-puuid/{playerID}/ids',
    'match_data_by_match_id': '/lol/match/v{version}/matches/{matchID}',
    'master_league_players': '/lol/league/v4/masterleagues/by-queue/{queue}'
}

API_VERSIONS = {
    'summoner': '4',
    'match' : '5'
}

REGIONS = {
    'summoner_na':  'na1',
    'match_na': 'americas'   
}

QUEUES = {
    'solo_duo': 'RANKED_SOLO_5x5',
    'summoners_rift': 'RANKED_FLEX_SR',
    'twisted_treeline': 'RANKED_FLEX_TT'
}
