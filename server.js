const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();
const { processDirective } = require('./orchestrator');

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
    const cmdLower = command.toLowerCase();
    
    // Check for LexiOS Swarm Directives
    const directives = ['draft', 'scan', 'analyze', 'audit', 'brief'];
    const isDirective = directives.some(d => cmdLower.startsWith(d));

    if (isDirective) {
        // Run via Swarm Orchestrator (Ollama)
        processDirective(command).then(output => {
            res.json({ 
                success: true, 
                output: `✨ Mission Accomplished by Swarm Agent.\n\n${output}` 
            });
        }).catch(err => {
            res.json({ success: false, output: "Ollama Error: " + err.message });
        });
        return;
    }
    
    // Fallback to standard system commands
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
