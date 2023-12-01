const axios = require("axios");
const inquirer = require('inquirer');
const {generateConfigIfNotExist} = require("./utils/config")
const fs = require("fs");

(async () => {
    let area = await inquirer.prompt({
        type: 'input',
        name: 'area',
        message: "What is your area?"
    })
    let data = (await axios.get(`https://esp.info/cf/app/4.2/areas`, {
        params: { t: area.area, p: '1', c: 'za' },
        headers: {
            token: 'ZjReYljzHR',
            host: 'esp.info',
            'x-sepushapp-build': '2023110017',
            'x-sepushapp-platform': 'Android',
            'x-sepushapp-version': '3.24.3',
            'user-agent': 'Dart/3.2 (dart:io)'
        }
    })).data
    console.log(data.areas)

    let selectedArea = await inquirer.prompt({
        type: 'list',
        name: 'theme',
        message: 'What do you want to do?',
        choices: data.areas,
    })
    console.log(selectedArea.theme)

    var areaId = data.areas.find(a=>a.name == selectedArea.theme).id

    console.log(areaId)

    generateConfigIfNotExist()
    
    const config = require("./config.json")

    config.area = areaId

    fs.writeFileSync("./config.json", JSON.stringify(config, null, 4))
    

})()

