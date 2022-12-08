const d = document;
const $form = d.querySelector('.d-flex');
const $row = d.querySelector('.row');
const $pages = d.querySelectorAll('.page');

const $itemTemplate = d.querySelector('.item-template').content;
const fragment = d.createDocumentFragment();

const $prev = d.querySelector('.btn-prev');
const $next = d.querySelector('.btn-next');
const $prevPages = d.querySelector('.prev-pages');
const $nextPages = d.querySelector('.next-pages');
const $loader = d.querySelector('.loader');

let totalPages = 259;
let pageNumber = 0;
let pagesGroup = 5;
let pageIndex = 0;
let pathShows = '/shows?page=';
let pathSearch = '/search/shows?q=';

let noResults;

//Get data from TVmaze API
const getData = (path, query) => {
  fetch(`https://api.tvmaze.com${path}${query}`)
    .then((response) =>
      response.ok ? response.json() : Promise.reject(response)
    )
    .then((json) => {
      //Show or remove 'no result' message after doing the search
      if (noResults) noResults.remove();
      if (json.length < 1) {
        $row.insertAdjacentHTML(
          'beforebegin',
          `<h2 class="text-center mt-2 no-results">No results matching '${query}'</h2>`
        );
        noResults = d.querySelector('.no-results');
      }
      //Add each item to gallery
      json.forEach((item) => {
        if (item.show) item = item.show;
        $itemTemplate.querySelector('img').src = item.image
          ? item.image.medium
          : 'https://static.tvmaze.com/images/no-img/no-img-portrait-text.png';
        $itemTemplate.querySelector('img').alt = item.name;
        $itemTemplate.querySelector('.card-title').textContent = item.name;
        $itemTemplate.querySelector('.card-text').innerHTML = item.summary;
        $itemTemplate.querySelector('.btn-light').href = item.url;

        let clone = $itemTemplate.cloneNode(true);
        fragment.appendChild(clone);
      });
      $row.appendChild(fragment);
      $loader.style = 'display: none';
    })
    .catch((err) => {
      d.querySelector(
        'main'
      ).innerHTML = `<h2 class="text-center fw-bold">Error ${err.status}</h2>`;
    });
};
//Load gallery
d.addEventListener('DOMContentLoaded', () => {
  getData(pathShows, pageNumber);
  d.querySelector('.pagination-wrap').style = 'display: block';
  //Load search results to gallery
  $form.addEventListener('submit', (e) => {
    e.preventDefault();
    let query = e.target.querySelector('.form-control').value.toLowerCase();

    if (query) {
      d.querySelector(
        '.pagination-wrap'
      ).innerHTML = `<a class="btn btn-dark" onClick="window.location.reload();">Back</a>`;
      $loader.style = 'display: block';
      $row.innerHTML = '';
      getData(pathSearch, query);
    }
  });
  //Load items according to pagination
  d.querySelector('.pagination').addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target === $prev) {
      $loader.style = 'display: block';

      pageNumber--;

      pageNumber > 0
        ? $next.classList.remove('disabled')
        : $prev.classList.add('disabled');

      if (pageNumber < 5) $prevPages.style = 'display: none';

      if (pageNumber <= totalPages - 5) $nextPages.style = 'display: block';

      if (pageIndex < 1) {
        pagesGroup -= 10;
        $pages.forEach((page) => (page.textContent = `${++pagesGroup}`));
        pageIndex = 5;
      }
      $pages.forEach((page) => page.classList.remove('active'));
      $pages[--pageIndex].classList.add('active');

      $row.innerHTML = '';
      getData(pathShows, pageNumber);
    }

    if (e.target === $next) {
      $loader.style = 'display: block';

      pageNumber++;

      pageNumber < totalPages
        ? $prev.classList.remove('disabled')
        : $next.classList.add('disabled');

      if (pageNumber > totalPages - 5) $nextPages.style = 'display: none';

      if (pageIndex >= 4) {
        $pages.forEach((page) => (page.textContent = `${++pagesGroup}`));
        pageIndex = -1;
        $prevPages.style = 'display: block';
      }
      $pages.forEach((page) => page.classList.remove('active'));
      $pages[++pageIndex].classList.add('active');

      $row.innerHTML = '';
      getData(pathShows, pageNumber);
    }

    if (e.target.matches('.page')) {
      $loader.style = 'display: block';

      pageNumber = parseInt(e.target.textContent) - 1;

      $pages.forEach((page) => page.classList.remove('active'));
      e.target.classList.add('active');

      pageIndex = Array.from($pages).indexOf(e.target);

      pageNumber === 0
        ? $prev.classList.add('disabled')
        : $prev.classList.remove('disabled');

      pageNumber === totalPages
        ? $next.classList.add('disabled')
        : $next.classList.remove('disabled');

      $row.innerHTML = '';
      getData(pathShows, pageNumber);
    }

    if (e.target === $prevPages) {
      $loader.style = 'display: block';

      pagesGroup -= 10;
      $pages.forEach((page) => {
        page.textContent = `${++pagesGroup}`;
        page.classList.remove('active');
      });

      $pages[(pageIndex = 0)].classList.add('active');

      pageNumber = parseInt($pages[pageIndex].textContent) - 1;

      if (pageNumber < 5) {
        $prevPages.style = 'display: none';
        $prev.classList.add('disabled');
      }

      if (pageNumber > totalPages - 10) {
        $next.classList.remove('disabled');
        $nextPages.style = 'display: block';
      }

      $row.innerHTML = '';
      getData(pathShows, pageNumber);
    }

    if (e.target === $nextPages) {
      $loader.style = 'display: block';

      $prevPages.style = 'display: block';
      $pages.forEach((page) => {
        page.textContent = `${++pagesGroup}`;
        page.classList.remove('active');
      });

      $pages[(pageIndex = 0)].classList.add('active');

      pageNumber = parseInt($pages[pageIndex].textContent) - 1;

      if (pageNumber > totalPages - 5) $nextPages.style = 'display: none';

      if (pageNumber > 4) $prev.classList.remove('disabled');

      $row.innerHTML = '';
      getData(pathShows, pageNumber);
    }
  });
});
