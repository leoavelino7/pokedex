let listElement = document.querySelector('#pokeList'),
  inputElement = document.querySelector('#pokeFilter'),
  pokeballElement = document.querySelector('#pokeballBack'),
  url = 'https://dev.treinaweb.com.br/pokeapi/',
  pokeList = new Rx.BehaviorSubject([]),
  inputs = Rx.Observable.fromEvent(inputElement, 'keyup'),
  scroll = Rx.Observable.fromEvent(window, 'scroll');

pokeList.subscribe(createList);

scroll.subscribe(
  () => {
    var rotation = `translateY(-50%) rotateZ(${window.scrollY / 15}deg)`;
    pokeballElement.style.transform = rotation;
  }
);

inputs.debounce(() => Rx.Observable.interval(300))
  .map(event => event.target.value)
  .subscribe(searchText => {
    var pkmList = pokeList.getValue()
      .filter(pokemon => pokemon.name.toLowerCase().includes(searchText.toLowerCase()));
    createList(pkmList);
  });

function listAll() {
  Rx.Observable.fromPromise(fetch(`${url}pokedex/1`))
    .subscribe(response => {
      response.json()
        .then(result => result.pokemon)
        .then(pkmList => {
          return pkmList.map(pokemon => {
            var number = getNumberFromURL(pokemon.resource_uri);
            return Object.assign({}, pokemon, { number });
          })
            .filter(pokemon => pokemon.number < 1000)
            .sort((a, b) => (a.number > b.number) ? 1 : -1)
            .map(pokemon => {
              var number = ("000" + pokemon.number).slice(-3);
              return Object.assign({}, pokemon, { number });
            });
        })
        .then(list => {
          pokeList.next(list);
        });
    });
};

function getNumberFromURL(url) {
  return parseInt(url.replace(/.*\/(\d+)\/$/, '$1'));
};

function createList(pkmList) {
  var template = pkmList.map(pokemon => {
    return `
    <li class="poke-list-item" data-id="${pokemon.number}">
    <img src="https://serebii.net/pokedex-xy/icon/${pokemon.number}.png" />
    <span>${pokemon.number} - ${pokemon.name}</span>
    </li>
    `;
  });
  listElement.innerHTML = template.join('');
};

listAll();