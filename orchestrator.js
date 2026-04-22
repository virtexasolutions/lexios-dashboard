const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function processDirective(directive) {
    const brandDnaPath = path.join(__dirname, 'brain/.lexios/01_Brand_DNA/identity.md');
    const brandDna = fs.readFileSync(brandDnaPath, 'utf8');
    
    const prompt = `
    SYSTEM ROLE: You are the LexiOS Swarm Orchestrator. 
    BRAND DNA: ${brandDna}
    
    USER DIRECTIVE: ${directive}
    
    ACTION: Fulfill the directive according to the Brand DNA. If it is a 'draft' command, provide a professional, authoritative markdown response.
    `;

    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'gemma4:e2b',
            prompt: prompt,
            stream: false
        });

        const output = response.data.response;
        
        // Log the action
        const logPath = path.join(__dirname, 'brain/.lexios/07_Dashboard/interaction_log.md');
        const logEntry = `\n[${new Date().toISOString()}] | [Scribe] | [EXECUTION] | [03_Email_Suite/generated_draft.md] | [Fulfilled directive: ${directive}]`;
        fs.appendFileSync(logPath, logEntry);

        // Save the result (simplified for now)
        const savePath = path.join(__dirname, 'brain/.lexios/03_Email_Suite/generated_draft.md');
        fs.writeFileSync(savePath, output);

        return output;
    } catch (err) {
        console.error("Ollama Error:", err.message);
        return "ERROR: Could not connect to Ollama. Make sure it is running.";
    }
}

module.exports = { processDirective };
