import Pokemon from "./pokemon.js";
import { random, searchElem, searchElemIndex, generateLog } from "./utils.js";

class Game {
    constructor() {
        this.data = [];
        this.state = {
            id: false,
            hero: undefined,
            value: 2,
            dataParticipants: [],
            players: [],
            round: undefined,
            losers: [],
        };

        this.$participants = document.querySelector('.participants');
        this.$battleground = document.querySelector('.battleground');
        this.$battleInfo = document.querySelector('.battleInfo');
        this.$controlBtn;
        this.$logs;

        document.querySelector('body').addEventListener('click', this.handlerClick);
    }

    init = async () => {
        this.data = await this.getPokemons();
        this.state = {
            id: false,
            hero: undefined,
            value: 2,
            dataParticipants: this.getParticipants(this.data),
            players: [],
            round: undefined,
            losers: [],
        };

        this.renderSettingsParticipants();
        this.renderSettingsBattleground();
        this.renderSettingsBattleInfo();
    }
    getPokemons = async () => {
        const responce = await fetch("https://reactmarathon-api.netlify.app/api/pokemons");
        if (!responce.ok) throw new Error('Ошибка: ' + res.status);
        const data = await responce.json();
        return data;
    };
    getParticipants = data => {
        const dataArr = data.concat();
        if (dataArr.length > 8) {
            const dataParticipants = [];
            for (let i = 0; i < 8; i++) {
                dataParticipants.push(dataArr.splice(random(dataArr.length - 1), 1)[0])
            }
            return dataParticipants;
        }
        return dataArr;
    }

    handlerClick = ({ target }) => {
        if (target.classList.contains('participant_img')) {
            this.state.id = target.dataset.id;
            this.state.hero = searchElem(this.state.dataParticipants, this.state.id);
            this.renderSettingsParticipants();
            this.renderSettingsBattleground();
        }
        if (target.classList.contains('btnClickAuto')) {
            this.state.id = false;
            this.state.hero = undefined;
            this.renderSettingsParticipants();
            this.renderSettingsBattleground();
        }        
        if (target.classList.contains('btnRepointParticipants')) {
            this.state.dataParticipants = this.getParticipants(this.data);
            this.state.id = false;
            this.state.hero = undefined;
            this.renderSettingsParticipants();
            this.renderSettingsBattleground();
        }
        if (target.classList.contains('btnClickRadio')) {
            this.state.value = target.dataset.value;
            this.renderSettingsBattleground();
        }
        if (target.classList.contains('btnStart')) {
            this.renderLayoutGame();
            this.$controlBtn = document.querySelector('.controlBtn');
            this.$logs = document.querySelector('.logs');
            this.start();
        }
        if (target.classList.contains('btnHooks')) this.hooks(target.dataset.id);
        if (target.classList.contains('btnNewGame')) this.init();
        if (target.classList.contains('btnContinue')) {
            this.$logs.innerHTML = "<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>";
            this.state.round();
            this.state.players[0].renderPokemon();
        }
    }
    
