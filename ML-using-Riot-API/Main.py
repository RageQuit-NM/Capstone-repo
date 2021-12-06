from RiotAPI import RiotAPI
from random import randrange
import json
import time

def main():    
    # Simple example of accessing the Riot Games API, 
    # just replace the api_key=XXXXXXXXXXXXXXXXXXXXX with your API key
    # response = requests.get('https://REGION_HERE.api.riotgames.com/lol/summoner/v4/summoners/by-name/SUMMONER_NAME_HERE?api_key=YOUR_API_KEY_HERE')

    # Gets player(aka summoner) information using player name
    api = RiotAPI('your api key here')
    
    infinite = 0
    while infinite == 0:
        print('STARTING')
        # Get 4 game IDs for 10 puuids from the same game to use for the episode
        # This will increase diversity of in game roles.
        # 4 QUERIES
        firstPlayerName = api.get_x_masters_names(99, 'solo_duo', 'summoner_na')
        masterIndex = randrange(99)
        firstPlayerName[0] = firstPlayerName[masterIndex]
        print('Masters name is: ', firstPlayerName[0])
        firstPlayerID = api.get_puuid_by_name(firstPlayerName[0], 'summoner_na')
        print('Masters ID is: ', firstPlayerID[0])
        firstMatchID = api.get_x_matches_by_puuid(1, firstPlayerID, 'match_na')
        allPlayerIDs = api.get_all_puuids_from_match_id(firstMatchID[0], 'match_na')
        print('All players are added', allPlayerIDs)   
        playersAndGameIds=[]
        for x in range(len(allPlayerIDs)):
            print('Game ids added ', x)
            playersAndGameIds.append({
                'puuid': allPlayerIDs[x],
                'matchIds': api.get_x_matches_by_puuid(4, allPlayerIDs[x], 'match_na')
            })
        print('All games are added', playersAndGameIds)
        
        # file = open("memory.txt", "r")
        # memoryContent = file.read()
        
        with open('memory.txt') as inFile:
            winLossNumber = json.load(inFile)
        print(winLossNumber)
        
        # winLossNumber = {'0': {'win': 0, 'loss': 0}, '1': {'win': 0, 'loss': 0}, '2': {'win': 0, 'loss': 0}, '3': {'win': 0, 'loss': 0}}
        
        
        
        
        
        
    
        goodGoldScore = 12000
        goodKDR = 1.5
        policy = 0
        success_tally = 0
        wl_tally = 0
        for player in playersAndGameIds:
            print('player is ', player['puuid'])
            perfRating = []
            winList = []
            wins = 0
            for ID in player['matchIds']:
                gameStats = api.get_specific_players_match_data(ID, player['puuid'], 'match_na')
                
                kills = gameStats["kills"]
                deaths = gameStats["deaths"]
                assists = gameStats["assists"]
                goldEarned = gameStats["goldEarned"]
                win = gameStats["win"]
                matchRating = 0
                
                # Kill death rating
                if deaths <= 0:
                    deaths = 1
                kdr = (kills + assists * 0.05) / deaths
                # kdr = kdr * (kdr/goodKDR)

                # Gold rating
                goldRating = goldEarned/12000
                #goldRating = goldRating * (goldRating/goodGoldScore)
                
                # Calculate a performance rating for this match and attach it to the list
                # if goldRating > kdr:
                #     matchRating = goldRating
                # else:
                #     matchRating = kdr
                matchRating = kdr
                if matchRating > 2:
                    matchRating = 2
                perfRating.append(matchRating)
                winList.append(win)
                
                if win == True and len(winList) < 4:
                    wins += 1
                
                # if win == True:
                #     goodGoldScore = goodGoldScore*0.85 + goldEarned*0.15
                
                print(gameStats)
                print(matchRating)
            

            
            if winLossNumber[str(wins)]['win'] >= winLossNumber[str(wins)]['loss']:
                wlPredict = True
            else:
                wlPredict = False
            if wlPredict == winList[-1]:
                wl_tally += 1
            print('wl_tally is: ', wl_tally)            
            
            print('goodGoldScore is: ', goodGoldScore, ' goodKDR is: ', goodKDR)
            averageRating = perfRating[0]*0.3 + perfRating[1]*0.4 + perfRating[2]*0.3
            averageRating = averageRating - 0.1*averageRating
        
            if (1 - perfRating[-1]/averageRating) < 0.35 and (1 - perfRating[-1]/averageRating) > -0.35:
                success_tally += 1
            print('Policy is: ', policy, ' Last game rating is: ', perfRating[-1], ' Average rating is: ', averageRating, ' Last game win is: ', winList[-1], " Success tally: ", success_tally) 
            print('\n')
            
            if winList[-1]==True:    
                winLossNumber[str(wins)]['win'] += 1
            else:
                winLossNumber[str(wins)]['loss'] += 1 
        
        with open('memory.txt', 'w') as outfile:
            json.dump(winLossNumber, outfile)

        time.sleep(120)
    
if __name__ == "__main__":
    main()
