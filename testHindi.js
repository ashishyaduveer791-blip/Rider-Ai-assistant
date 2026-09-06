const testCases = [
    {
        label: "Hindi — traffic detour",
        content:
            "सुनो भाई, मुख्य सड़क पर बहुत ज़्यादा traffic है क्योंकि वहां काम चल रहा है, इसलिए तुम दाएं तरफ़ वाली service road से आ जाओ",
    },
    {
        label: "Hindi — gate change",
        content:
            "अरे भाई, गेट नंबर एक पर काम चल रहा है, सिक्योरिटी वाले बोल रहे थे कि गेट तीन से अंदर आ जाओ",
    },
    {
        label: "Hinglish — stairs broken",
        content:
            "Bhai suno, stairs kaam nahi kar rahi hai abhi, isliye service lift use karo fourth floor ke liye",
    },
    {
        label: "English — safety alert",
        content:
            "Hey there's some water logging near the signal after the rain, better take the flyover route to avoid it",
    },
    {
        label: "Hindi — OTP reminder",
        content:
            "ग्राहक को बोलो कि डिलीवरी कन्फर्म करने के लिए ओटीपी बताना ज़रूरी है, नहीं तो पैकेज नहीं मिलेगा",
    },
];

async function runTests() {
    for (const test of testCases) {
        console.log(`\n=== ${test.label} ===`);
        console.log(`Input: ${test.content}`);
        try {
            const res = await fetch("http://localhost:8000/api/speech-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: test.content }),
            });
            const data = await res.json();
            console.log(`Output: ${data.spokenText}`);
            console.log(`Source: ${data.source}`);
        } catch (err) {
            console.error(`Request failed: ${err.message}`);
        }
    }
}

runTests();