    renderSettingsParticipants = () => {
        const { id: idPlayer, dataParticipants } = this.state;
        this.$participants.textContent = '';
        dataParticipants.forEach(({ id, name }) => {
            this.$participants.insertAdjacentHTML('beforeend', `
                <div class="participant${idPlayer == id ? ' participant_active' : ''}">
                    <img class="participant_img" data-id="${id}" src="./server/InitialSource/imgPokemon/${name}.webp" alt="photo of participant ${name}">
                </div>
            `);
        });
    }
    renderSettingsBattleground = () => {
        const { hero: dataHero, value: dataValue } = this.state;
        this.$battleground.textContent = '';
        let html = '';
        let name = '';
        if (dataHero) {
            name = `${dataHero.name} / ${dataHero.hp}hp`;
            const characteristicHero = dataHero.attacks.reduce((html, e) => html + `<p>${e.name} ${e.minDamage}..${e.maxDamage}hp</p>`, '');
            const volumeCharacteristic = dataHero.attacks.reduce((html, e) => html + `<p>x ${e.maxCount}`, '');
            html = `<div class="infoHero">
                        <div class="characteristicHero">${characteristicHero}</div>
                        <div class="volumeCharacteristic">${volumeCharacteristic}</div>
                    </div>`;
        }
        this.$battleground.insertAdjacentHTML('beforeend', `
            <div class="settingsOne">
                <button class="btn btnRepointParticipants">ОБНОВИТЬ</button>
                <h3>Участники: 8 из ${this.data.length}</h3>
                <br>
                <button class="btn btnAutoHero${ dataHero ? ' btnClickAuto' : ' btnAutoHero_active'}">АВТО</button>
                <h3>Герой: ${ dataHero ? name : 'АВТОВЫБОР'}</h3>
                ${html}
            </div>
            <div class="settingsTwo">                
                <h2>Выигрывай раунд и получай:</h2>
                <div class="inputRadio">
                    <button class="btn btnRadio${dataValue == 3 ? ' btnRadio_active' : ' btnClickRadio'}" data-value="3"></button>
                    <span>+99% HP и +3 Hooks</span>
                </div>
                <div class="inputRadio">
                    <button class="btn btnRadio${dataValue == 2 ? ' btnRadio_active' : ' btnClickRadio'}" data-value="2"></button>
                    <span>+66% HP и +2 Hooks</span>
                </div>
                <div class="inputRadio">
                    <button class="btn btnRadio${dataValue == 1 ? ' btnRadio_active' : ' btnClickRadio'}" data-value="1"></button>
                    <span>+33% HP и +1 Hooks</span>
                </div>
                <p>HP -плюс к здоровью (от уровня соперника)</p>
                <p>Hooks -плюс к ударам (раздаются случайно)</p>
            </div>
        `);
    }
    renderSettingsBattleInfo = () => {
        this.$battleInfo.textContent = '';
        this.$battleInfo.insertAdjacentHTML('beforeend', `
            <img class="logo" src="./img/Logo.webp" alt="Logo">
            <button class="btn btnStart">СТАРТ</button>
        `);
    }
    renderLayoutGame = () => {
        this.$battleground.textContent = '';
        const height = this.$battleground.offsetHeight;
        const width = 0.25 * this.$battleground.offsetWidth;
        this.$battleground.insertAdjacentHTML('beforeend', `
            <div class="pokemon player1">
                <p class="pokemonLevel lvl-player1"></p>            
                <img class="pokemonImg" src="" id="img-player1" alt="pokemonImg">
                <div class="details" style="width: ${ height / 1.49 > width ? 80 : 80 * height / (1.49 * width) }%;">
                    <h3 class="pokemonName" id="name-player1"></h3>
                    <div class="bar">
                        <div class="pokemonHealth normal" id="progressbar-player1"></div>
                    </div>
                    <span class="pokemonHealthText" id="health-player1"></span>
                </div>
            </div>
            <div class="control">
                <div class="controlLogo">
                    <img class="logo" src="./img/Logo.webp" alt="Logo">
                </div>
                <div class="controlBtn"></div>
            </div>
            <div class="pokemon player2">
                <p class="pokemonLevel lvl-player2"></p>            
                <img class="pokemonImg" src="" id="img-player2">
                <div class="details" style="width: ${ height / 1.49 > width ? 80 : 80 * height / (1.49 * width) }%;">
                    <h3 class="pokemonName" id="name-player2"></h3>
                    <div class="bar">
                        <div class="pokemonHealth normal" id="progressbar-player2"></div>
                    </div>
                    <span class="pokemonHealthText" id="health-player2"></span>
                </div>
            </div>
        `);
        this.$battleInfo.textContent = '';
        this.$battleInfo.insertAdjacentHTML('beforeend', `
            <div class="logs">
                <p>&nbsp;</p>
                <p>&nbsp;</p>
                <p>&nbsp;</p>
            </div>
        `);
    }
    
