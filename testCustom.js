const content = process.argv.slice(2).join(" ");

if (!content) {
    console.log('Usage: node testCustom.js "your message here"');
    process.exit(1);
}

fetch("http://localhost:8000/api/speech-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
})
    .then((res) => res.json())
    .then((data) => {
        console.log("Input: ", content);
        console.log("Output:", data.spokenText);
        console.log("Source:", data.source);
    })
    .catch((err) => console.error("Request failed:", err.message));