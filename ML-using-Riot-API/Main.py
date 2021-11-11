from RiotAPI import RiotAPI

def main():    
    # Simple example of accessing the Riot Games API, 
    # just replace the api_key=XXXXXXXXXXXXXXXXXXXXX with your API key
    # response = requests.get('https://REGION_HERE.api.riotgames.com/lol/summoner/v4/summoners/by-name/SUMMONER_NAME_HERE?api_key=YOUR_API_KEY_HERE')

    # Gets player(aka summoner) information using player name
    api = RiotAPI('YOUR_KEY_HERE')
    
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
    
    # get x master players
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
    
    # get the puuid and all games data stored in a [list] of {dictionaries}
    playerAndGameData=[]
    for x in range(len(playerIds)):
        matchDataList=[]
        for y in range(len(playerAndGameIds[x]['matchIds'])):
            matchDataList.append(api.get_specific_players_match_data(playerAndGameIds[x]['matchIds'][y], playerAndGameIds[x]['puuid'], 'match_na'))
        playerAndGameData.append({
            'puuid': playerIds[x],
            'matchData': matchDataList
            })
        print('done getting data for player: ', x)
         
    print('Finished adding game data.')   
    print(playerAndGameData)
     
    # learn from the players data
    # Use K-D ratio to determine 
    policy = .5    
    
    for x in range(len(playerAndGameIds)):
        print('player is ', playerAndGameData[x]['puuid'])
        losses = 0
        wins = 0
        gameStats = {}
        for y in range(len(playerAndGameData[x]['matchData'])-1):
            gameStats = playerAndGameData[x]['matchData'][y]
            if gameStats['win'] == True:
                wins+=1
                print('win')
            else:
                losses+=1
                print('loss')
        finalGameStats = playerAndGameData[x]['matchData'][-1]
        if losses > 0:# Policy generation is poor atm
            wlRatio = wins/losses
        else:
            wlRatio = wins
        
        if wlRatio > 0:
            policy = policy * 0.85 + 0.15 * wlRatio    
        
            
        
        print('Final policy is: ', policy)

    # Make a guess
    correctGuesses = 0
    for x in range(len(playerAndGameIds)):
        print('player is ', playerAndGameIds[x]['puuid'])
        gameStats = {}
        for y in range(len(playerAndGameIds[x]['matchIds'])-1):
            gameStats = playerAndGameData[x]['matchData'][y]
            if gameStats['win'] == True:
                wins+=1
                print('G_win')
            else:
                losses+=1
                print('G_loss')
        if losses > 0:
            wlRatio = wins/losses
        else:
            wlRatio = wins
        
        if wlRatio <= policy:
            guess = True
        else:
            guess = False
        finalGameStats = playerAndGameData[x]['matchData'][-1]
        if guess == finalGameStats['win']:
            correctGuesses += 1
        print('Number of correct guesses: ', correctGuesses, ' out of: ', len(playerAndGameIds))
        print('Guess was: ', guess, ' and result was: ', gameStats['win'], ' the wlRatio is: ', wlRatio)    
    
    
if __name__ == "__main__":
    main()
