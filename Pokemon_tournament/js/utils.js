export const random = (maxNum, minNum = 0) => minNum + Math.floor(Math.random() * (maxNum - minNum + 1));

export const searchElem = (arr, id) => arr.find(elem => elem.id == id);

export const searchElemIndex = (arr, id) => arr.findIndex(elem => elem.id == id);

export const generateLog = (firstPerson, secondPerson) => {
    const { name, hp: { current, total, endCount } } = firstPerson;
    const { name: nameTwo } = secondPerson;
    const logs = [
        `${name} вспомнил что-то важное, но неожиданно ${nameTwo}, не помня себя от испуга, ударил в предплечье врага. -${endCount}, [${current}/${total}]`,
        `${name} поперхнулся, и за это ${nameTwo} с испугу приложил прямой удар коленом в лоб врага. -${endCount}, [${current}/${total}]`,
        `${name} забылся, но в это время наглый ${nameTwo}, приняв волевое решение, неслышно подойдя сзади, ударил. -${endCount}, [${current}/${total}]`,
        `${name} пришел в себя, но неожиданно ${nameTwo} случайно нанес мощнейший удар. -${endCount}, [${current}/${total}]`,
        `${name} поперхнулся, но в это время ${nameTwo} нехотя раздробил кулаком \<вырезанно цензурой\> противника. -${endCount}, [${current}/${total}]`,
        `${name} удивился, а ${nameTwo} пошатнувшись влепил подлый удар. -${endCount}, [${current}/${total}]`,
        `${name} высморкался, но неожиданно ${nameTwo} провел дробящий удар. -${endCount}, [${current}/${total}]`,
        `${name} пошатнулся, и внезапно наглый ${nameTwo} беспричинно ударил в ногу противника. -${endCount}, [${current}/${total}]`,
        `${name} расстроился, как вдруг, неожиданно ${nameTwo} случайно влепил стопой в живот соперника. -${endCount}, [${current}/${total}]`,
        `${name} пытался что-то сказать, но вдруг, неожиданно ${nameTwo} со скуки, разбил бровь сопернику. -${endCount}, [${current}/${total}]`
    ];
    return logs[random(logs.length - 1)];
};