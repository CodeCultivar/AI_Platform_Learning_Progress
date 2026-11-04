import { useState } from 'react'

const tutorPrompt = (topic, done) => `You are my strict tutor for a weekly teach-back. This week's topic: "${topic}".
The goal I was working toward: "${done}"

Rules:
1. I will explain what I built, out loud or in writing, in about 3 minutes. Do not interrupt me.
2. Then ask me exactly 5 questions, ONE at a time. Wait for my answer before the next one.
3. Do not give hints or answers before I answer. Mix: 2 "why did you do it this way", 2 "what happens if X breaks", 1 "how would you explain this to a non-engineer".
4. After each answer, say CORRECT, PARTLY or WRONG in one word, then one or two sentences on why. If I am wrong or vague, say so plainly. Do not flatter me.
5. After question 5, give: a score out of 5, the 2 weakest areas, and 3 specific things to review before Monday.

Start by telling me you are ready and I should begin my explanation. Here is what I built this week:
[paste your notes, README or code summary here]`

const checkinPrompt = (topic, done) => `Help me do my weekly check-in for "${topic}".
The plan says I am done when: "${done}"

Here is where I am (what works, what is unfinished, what blocked me):
[paste here]

For each part of the "done" statement, tell me DONE, NOT DONE or UNCLEAR, based only on what I wrote. Do not assume things I did not say. Then list what I should finish first and whether anything can safely carry into next week.`

const embeddingPrompt = `I am reading about embeddings and I want to check I really understand them. Ask me these one at a time and mark my answer CORRECT, PARTLY or WRONG, telling me plainly if I am wrong:
1. In my own words, what is an embedding?
2. Why is it stored as a list of numbers (a vector) and not as text?
3. What does it mean that two embeddings are "close", and how is closeness measured?
4. Why does that help an app find the right document chunk for a question?
5. What would go wrong if I embedded my documents with one model and my question with a different one?
Do not give hints before I answer.`

function Copy({ text, label }) {
  const [state, setState] = useState('')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setState('Copied')
    } catch {
      setState('Select the text and copy it')
    }
    setTimeout(() => setState(''), 2500)
  }
  return (
    <button type="button" className="btn small" onClick={copy}>
      {state || label || 'Copy prompt'}
    </button>
  )
}

function Prompt({ title, hint, text }) {
  return (
    <div className="prompt">
      <div className="prompt-head">
        <b>{title}</b>
        <Copy text={text} />
      </div>
      {hint && <p className="muted">{hint}</p>}
      <pre tabIndex={0}>{text}</pre>
    </div>
  )
}

export default function TeachBack({ topic, done, hasReading }) {
  return (
    <details className="teachback">
      <summary>How to do this Friday step, with AI tutor prompts</summary>
      <ol className="plain steps">
        <li><b>Check in (10 min).</b> Compare your work with the "Done when" line at the bottom of this page. Write down what is finished, what is not, and what carries over.</li>
        {hasReading && <li><b>Read (30 min).</b> Start with the Azure AI Search RAG overview linked on this page (first section only). It is about retrieval, so if it does not define embeddings clearly, ask an AI assistant to explain them in plain language. You only need to answer two things: what is an embedding, and why is it stored as a vector (a list of numbers that can be compared by closeness)? Then test yourself with the reading prompt below.</li>}
        <li><b>Teach-back (3 min).</b> Explain what you built this week, out loud, without notes: what it does, why you made the choices you did, and what you would fix next.</li>
        <li><b>Get quizzed (10 min).</b> A friend, a mentor or an AI tutor asks you 5 questions. Use the tutor prompt below. If you cannot answer one, that is the thing to review before Monday.</li>
        <li><b>Log it.</b> Put your score and the two weakest areas in "Your log", then tick this step.</li>
      </ol>
      <Prompt title="1. Tutor prompt (the quiz)" hint="Paste into a new chat with any AI assistant, fill in the last line, then give your 3-minute explanation." text={tutorPrompt(topic, done)} />
      <Prompt title="2. Check-in prompt" hint="Optional. Use it if you are not sure whether you are really done." text={checkinPrompt(topic, done)} />
      {hasReading && <Prompt title="3. Embeddings reading check" hint="Use it after the 30-minute reading." text={embeddingPrompt} />}
    </details>
  )
}
