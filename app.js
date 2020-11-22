const venom = require('venom-bot');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const request = require('request');
const { start } = require('repl');

// for date human
const timestampToDate = (tm) => {
    const miliseconds = tm * 1000;
    const before = new Date(miliseconds);
    return after = before.toLocaleString();
}

const getDateNow = () => {
    const date_ob = new Date();
    const date = ("0" + date_ob.getDate()).slice(-2);
    const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    const year = date_ob.getFullYear();
    return year+month+date;
}

// for regex only number
const onlyNumber = (text) => {
    return text.replace(/\D/g, '');
}

// venom create client and authenticating
venom.create()
    .then((client) => startClientVenom(client))
    .catch((verr) => console.log(verr));

// function async

// start client venom
const startClientVenom = async (client) => {

    // variable for xlsx file
    const logMessage = [];
    const headerFile = ["Time", "Sender", "Name Sender", "Receiver", "Name Receiver", "Body", "Pict Sender"];
    const dateNow = getDateNow();

    // variable other
    const senderName = "";

    // message incoming
    client.onMessage((msg) => {
        console.log("Have new message!");
        // if message not from group chat
        if (msg.isGroupMsg === false && msg.from != "status@broadcast") {
            logMessage.push([timestampToDate(msg.t), onlyNumber(msg.sender.id), msg.sender.formattedName, onlyNumber(msg.to), "Me", msg.body, msg.sender.profilePicThumbObj.imgFull]);
            // console.log("---------------------------------");
            // console.log("Pesan masuk: ", logMessage);

            // for create xlsx file
            const rows = [headerFile, ...logMessage];
            const sheets = xlsx.utils.book_new();
            sheets.Props = {
                Title: "Manale Application",
                Author: "Dimas Irgiansyah Pratama",
                CreatedDate: new Date(),
            }
            sheets.SheetNames.push("Chat Log");
            const sheetsData = xlsx.utils.aoa_to_sheet(rows);
            sheets.Sheets["Chat Log"] = sheetsData;
            __dirname;
            const saveFolder = path.relative(__dirname, "doc");
            if (!fs.existsSync(saveFolder)) {
                fs.mkdirSync(saveFolder);
            }
            try {
                xlsx.writeFile(sheets, `${saveFolder}${path.sep}${dateNow}.xlsx`);
                console.log("File created!");
            } catch (e) {
                console.log(e.message);;
                throw e;
            }
        }
    })
}