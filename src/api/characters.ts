import axios from 'axios';

const BASE_URL = 'https://swapi.py4e.com/api';


// Helper to fetch homeworld name
const getHomeworldName = async (url: string) => {
  try {
    const { data } = await axios.get(url);
    return data.name;
  } catch {
    return 'Unknown';
  }
};

// Helper to fetch species name
const getSpeciesName = async (urls: string[]) => {
  if (!urls || urls.length === 0) return 'unknown';
  try {
    const { data } = await axios.get(urls[0]);
    return data.name;
  } catch {
    return 'unknown';
  }
};

// Helper to get character image from akabab/starwars-api all.json
let starWarsImagesCache: any[] | null = null;
const getStarWarsImageFromAllJson = async (name: string) => {
  if (!starWarsImagesCache) {
    const { data } = await axios.get('https://raw.githubusercontent.com/akabab/starwars-api/master/api/all.json');
    starWarsImagesCache = data;
  }
  if (!starWarsImagesCache) return 'https://starwars-visualguide.com/assets/img/placeholder.jpg';
  const char = starWarsImagesCache.find((c: any) => c.name === name);
  return char ? char.image : 'https://starwars-visualguide.com/assets/img/placeholder.jpg';
};

export const fetchCharacters = async (page: number = 1) => {
  const { data } = await axios.get(`${BASE_URL}/people?page=${page}`);
  const results = await Promise.all(
    data.results.map(async (character: any) => {
      const homeworld = await getHomeworldName(character.homeworld);
      const species = await getSpeciesName(character.species);
      const image = await getStarWarsImageFromAllJson(character.name);
      return {
        id: Number(character.url.split('/').filter(Boolean).pop()),
        name: character.name,
        image,
        status: 'unknown',
        species,
        gender: character.gender,
        location: { name: homeworld },
        origin: { name: homeworld },
        firstSeen: 'A New Hope', // Placeholder
      };
    })
  );
  return {
    results,
    info: {
      pages: Math.ceil(data.count / 10),
    },
  };
};

export const fetchCharacterById = async (id: string) => {
  const { data } = await axios.get(`${BASE_URL}/people/${id}`);
  const homeworld = await getHomeworldName(data.homeworld);
  const species = await getSpeciesName(data.species);
  const image = await getStarWarsImageFromAllJson(data.name);
  return {
    id: Number(id),
    name: data.name,
    image,
    status: 'unknown',
    species,
    gender: data.gender,
    location: { name: homeworld },
    origin: { name: homeworld },
    firstSeen: 'A New Hope', // Placeholder
  };
};
