const axios = require('axios');

exports.handler = async (event, context) => {
  const apiKey = "RGAPI-50e3a901-6822-487d-ad53-11165f65a852";

  const getRank = (summonerId) => {
    try {
      const rankResponse = axios.get(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${apiKey}`);
      const soloDuoRankInfo = rankResponse.data.find(queue => queue.queueType === 'RANKED_SOLO_5x5');
      return soloDuoRankInfo ? {
        tier: soloDuoRankInfo.tier,
        rank: soloDuoRankInfo.rank,
        leaguePoints: soloDuoRankInfo.leaguePoints,
        wins: soloDuoRankInfo.wins,
        losses: soloDuoRankInfo.losses
      } : null;
    } catch (error) {
      console.error('Error fetching rank info:', error);
      return null;
    }
  };

  const playersData = {};

  try {
    const players = [
      'ECI PURPLE',
      'DontFlameILearn',
      'Møuki',
      'JLRubben',
      'fluff my ball',
      'Retrohime',
      'Ekia',
      'Damasterclass',
      'MTS42z',
      'CriKxS2',
      'Fakemonster',
      'l Tennessee'
    ];

    for (const playerName of players) {
      const encodedName = encodeURIComponent(playerName);
      const summonerData = axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodedName}?api_key=${apiKey}`);
      const summonerId = summonerData.data.id;

      // Utilisez l'ID d'invocateur pour obtenir les informations de rang.
      const rankInfo = getRank(summonerId);

      // Si rankInfo est null, cela signifie que le joueur n'a pas de classement en solo/duo ou qu'une erreur s'est produite.
      if (rankInfo) {
        playersData[playerName] = {
          summonerId: summonerId,
          wins: rankInfo.wins, // Nombre total de victoires en solo/duo queue.
          losses: rankInfo.losses, // Nombre total de défaites en solo/duo queue.
          winrate: ((rankInfo.wins / (rankInfo.wins + rankInfo.losses)) * 100).toFixed(2), // Calcul du taux de victoire.
          rank: rankInfo, // Informations de classement en solo/duo queue.
        };
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(playersData),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
