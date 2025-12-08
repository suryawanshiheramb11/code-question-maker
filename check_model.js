const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    const modelsToTest = ["gemini-pro", "gemini-1.5-flash-8b", "gemini-2.0-flash-exp", "gemini-2.0-flash"];

    for (const m of modelsToTest) {
        try {
            console.log(`Testing ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("Hello");
            console.log(`SUCCESS: ${m}`);
            return; // Found one!
        } catch (error) {
            console.log(`FAILED: ${m} - ${error.message}`);
        }
    }
}

listModels();
