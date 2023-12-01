const axios = require("axios")
const { exec } = require('child_process');
const express = require('express');
const app = express()
const fs = require("fs")
var countdownTimeout
var powerrestoreTimeout

try {
    require("./config.json")
} catch (error) {
    fs.writeFileSync("./config.json", JSON.stringify({
        "shutdownCmd": "shutdown -h",
        "shutdownMsg": "<@290444481743028224> Shutting down due to loadshedding!",
        "shutdownGeneratorMsg": "<@290444481743028224> PC WAS ON DURING LOADSHEDDING, SHUTTING DOWN AGAIN INCASE GENERATOR WAS ON!",
        "wakeupMsg": "<@290444481743028224> PC has been asleep for $seconds",
        "webhookUrl": "https://discord.com/api/webhooks/0000000000000000000/DISCORD-WEBHOOK-URL-HERE",
        "port": 3000
    }, null, 4))
}

const { shutdownCmd, shutdownGeneratorMsg, shutdownMsg, webhookUrl, wakeupMsg, port } = require("./config.json")

var nextDate;

(async ()=>{
    console.log("Checking if we have internet access!")
    while (!await isOnline()) {
        await new Promise(r => setTimeout(r, 5000));
    }
    console.log("We have internet access!")

    if (fs.existsSync("./last_shutdown")) {
        console.log("SHUTDOWN DATA FOUND!")
        var time = new Date(+fs.readFileSync("./last_shutdown", { encoding: "utf-8" }))
        fs.unlinkSync("./last_shutdown")
        console.log(time)
        var seconds = (new Date().getTime() - time.getTime()) / 1000
        await sendMessage(wakeupMsg.replaceAll("$seconds", new Date(seconds * 1000).toISOString().substr(11, 8)))
    }

    run()
    setInterval(run, 1000 * 30);

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
})()




app.get('/', (req, res) => {
    var currentTime = new Date();
    if (nextDate) {
        var powerondate = new Date(nextDate.getTime() + (2 * 60 * 60 * 1000))
        var secondsToDoom = (nextDate.getTime() - currentTime.getTime()) / 1000 - 5 * 60
        var secondsToPower = (powerondate.getTime() - currentTime.getTime()) / 1000 /* - 10 * 60 */
        if (secondsToDoom > 0) {
            res.end(new Date(secondsToDoom * 1000).toISOString().substr(11, 8) + " Shutdown")
        } else {
            res.end(new Date(secondsToPower * 1000).toISOString().substr(11, 8) + " Power")
        }
    } else {
        res.end("NONE")
    }
})

async function run() {
    clearTimeout(countdownTimeout)
    clearTimeout(powerrestoreTimeout)
    try {
        nextDate = null
        let data = (await axios.get(`https://esp.info/api/4.1/area_events/ethekwini3-3b-kloof`)).data
        var ev

        /* for (const event of data.area_events) {
            if ((new Date() < new Date(event.start)) && new Date() < new Date(event.end)) {
                console.log(event)
                //ev = event
                //break;
            }
        } */

        for (const event of data.area_events) {
            if (/* (new Date().getTime() >= new Date(event.start).getTime()) &&  */new Date().getTime() < new Date(event.end).getTime()) {
                console.log(event)
                ev = event
                break;
            }
        }

        if (!ev) return console.log("No Loadshedding In The Future!");

        //console.log(ev.start)


        var date = new Date(ev.start.split("+")[0])



        /* date = new Date(date.getTime() + + (2*60*60*1000)) */

        //console.log(date)

        nextDate = date

        var currentTime = new Date();

        var powerondate = new Date(nextDate.getTime() + (2 * 60 * 60 * 1000))
        var secondsToPower = (powerondate.getTime() - currentTime.getTime()) / 1000 /* - 10 * 60 */

        console.log("SECONDS UNTIL POWER RESTORED!", secondsToPower)

        var paddedSecondsRESTORED = secondsToPower - (60 * 5)

        console.log("SECONDS UNTIL POWER RESTORED PADDED!", paddedSecondsRESTORED)

        if (paddedSecondsRESTORED > 0) {
            powerrestoreTimeout = setTimeout(() => {

                console.log("POWER ON!")

                sendMessage(shutdownGeneratorMsg)

                shutdown()

            }, paddedSecondsRESTORED * 1000);
        }


        var secondsTillDoom = (new Date(ev.start).getTime() - new Date().getTime()) / 1000

        var paddedSeconds = secondsTillDoom - (60 * 5)

        console.log(`${secondsTillDoom}s to power failure.`)
        console.log(`${paddedSeconds}s to shutdown.`)

        if (paddedSeconds < 0) return console.log("INTO LOADSHEDDING!")

        console.log("GO!")

        countdownTimeout = setTimeout(() => {
            console.log("Shutdown!")

            sendMessage(shutdownMsg)

            shutdown()

            console.log("WAAAAAAAAAAA")

        }, paddedSeconds * 1000);
    } catch (error) {
        console.log(error)
        console.log("Failed To Fetch Stage!")
    }
}


function shutdown() {
    const shutdown = exec(shutdownCmd, function (error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            console.log('Signal received: ' + error.signal);
        }
        console.log('Child Process STDOUT: ' + stdout);
        console.log('Child Process STDERR: ' + stderr);
        fs.writeFileSync("./last_shutdown", new Date().getTime().toString())
        process.exit()
    });

    shutdown.on('exit', function (code) {
        console.log('Child process exited with exit code ' + code);
    });
}

async function sendMessage(content) {
    try {
        await axios.post(webhookUrl, { content }).catch(e => {
            console.log(e)
        })
    } catch (error) {
        console.log(error)
    }
}

async function isOnline() {
    try {
        var res = await axios.get("https://github.com/major/icanhaz")
        return true
    } catch (error) {
        return false
    }
}