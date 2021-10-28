from RiotAPI import RiotAPI

def main():    
    # Simple example of accessing the Riot Games API, 
    # just replace the api_key=XXXXXXXXXXXXXXXXXXXXX with your API key
    # response = requests.get('https://REGION_HERE.api.riotgames.com/lol/summoner/v4/summoners/by-name/SUMMONER_NAME_HERE?api_key=YOUR_API_KEY_HERE')

    # Gets player(aka summoner) information using player name
    api = RiotAPI('YOUR API KEY HERE')
    
    #print('10 masters gives: ', api.get_x_masters_names(10, 'solo_duo','summoner_na'))
    # puuid = api.get_puuid_by_name('Biscuit Crusader','summoner_na')
    # matchList = api.get_x_matches_by_puuid(10, puuid, 'match_na')
    # print(api.get_specific_players_match_data(matchList[0], puuid, 'match_na'))
    #print(api.get_participant_data_for_x_matches(matchList, 'match_na'))
    #print(api.get_participant_data_by_match_id(matchList[0], 'match_na'))
    
    # summonerData = api.get_summoner_by_name('SUMMONER NAME HERE')
    # print('summoner by name gives: ', summonerData)
    
    # api.update_region('match_na')
    # matchIDs = api.get_match_ids_by_player_id(summonerData.get('puuid'))
    # print('match ids by puuid gives: ', matchIDs)
    
    # response3 = api.get_match_data_by_match_id(matchIDs[0])
    # print('match data gives: ', response3)
    
    # response = api.get_master_rank_players('solo_duo')
    # print(type(response))
    # print(response.keys())
    # print(response.get('name'))
    # print(response.get('entries')[0])
    
    
    #TRAINING
    
    # get 100 master players
    players = api.get_x_masters_names(10, 'solo_duo', 'summoner_na')
    print('player names added')
    
    # get the player ids for the 100 master players
    playerIds=[]
    for x in range(len(players)):
        print('player_ID added: ', x)
        playerIds.append(
            api.get_puuid_by_name(players[x], 'summoner_na')
            )
    print('Finished adding player ids.')
    
    # get the game ids for the 100 master players    
    playerAndGameIds=[]
    for x in range(len(playerIds)):
        print('Game ids added ', x)
        playerAndGameIds.append({
            'puuid': playerIds[x],
            'matchIds': api.get_x_matches_by_puuid(5, playerIds[x], 'match_na')
        })
    print('Finished adding game ids.')
        
    # learn from the players data
    # Use K-D ratio to determine 
    policy = 0    
    
    for x in playerAndGameIds:
        print('player is ', x['puuid'])
        losses = 0
        wins = 0
        gameStats = {}
        for y in range(len(x['matchIds'])):
            gameStats = api.get_specific_players_match_data(x['matchIds'][y], x['puuid'], 'match_na')
            if gameStats['win'] == True:
                wins+=1
                print('win')
            else:
                losses+=1
                print('loss')
        
        

    
if __name__ == "__main__":
    main()
