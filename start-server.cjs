// use this file for pm2, put in root folder dir : pm2 ./start-server.cjs --name "site.com"

const { spawn } = require("child_process");

const nextCli = require.resolve("next/dist/bin/next");


process.env.NODE_ENV = "production";
process.env.PORT = "3060";
process.env.HOSTNAME = "127.0.0.1";

require("./.next/standalone/server.js");

const child = spawn(process.execPath, [nextCli, "start"], {
    stdio: "inherit",
    env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: process.env.PORT || "3060",
    },
});

child.on("exit", (code) => process.exit(code ?? 1));
