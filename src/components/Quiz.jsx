import { useMemo, useState } from 'react'
import { usePlan } from '../plan-context.js'
import { buildQuiz, gradeQuiz, attemptKey, makeAttempt, attemptsFor, bestAttempt, hasPassed, seenMap, reviewPool, passMarkFor, QUIZ_LEN } from '../quiz.js'
import { fmtShort } from '../lib.js'
import { Inline } from './Inline.jsx'

const LETTERS = ['A', 'B', 'C', 'D']

/**
 * A 5-question quiz for one unit (a week of the AI plan, a two-week block of the data engineering plan),
 * or a mixed review. Every finished attempt is saved as a note, so history syncs with the rest of your progress.
 */
export function QuizCard({ unit, bank, label, st, setNote, weekTopic }) {
  const P = usePlan()
  const history = useMemo(() => attemptsFor(st.notes, P.id, unit), [st.notes, P.id, unit])
  const [phase, setPhase] = useState('idle') // idle | taking | done
  const [quiz, setQuiz] = useState([])
  const [answers, setAnswers] = useState([])
  const [grade, setGrade] = useState(null)
  const passed = hasPassed(history)
  const best = bestAttempt(history)

  const start = () => {
    setQuiz(buildQuiz(bank, { seen: seenMap(history) }))
    setAnswers([]); setGrade(null); setPhase('taking')
  }
  const finish = () => {
    const g = gradeQuiz(quiz, answers)
    setGrade(g); setPhase('done')
    const ts = Date.now()
    setNote(attemptKey(P.id, unit, ts), JSON.stringify(makeAttempt(g, ts)))
  }
  const need = passMarkFor(Math.min(QUIZ_LEN, bank.length))
  const allAnswered = quiz.length > 0 && quiz.every((_, i) => answers[i] !== undefined)

  return (
    <section className="card quiz" aria-label={`Quiz: ${label}`}>
      <div className="quiz-head">
        <div>
          <h3>Quiz: {label}</h3>
          <p className="muted">{Math.min(QUIZ_LEN, bank.length)} questions, pass with {need}. Missed questions come back first on a retake.</p>
        </div>
        <span className={`pill ${passed ? 'pass' : ''}`}>{passed ? 'Passed' : history.length ? 'Not passed yet' : 'Not taken'}{best ? ` · best ${best.s}/${best.n}` : ''}</span>
      </div>

      {phase === 'idle' && (
        <div className="quiz-actions">
          <button className="btn" onClick={start}>{history.length ? 'Take it again' : 'Start the quiz'}</button>
        </div>
      )}

      {phase === 'taking' && (
        <form onSubmit={(e) => { e.preventDefault(); if (allAnswered) finish() }}>
          {quiz.map((item, i) => (
            <fieldset key={item.id + i} className="q">
              <legend><span className="qn">{i + 1}.</span> <Inline text={item.q} /></legend>
              {item.options.map((o, k) => (
                <label key={k} className={`opt ${answers[i] === k ? 'picked' : ''}`}>
                  <input type="radio" name={`q${i}`} checked={answers[i] === k} onChange={() => setAnswers((a) => { const n = [...a]; n[i] = k; return n })} />
                  <span><b>{LETTERS[k]}.</b> <Inline text={o} /></span>
                </label>
              ))}
            </fieldset>
          ))}
          <div className="quiz-actions">
            <button className="btn" type="submit" disabled={!allAnswered}>Check my answers</button>
            <button type="button" onClick={() => setPhase('idle')}>Cancel</button>
            {!allAnswered && <span className="muted">Answer every question to continue.</span>}
          </div>
        </form>
      )}

      {phase === 'done' && grade && (
        <div role="status" aria-live="polite">
          <p className={`result ${grade.passed ? 'ok' : 'bad'}`}>
            <b>{grade.score} of {grade.total}.</b> {grade.passed ? 'Passed.' : `Not passed: you need ${need}.`}
          </p>
          {!grade.passed && <p className="note">{weekTopic ? `Redo the ${weekTopic} work you are weakest on` : 'Redo the work behind the questions you missed'}, then retake. The ones you missed are asked first.</p>}
          {quiz.map((item, i) => {
            const r = grade.results[i]
            return (
              <div key={item.id + i} className={`review ${r.ok ? 'right' : 'wrong'}`}>
                <p><b>{i + 1}. <Inline text={item.q} /></b></p>
                <p>{r.ok ? '✓ Correct: ' : '✗ You chose: '}<span><Inline text={item.options[r.picked]} /></span></p>
                {!r.ok && <p>Right answer: <b><Inline text={item.options[item.correct]} /></b></p>}
                <p className="muted"><Inline text={item.why} /></p>
              </div>
            )
          })}
          <div className="quiz-actions">
            <button className="btn" onClick={start}>{grade.passed ? 'Take another set' : 'Retake'}</button>
            <button onClick={() => setPhase('idle')}>Close</button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <details className="quiz-history">
          <summary>Attempt history ({history.length})</summary>
          <ul className="plain">
            {[...history].reverse().map((a) => <li key={a.ts}>{fmtShort(a.d)}: {a.s}/{a.n} {a.p ? '(passed)' : '(not passed)'}</li>)}
          </ul>
        </details>
      )}
    </section>
  )
}

/** The Tests page: status per week and a mixed review quiz. */
export function Tests({ st, setNote }) {
  const P = usePlan()
  const weeks = P.plan.weeks
  const pool = useMemo(() => reviewPool(P.quiz, Object.keys(P.quiz).map(Number)), [P])
  const passedCount = weeks.filter((w) => hasPassed(attemptsFor(st.notes, P.id, w.n))).length
  return (
    <>
      <h1>Tests</h1>
      <p className="lede">Each week ends with a quiz of {QUIZ_LEN} questions drawn from a larger set, so a retake is different. You pass with {passMarkFor(QUIZ_LEN)}. Questions you miss come back first. The mixed review pulls from everything in the plan.</p>
      <p className="muted"><b>{passedCount} of {weeks.length}</b> weekly quizzes passed.</p>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Quiz</th><th>Status</th><th>Best</th><th>Attempts</th></tr></thead>
          <tbody>
            {weeks.map((w) => {
              const h = attemptsFor(st.notes, P.id, w.n)
              const b = bestAttempt(h)
              return (
                <tr key={w.n}>
                  <td><a href={`#/week/${w.n}`}>Week {w.n}: {w.topic}</a></td>
                  <td>{hasPassed(h) ? 'Passed' : h.length ? 'Not passed' : 'Not taken'}</td>
                  <td>{b ? `${b.s}/${b.n}` : '–'}</td>
                  <td>{h.length}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <ReviewQuiz pool={pool} st={st} setNote={setNote} />
    </>
  )
}

function ReviewQuiz({ pool, st, setNote }) {
  // The review is its own unit ("review") so it keeps a separate history from the weekly quizzes.
  return <QuizCard unit="review" bank={pool} label="Mixed review" st={st} setNote={setNote} />
}
