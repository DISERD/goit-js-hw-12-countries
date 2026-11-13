const BASE_URL = 'https://api.restcountries.com/countries/v5/name';

const API_KEY = 'rc_live_99ffd2491f7c4d4f8663133c24fd6057';

export default function fetchCountries(searchQuery) {
  const params = new URLSearchParams({
    q: searchQuery.trim(),
    limit: '11',
    response_fields:
      'names.common,capitals,population,languages,flag.emoji,flag.url_svg,flag.description',
  });

  return fetch(`${BASE_URL}?${params}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  }).then(async response => {
    const result = await response.json();

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      const errorMessage = result.errors
        ?.map(error => error.message)
        .join(' ');

      throw new Error(errorMessage || `HTTP error: ${response.status}`);
    }

    return result.data?.objects || [];
  });
}
