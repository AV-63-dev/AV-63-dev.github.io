class Selectors {
    constructor(name) {
        this.elLvl = document.querySelector(`.lvl-${name}`);
        this.elImg = document.getElementById(`img-${name}`);
        this.elName = document.getElementById(`name-${name}`);
        this.elProgressbar = document.getElementById(`progressbar-${name}`);
        this.elHP = document.getElementById(`health-${name}`);
    };
};

class Pokemon extends Selectors {
    constructor({name, id, hp, img, attacks, selectors, levelMax = 1}) {
        super(selectors);
        this.player = selectors;
        this.name = name;
        this.id = id;
        this.hp = {
            current: hp,
            total: hp,
            endCount: 0,
        },
        this.img = img;
        this.attacks = attacks;
        this.btn = [];
        this.lvl = {
            flow: 1,
            max: levelMax,
        };
        this.renderPokemon();
    };

    renderPokemon = () => {
        this.elLvl.innerText = "Lv. " + this.lvl.flow;
        this.elImg.src = this.img;
        this.elName.innerText = this.name;
        this.renderHP();
    }
    renderHP = () =>  {
        const {hp: {current, total}, elHP, elProgressbar } = this;
        elHP.innerText = current + " / " + total;
        elProgressbar.style.width = (100 * current / total) + "%";
        if (current > 60) {
            elProgressbar.className = "pokemonHealth normal";
        } else {
            if (current < 20) {
                elProgressbar.className = "pokemonHealth critical";
            } else {
                elProgressbar.className = "pokemonHealth low";
            }
        }
    }
    changeHP = (count) => {
        this.hp.endCount = count;
        if (this.hp.current <= count) {
            this.hp.current = 0;
        } else {
            this.hp.current -= count;
        }
        this.renderHP();
    }
};
export default Pokemon;