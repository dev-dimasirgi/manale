const venom = require('venom-bot');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

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
    return year + month + date;
}

// for regex only number
const onlyNumber = (text) => {
    return text.replace(/\D/g, '');
}

// convert array to json
const arrayToJSONObject = (arr) => {
    var keys = ["id", "time", "sender", "senderName", "receiver", "receiverName", "body", "images", "senderPict"];
    var formatted = [], data = arr;
    cols = keys;
    l = cols.length;
    for (var i = 0; i < data.length; i++) {
        var d = data[i],
            o = {};
        for (var j = 0; j < l; j++)
            o[cols[j]] = d[j];
        formatted.push(o);
    }
    return formatted;
}

// venom create client and authenticating
venom.create(
    'sessionName',
    (base64Qr, asciiQR) => {
        console.log(asciiQR);
        const matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};

        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer.from(matches[2], 'base64');
        const imageBuffer = response;
        const saveImages = path.relative(__dirname, "images");
        if (!fs.existsSync(saveImages)) {
            fs.mkdirSync(saveImages);
        }
        // create qr png
        fs.writeFile(
            `${saveImages}${path.sep}qr.png`,
            imageBuffer['data'],
            'binary',
            (ferr) => {
                if (ferr != null) {
                    console.log(ferr);
                }
            }
        );
    },
    undefined,
    { logQR: false }
)
    .then((client) => startClientVenom(client))
    .catch((verr) => console.log(verr));

// function async

// start client venom
const startClientVenom = async (client) => {

    // variable for xlsx file
    var logMessage = [];
    const headerFile = ["ID", "TIME", "SENDER", "NAME SENDER", "RECEIVER", "NAME RECEIVER", "BODY", "IMAGES", "SENDER PICT"];
    const dateNow = getDateNow();

    // message incoming
    client.onMessage(async (msg) => {
        // if message not from group chat and dont broadcast
        if (msg.isGroupMsg === false && msg.from != "status@broadcast") {

            const id = msg.t + onlyNumber(msg.sender.id);
            const time = timestampToDate(msg.t);
            const sender = onlyNumber(msg.sender.id);
            const senderName = msg.sender.formattedName;
            const receiver = onlyNumber(msg.to);
            const receiverName = "Me";
            const body = msg.body;
            const imgInChat = "-";
            const senderPict = msg.sender.profilePicThumbObj.imgFull;

            __dirname;
            // add recent data to variable logMessage
            logMessage.push([id, time, sender, senderName, receiver, receiverName, body, imgInChat, senderPict]);

            // in chat media TAPI MASIH PR
            // if (msg.isMedia === true || msg.isMSS === true) {
            //     console.log("Media true");
            //     const bufferImgInChat = await client.decryptFile(msg);
            //     console.log("Buffer file: ", bufferImgInChat);
            //     console.log(mime.extension(msg.mimetype));
            //     body = msg.caption;
            //     imgInChat = fileImgInChat;

            //     // create folder images
            //     const saveFolderImages = path.relative(__dirname, "images/chat");
            //     if (!fs.existsSync(saveFolderImages)) {
            //         fs.mkdirSync(saveFolderImages);
            //     }
            //     console.log("Proses folder after");

            //     const fileImgInChat = `${saveFolderImages}${path.sep}images.dateNow.sender.${mime.extension(msg.mimetype)}`;

            //     // create file images
            //     await fs.writeFile(fileImgInChat, bufferImgInChat, (merr) => {
            //         console.log(merr);
            //     });
            // }else{
            //     console.log("Media false");
            // }

            console.log("---------------------------------");
            console.log("Waktu: ", time);
            console.log("Dari: ", senderName);
            console.log("Pesan: ", body);
            console.log("---------------------------------");

            // check exists folder json
            const saveFolderJson = path.relative(__dirname, "json");
            if (!fs.existsSync(saveFolderJson)) {
                fs.mkdirSync(saveFolderJson);
            }

            // read data from file json
            fs.readFile(`${saveFolderJson}${path.sep}chattome.json`, 'utf8', function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    // add data to log message 
                    logMessage = JSON.parse(data);
                    logMessage.push({
                        id: id,
                        time: time,
                        sender: sender,
                        senderName: senderName,
                        receiver: receiver,
                        receiverName: receiverName,
                        body: body,
                        imgInChat: imgInChat,
                        senderPict: senderPict
                    })
                    // create file json
                    fs.writeFile(`${saveFolderJson}${path.sep}chattome.json`, JSON.stringify(logMessage), (werr) => {
                        if (werr) throw werr;
                    })
                }
            })

            // for create xlsx file
            // const rows = [headerFile, ...logMessage];
            // const sheets = xlsx.utils.book_new();
            // sheets.Props = {
            //     Title: "Manale Application",
            //     Author: "Dimas Irgiansyah Pratama",
            //     CreatedDate: new Date(),
            // }
            // sheets.SheetNames.push("Chat Log");
            // const sheetsData = xlsx.utils.aoa_to_sheet(rows);
            // sheets.Sheets["Chat Log"] = sheetsData;

            // // if folder not exists, system create new folder
            // const saveFolder = path.relative(__dirname, "doc");
            // if (!fs.existsSync(saveFolder)) {
            //     fs.mkdirSync(saveFolder);
            // }
            // try {
            //     // create file
            //     xlsx.writeFile(sheets, `${saveFolder}${path.sep}chat.${dateNow}.xlsx`);
            // } catch (e) {
            //     console.log(e.message);;
            //     throw e;
            // }
        }
    })
}