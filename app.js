const venom = require('venom-bot');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const request = require('request');

// for date human
const timestampToDate = (tm) => {
    const miliseconds = tm * 1000;
    const before = new Date(miliseconds);
    return after = before.toLocaleString();
}

// get time now
const getDateNow = () => {
    const date_ob = new Date();
    const date = ("0" + date_ob.getDate()).slice(-2);
    const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    const year = date_ob.getFullYear();
    const hour = date_ob.getHours();
    const minute =  date_ob.getMinutes();
    const second = date_ob.getSeconds();
    return year + month + date + hour + minute + second;
}

// for regex only number
const onlyNumber = (text) => {
    return text.replace(/\D/g, '');
}

// download image from uri
const downloadImageFromUri = (uri, fileName, callback) => {
    request.head(uri, (err, res, body) => {
        request(uri).pipe(fs.createWriteStream(fileName)).on('close', callback);
    });
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
        (base64Qrimg, asciiQR, attempts, urlCode) => {
        },
        (statusSession, session) => {
            console.log('Status session: ', statusSession);
            console.log('Session name: ', session);
        },
        {
            folderNameToken: 'tokens',
            mkdirFolderToken: '/node_modules',
            headless: true,
            disableWelcome: true,
        }
    )
    .then((client) => startClientVenom(client))
    .catch((verr) => console.log(verr));

// start client venom
const startClientVenom = async (client) => {

    // variabel for save message
    let logMessage = [];

    // message incoming
    client.onMessage(async (msg) => {

        // if message not from group chat and dont broadcast
        if (msg.isGroupMsg === false && msg.from != "status@broadcast") {

            // add initial data to variable
            let id = msg.t + onlyNumber(msg.sender.id);
            let time = timestampToDate(msg.t);
            let sender = onlyNumber(msg.sender.id);
            let senderName = msg.sender.formattedName;
            let receiver = onlyNumber(msg.to);
            let receiverName = "Me";
            let body = msg.body;
            let imgInChat = "-";
            let senderPict = msg.sender.profilePicThumbObj.imgFull;
            let mediaStatus = msg.isMedia;
            let photoProfile = client.getProfilePicFromServer(msg.chatId);
            let pathPhotoProfile = "-";

            __dirname;

            // create folder json
            const saveFolderJson = path.relative(__dirname, "json");
            if (!fs.existsSync(saveFolderJson)) {
                fs.mkdirSync(saveFolderJson);
            }
            // create folder images
            const folderImage = path.relative(__dirname, "images");
            if (!fs.existsSync(folderImage)) {
                fs.mkdirSync(folderImage);
            }
            // create sub folder images -> media
            const saveFolderProfileImages = path.relative(__dirname, "images/media");
            if (!fs.existsSync(saveFolderProfileImages)) {
                fs.mkdirSync(saveFolderProfileImages);
            }
            // create sub folder images -> profile
            const saveFolderProfilePhoto = path.relative(__dirname, "images/profile");
            if (!fs.existsSync(saveFolderProfilePhoto)) {
                fs.mkdirSync(saveFolderProfilePhoto);
            }
            // create file json
            if (!fs.existsSync("json/chattome.json")) {
                fs.closeSync(fs.openSync("json/chattome.json", "w"));
            }

            // save photo profile
            if (senderPict == undefined || senderPict == null || senderPict == "") {
                pathPhotoProfile = "Kosong"
            } else {
                pathPhotoProfile = `${saveFolderProfilePhoto}${path.sep}${getDateNow()}.${sender}.profile.jpg`;
                photoProfile.then((result) => {
                    downloadImageFromUri(result, pathPhotoProfile, () => {
                        console.log(`Profile ${senderName} downloading done...`);
                    });
                });
            }

            // if chat with media
            // save media
            if (msg.isMedia === true || msg.isMMS === true) {
                body = msg.caption;
                const buffer = await client.decryptFile(msg);
                // At this point you can do whatever you want with the buffer
                // Most likely you want to write it into a file
                const fileName = `${saveFolderProfileImages}${path.sep}${getDateNow()}.${sender}.media.${mime.extension(msg.mimetype)}`;
                imgInChat = fileName;
                await fs.writeFileSync(fileName, buffer, (err) => {
                    console.log(err)
                });
            }

            // show basic information to console
            console.log("---------------------------------");
            console.log("Waktu: ", time);
            console.log("Photo: ", pathPhotoProfile);
            console.log("Dari: ", senderName);
            console.log("Pesan: ", body);
            if (mediaStatus === true) {
                console.log("Media : ", imgInChat);
            }
            console.log("---------------------------------");

            // read data from file json
            fs.readFile(`${saveFolderJson}${path.sep}chattome.json`, 'utf8', function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    // add data to log message
                    if (!data == undefined) {
                        logMessage = JSON.parse(data);
                    }
                    logMessage.push({
                        id: id,
                        time: time,
                        sender: sender,
                        senderName: senderName,
                        receiver: receiver,
                        receiverName: receiverName,
                        body: body,
                        imgInChat: imgInChat,
                        senderPict: pathPhotoProfile
                    })
                    // create file json
                    fs.writeFile(`${saveFolderJson}${path.sep}chattome.json`, JSON.stringify(logMessage), (werr) => {
                        if (werr) throw werr;
                    })
                }
            })
        }
    })
}