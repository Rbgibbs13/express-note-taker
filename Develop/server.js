const express = require("express");
const path = require('path');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');
const noteData = require("./db/db.json");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded( { extended: true }));
app.use(express.json());

app.use(express.static('public'));

app.get('/notes', (req, res) => {
    console.info(`${req.method} request at /notes received for notes page`);
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});

// app.get('/api/notes', (req, res) => {
//     console.info(`${req.method} request received at api/notes to get notes`);
//     fs.readFile(`./db/db.json`, "utf8", (err, data) => {
//         if(err) {
//             res.status(500).console.error(err);
//         } else {
//             const parsed = JSON.parse(data);
//             res.status(200).json(parsed);
//             return parsed;
//         }
//     });
// });

app.get('/api/notes', (req, res) => {
    res.status(200).send(noteData);
});

app.get('/api/notes/:id', (req, res) => {
    const noteID = req.params.id;
    res.status(200).json(noteData[noteID - 1]);
});

app.post('/api/notes', (req, res) => {
    console.log(`${req.method} request at /notes received`);
    const { title, text } = req.body;

    if(title && text) {
        const uuid = uuidv4();
        const newNote = {
            title,
            text,
            uuid
        };

        fs.readFile(`./db/db.json`, "utf8", (err, data) => {
            if(err) {
                console.error(err);
            } else {
                const parsed = JSON.parse(data);
                parsed.push(newNote);
                const stringy = JSON.stringify(parsed, null, 4);

                fs.writeFile('./db/db.json', stringy, (err) => 
                    err ? console.error(err) : console.log(`Note saved`)
                );
                return res.status(200).json(parsed);
                //res.status(200).sendFile(path.join(__dirname, '/public/notes.html'));
            }
        });
    } else {
        res.status(404);
    }
});

app.delete('/api/notes/:id', (req, res) => {
    const id = req.params.id;
    fs.readFile(`./db/db.json`, 'utf8', (err, data) => {
        if(err) {
            res.status(404).console.error(err);
        } else {
            const parsed = JSON.parse(data);
            let stringy = "";

            if(id.length <= 3) {
                parsed.splice(id - 1, 1);
                stringy = JSON.stringify(parsed, null, 4);
            } else {
                for(let i = 0; i < parsed.length; i++) {
                    if(id == parsed[i].uuid)
                        parsed.splice(i, 1);
                };
                stringy = JSON.stringify(parsed, null, 4);
            }
            
            fs.writeFile('./db/db.json', stringy, (err) => 
                err ? console.error(err) : console.log(`Note JSON saved`)
            );

            res.status(200).json(parsed);
        }
    });
});

app.get('*', (req, res) => {
    console.info(`${req.method} request at universal returning index`);
    res.status(200).sendFile(path.join(__dirname, "/public/index.html"))
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});