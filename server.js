const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

// API to get current Swarm state from markdown files
app.get('/api/swarm-state', (req, res) => {
    const logPath = path.join(__dirname, 'brain/.lexios/07_Dashboard/interaction_log.md');
    const missionPath = path.join(__dirname, 'missions/lexios-swarm.md');
    
    try {
        const logs = fs.readFileSync(logPath, 'utf8');
        const mission = fs.readFileSync(missionPath, 'utf8');
        res.json({ logs, mission });
    } catch (err) {
        res.status(500).json({ error: "Could not read swarm files" });
    }
});

// API to execute commands from the dashboard terminal
app.post('/api/execute', (req, res) => {
    const { command } = req.body;
    
    // Security: In a real app, you'd want to sanitize this. 
    // For a local-first OS, we give the architect full control.
    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, output: stderr || error.message });
        }
        res.json({ success: true, output: stdout });
    });
});

app.listen(PORT, () => {
    console.log(`
    🚀 LexiOS Command Bridge Active
    ---------------------------------
    URL: http://localhost:${PORT}
    Status: Operational
    ---------------------------------
    `);
});
