# loadshedding-shutdown
Will prematurely turn off pc 5 minutes before loadshedding


config.json Template:
```
{
    "shutdownCmd": "shutdown -h",
    "shutdownMsg": "<@290444481743028224> Shutting down due to loadshedding!",
    "shutdownGeneratorMsg": "<@290444481743028224> PC WAS ON DURING LOADSHEDDING, SHUTTING DOWN AGAIN INCASE GENERATOR WAS ON!",
    "wakeupMsg": "<@290444481743028224> PC has been asleep for $seconds",
    "webhookUrl": "https://discord.com/api/webhooks/00000000/WEBHOOK_URL",
    "port": 3000
}
```

Install The NPM modules: `npm install`

Select your area by running `node areaSearch.js`

Program can be started by running `node index.js` in the folder or can be installed as a windows service by running `node installServiceWindows.js`
