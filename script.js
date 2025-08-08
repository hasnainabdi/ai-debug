async function analyzeCode() {
  const code = document.getElementById('codeInput').value;
  const language = document.getElementById('language').value;
  const output = document.getElementById('output');

  output.textContent = '⏳ Analyzing code... Please wait.';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `I am working in ${language}. Please analyze this code and fix any errors, then explain them:\n\n${code}`
          }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      output.textContent = '❌ Error: Invalid response from OpenAI API.';
      return;
    }
    const reply = data.choices[0].message.content;
    output.textContent = reply;

  } catch (err) {
    output.textContent = '❌ Error analyzing the code: ' + err.message;
  }
}
