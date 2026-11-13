import debounce from 'lodash.debounce';
import { error, info } from '@pnotify/core';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import 'modern-normalize/modern-normalize.css';
import fetchCountries from './fetchCountries';

const searchInput = document.querySelector('.search-input');
const countryList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');

const DEBOUNCE_DELAY = 500;

let requestId = 0;

function showError(message) {
  error({
    title: 'Error',
    text: message,
  });
}

searchInput.addEventListener('input', () => {
  requestId++;
  countryList.innerHTML = '';
  countryInfo.innerHTML = '';
  debouncedSearch();
});

const debouncedSearch = debounce(onInputChange, DEBOUNCE_DELAY);

async function onInputChange() {
  const searchQuery = searchInput.value.trim();

  if (!searchQuery) {
    return;
  }

  const currentRequestId = requestId;

  try {
    const countries = await fetchCountries(searchQuery);

    if (currentRequestId !== requestId) {
      return;
    }

    if (countries.length === 0) {
      showError('Oops, there is no country with that name.');
      return;
    }

    if (countries.length > 10) {
      info({
        title: 'Caution',
        text: 'Too many matches found. Please enter a more specific query!',
      });
      return;
    }

    if (countries.length === 1) {
      renderCountryInfo(countries[0]);
    } else {
      renderCountryList(countries);
    }
  } catch (err) {
    if (currentRequestId !== requestId) {
      return;
    }

    console.error('Country search error:', err);
    showError('Unable to load countries. Please check your API key and access.');
  }
}

function renderCountryList(countries) {
  const markup = countries
    .map(country => {
      const name = country.names?.common || 'Unknown country';
      const flag = country.flag?.url_svg
        ? `<img src="${country.flag.url_svg}" alt="${country.flag.description || name}" width="30" />`
        : country.flag?.emoji || '🏳️';

      return `
        <li class="country-item">
          ${flag}
          <span>${name}</span>
        </li>
      `;
    })
    .join('');

  countryList.innerHTML = markup;
}

function renderCountryInfo(country) {
  const name = country.names?.common || 'Unknown country';
  const flag = country.flag?.url_svg
    ? `<img src="${country.flag.url_svg}" alt="${country.flag.description || name}" width="40" style="vertical-align: middle; margin-right: 10px;" />`
    : country.flag?.emoji || '🏳️';

  const languages = country.languages
    ?.map(language => language.name)
    .filter(Boolean)
    .join(', ') || 'No data available';

  const capital = country.capitals
    ?.map(capital => capital.name)
    .filter(Boolean)
    .join(', ') || 'No data available';

  const population = Number.isFinite(country.population)
    ? country.population.toLocaleString('uk-UA')
    : 'No data available';

  const markup = `
    <div class="country-card">
      <h2>
        ${flag}
        ${name}
      </h2>

      <p><b>Capital:</b> ${capital}</p>
      <p><b>Population:</b> ${population}</p>
      <p><b>Languages:</b> ${languages}</p>
    </div>
  `;

  countryInfo.innerHTML = markup;
}
