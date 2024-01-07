const axios = require('axios');

exports.handler = async (event, context) => {
  const apiKey = "RGAPI-50e3a901-6822-487d-ad53-11165f65a852";

  const getRank = async (summonerId) => {
    try {
      const rankResponse = await axios.get(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${apiKey}`);
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

    const requestsPerSecond = 20; // Number of requests to make per second
    const rateLimit = 1000 / requestsPerSecond; // Calculate the delay in milliseconds

    for (const playerName of players) {
      const encodedName = encodeURIComponent(playerName);
      const summonerData = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodedName}?api_key=${apiKey}`);
      const summonerId = summonerData.data.id;

      // Utilize the ID to get ranking information.
      const rankInfo = await getRank(summonerId);

      // If rankInfo is null, it means the player has no ranking in solo/duo or an error occurred.
      if (rankInfo) {
        playersData[playerName] = {
          summonerId: summonerId,
          wins: rankInfo.wins, // Total wins in solo/duo queue.
          losses: rankInfo.losses, // Total losses in solo/duo queue.
          winrate: ((rankInfo.wins / (rankInfo.wins + rankInfo.losses)) * 100).toFixed(2), // Win rate calculation.
          rank: rankInfo, // Ranking information in solo/duo queue.
        };
      }

      // Pause for the rate limit to avoid overloading the API.
      await delay(rateLimit);
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

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
