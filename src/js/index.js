
import debounce from 'lodash.debounce';
import { error, info } from '@pnotify/core';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import fetchCountries from './fetchCountries';

const searchInput = document.querySelector('.search-input');
const countryList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');

const DEBOUNCE_DELAY = 500;

let requestId = 0;
let currentCountries = [];

function showError(message) {
  error({
    title: 'Error',
    text: message,
  });
}

const debouncedSearch = debounce(onInputChange, DEBOUNCE_DELAY);

searchInput.addEventListener('input', () => {
  requestId++;
  currentCountries = [];

  countryList.innerHTML = '';
  countryInfo.innerHTML = '';

  debouncedSearch();
});

// Вибір країни зі списку
countryList.addEventListener('click', event => {
  const button = event.target.closest('.country-button');

  if (!button) {
    return;
  }

  const selectedCountry = currentCountries[Number(button.dataset.index)];

  if (selectedCountry) {
    renderCountryInfo(selectedCountry);
  }
});

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

    // Зберігаємо знайдені країни
    currentCountries = countries;

    // Завжди показуємо список, навіть якщо країна одна
    renderCountryList(countries);

  } catch (err) {
    if (currentRequestId !== requestId) {
      return;
    }

    console.error(err);
    showError('Unable to load countries. Please check API access.');
  }
}

function renderCountryList(countries) {
  const markup = countries
    .map((country, index) => {
      const name = country.names?.common || 'Unknown country';

      const flag = country.flag?.url_svg
        ? `<img src="${country.flag.url_svg}" alt="${name}" width="30">`
        : `<span>${country.flag?.emoji || '🏳️'}</span>`;

      return `
        <li class="country-item">
          <button
            class="country-button"
            type="button"
            data-index="${index}"
          >
            ${flag}
            <span>${name}</span>
          </button>
        </li>
      `;
    })
    .join('');

  countryList.innerHTML = markup;
}

function renderCountryInfo(country) {
  const name = country.names?.common || 'Unknown country';

  const flag = country.flag?.url_svg
    ? `<img src="${country.flag.url_svg}" alt="${name}" width="40"
        style="vertical-align: middle; margin-right: 10px;" />`
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