    renderParticipants = () => {
        this.$participants.textContent = '';
        const { players, dataParticipants, losers } = this.state;
        players.forEach(({ player, name }) => {
            this.$participants.insertAdjacentHTML('beforeend', `
                <div class="participant${player == "player1" ? ' participant_active' : ' participant_opponent'}">
                    <img src="./server/InitialSource/imgPokemon/${name}.webp" alt="participant" style="height: 100%;">
                </div>
            `);
        });
        dataParticipants.forEach(({ name }) => {
            this.$participants.insertAdjacentHTML('beforeend', `
                <div class="participant participant_waiting">
                    <img src="./server/InitialSource/imgPokemon/${name}.webp" alt="participant waiting" style="height: 100%;">
                </div>
            `);
        });
        losers.forEach(({ name }) => {
            this.$participants.insertAdjacentHTML('beforeend', `
                <div class="participant participant_losers" style="background-image: url(./server/InitialSource/imgPokemon/${name}.webp);">
                    <img src="./img/delete.webp" alt="participant delete" style="height: 100%;">
                </div>
            `);
        });
    }
    renderBtnClick = (click, btn) => {
        if (!click) btn.disabled = true;
        const innerHTML = btn.innerHTML;
        btn.innerHTML = `${innerHTML} <span>${click}pcs</span>`;
        return () => {
          click--;
          btn.innerHTML = `${innerHTML} <span>${click}pcs</span>`;
          if (!click) btn.disabled = true;
          return click;
        }
    }
    renderLogs = (log) => {
        const $p = document.createElement("p");
        $p.innerText = log;
        this.$logs.insertBefore($p, this.$logs.children[0]);
        if (this.$logs.children[4]) { this.$logs.children[4].remove() };
    }
    renderRoundResult = () => {
        this.$controlBtn.textContent = '';
        const { players } = this.state;
        players[0].btn = [];
        if (!players[0].hp.current) this.$controlBtn.insertAdjacentHTML('beforeend', `
            <h2 class="gameOver">ИГРА ЗАВЕРШЕНА</h2>
            <p>${players[0].name} проиграл раунд и покидает турнир!</p>
            <button class="btn btnNewGame">НОВЫЙ ТУРНИР</button>
        `);
        else {
            this.state.losers.push(players[1]);
            const trophy = this.trophy();
            if (players[0].lvl.flow === players[0].lvl.max) this.$controlBtn.insertAdjacentHTML('beforeend', `
                <h2 class="gameOver">!!! ПОЗДРАВЛЯЕМ !!!</h2>
                <p>${players[0].name} выйграл турнир!</p>
                <button class="btn btnNewGame">НОВЫЙ ТУРНИР</button>
            `);
            else this.$controlBtn.insertAdjacentHTML('beforeend', `
                <h2 class="gameOver">${players[0].name} выигрывает раунд!</h2>
                <p>${players[0].name} получает +${trophy.hp}HP и +${trophy.hooks}Hooks!</p>
                <button class="btn btnContinue">ПРОДОЛЖИТЬ ТУРНИР</button>
            `);
        }
    }
    
    start = () => {
        const { id, dataParticipants } = this.state;
        const roundPlayers = this.callPlayers(id, dataParticipants);
        
        this.state.round = () => {
            let players = roundPlayers();
            this.state.players = players;
            this.renderParticipants();
            this.$controlBtn.textContent = '';
            players[0].attacks.forEach(item => {
                const { id, name, maxDamage, minDamage, maxCount } = item;
                const $btn = document.createElement("button");
                $btn.className = "btn btnHooks";
                $btn.dataset.id = id;
                $btn.innerHTML = `${name}<br>-${minDamage}..${maxDamage}HP`;
                this.$controlBtn.appendChild($btn);
                const btnCounter = this.renderBtnClick(maxCount, $btn);
                players[0].btn.push({id: id, btnCounter: btnCounter,});
            });
        };

        this.state.round();
    }
    callPlayers = (id, arr) => {
        const player1 = new Pokemon({
            levelMax: arr.length,
            ...arr.splice((id ? searchElemIndex(arr, id) : random(arr.length - 1)), 1)[0],
            selectors: "player1",
        });
        return () => {
            const player2 = new Pokemon({
              ...arr.splice(random(arr.length - 1), 1)[0],
              selectors: "player2",
            });
            return [player1, player2];
        }
    }
    getDamage = async (player1id, attackId, player2id) => {
        const url = `https://reactmarathon-api.netlify.app/api/fight?player1id=${player1id}&attackId=${attackId}&player2id=${player2id}`;
        const responce = await fetch(url);
        return await responce.json();
    }
    hooks = async (id) => {
        const { players } = this.state;
        searchElem(players[0].attacks, id).maxCount = searchElem(players[0].btn, id).btnCounter();
        const damage = await this.getDamage(players[0].id, id, players[1].id);
        players[0].changeHP(damage.kick.player1);
        players[1].changeHP(damage.kick.player2);
        this.renderLogs(generateLog(players[1], players[0]));
        this.renderLogs(generateLog(players[0], players[1]));
        if (!players[0].hp.current || !players[1].hp.current) await this.renderRoundResult();
    }
    trophy = () => {
        const { players, value: k } = this.state;
        players[0].lvl.flow++;
        const hp = Math.round(players[1].hp.total * 0.33 * k);
        players[0].hp.current += hp;
        players[0].hp.current > players[0].hp.total ? players[0].hp.total = players[0].hp.current : players[0].hp.current = players[0].hp.total;
        for (let i = 0; i < k; i++) players[0].attacks[random(players[0].attacks.length - 1, 1)].maxCount++;
        return {
            hp: hp,
            hooks: k,
        }
    }
}

const game = new Game();
game.init();