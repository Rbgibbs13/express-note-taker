const express = require("express");
const path = require('path');
const fs = require('fs');
const noteData = require("./db/db.json");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded( {extended: true}));
app.use(express.json());

app.use(express.static('public'));

app.get('/notes', (req, res) => {
    console.info(`${req.method} request at /notes received for notes page`);
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});

app.post('/api/notes', (req, res) => {
    console.log(`${req.method} request at /notes received`);
    const { title, text } = req.body;
    if(title && text) {
        const newNote = {
            title,
            text
        };

        fs.readFile(`./db/db.json`, "utf8", (err, data) => {
            if(err) {
                console.error(err);
            } else {
                const parsed = JSON.parse(data);
                parsed.push(newNote);
                const stringy = JSON.stringify(parsed, null, 4);

                fs.writeFile('./db/db.json', stringy, (err) => 
                    err ? console.error(err) : console.log(`Note JSON saved`)
                );
            }
        })
    }

    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received at api/notes to get notes`);
    res.json(noteData);
});

app.get('*', (req, res) => {
    console.info(`${req.method} request at universal returning index`);
    res.sendFile(path.join(__dirname, "/public/index.html"))
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});