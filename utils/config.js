const fs = require("fs");

function generateConfigIfNotExist() {
    try {
        require("../config.json")
    } catch (error) {
        console.log(error)
        fs.writeFileSync("../config.json", JSON.stringify({
            "shutdownCmd": "shutdown -h",
            "shutdownMsg": "<@290444481743028224> Shutting down due to loadshedding!",
            "shutdownGeneratorMsg": "<@290444481743028224> PC WAS ON DURING LOADSHEDDING, SHUTTING DOWN AGAIN INCASE GENERATOR WAS ON!",
            "wakeupMsg": "<@290444481743028224> PC has been asleep for $seconds",
            "webhookUrl": "https://discord.com/api/webhooks/0000000000000000000/DISCORD-WEBHOOK-URL-HERE",
            "port": 3000,
            "area": "ethekwini3-3b-kloof"
        }, null, 4))
    }
}

module.exports = {
    generateConfigIfNotExist
}