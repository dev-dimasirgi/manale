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
    const logMessage = [];
    const headerFile = ["ID", "TIME", "SENDER", "NAMA SENDER", "RECEIVER", "NAME RECEIVER", "BODY", "IMAGES", "SENDER PICT"];
    const dateNow = getDateNow();

    // variable other
    const senderName = "";

    // message incoming
    client.onMessage((msg) => {
        // console.log(msg);
        // if message not from group chat and dont broadcast
        if (msg.isGroupMsg === false && msg.from != "status@broadcast") {

            console.log("Have new message!");

            const id = `${msg.id}${onlyNumber(msg.sender.id)}`;
            const time = timestampToDate(msg.t);
            const sender = onlyNumber(msg.sender.id);
            const senderName = "";
            const receiver = onlyNumber(msg.to);
            const receiverName = "Me";
            const body = msg.body;
            const imgInChat = "-";
            const senderPict = msg.sender.profilePicThumbObj;

            // sender name change
            if (msg.sender.isMyContact === false) {
                senderName = msg.sender.verifiedName;
            } else if (senderName === "" && msg.sender.isMyContact === true) {
                senderName = msg.sender.formattedName;
            } else {
                senderName = msg.sender.formattedName;
            }

            if (msg.isMedia === true || msg.isMSS === true) {
                const bufferImgInChat = client.decryptFile(msg);
                body = msg.caption;
                imgInChat = fileImgInChat;

                // create folder images
                const saveFolderImages = path.relative(__dirname, "images");
                if (!fs.existsSync(saveFolderImages)) {
                    fs.mkdirSync(saveFolderImages);
                }

                const fileImgInChat = `${saveFolderImages}${path.sep}images.dateNow.sender.${mime.extension(message.mimetype)}`;

                // create file images
                fs.writeFile(fileImgInChat, bufferImgInChat, (merr) => {
                    console.log("Media in chat created");
                })
            }

            // insert message to variable logMessage
            logMessage.push([id, time, sender, senderName, receiver, receiverName, body, imgInChat, senderPict]);

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
            
            // if folder not exists, system create new folder
            const saveFolder = path.relative(__dirname, "doc");
            if (!fs.existsSync(saveFolder)) {
                fs.mkdirSync(saveFolder);
            }
            try {
                // create file
                xlsx.writeFile(sheets, `${saveFolder}${path.sep}${dateNow}.xlsx`);
                console.log("File created!");
            } catch (e) {
                console.log(e.message);;
                throw e;
            }
        }
    })
}