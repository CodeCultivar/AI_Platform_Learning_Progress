import { useSched } from '../schedule-context.js'
import { fmtDay } from '../lib.js'
import { LINKS } from '../data/de-plan.js'

const jump = (id) => (e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

const PROJECTS = [
  ['1. Batch warehouse', 'Weeks 15 to 16', 'Postgres star schema, dbt models and tests, Airflow DAG, data-quality checks, CI. Measured: row reconciliation, runtime, backfill time.'],
  ['2. Governed lakehouse', 'Weeks 25 to 26', 'Azure and Databricks (or Free Edition), Delta bronze, silver and gold, declarative pipelines, Asset Bundle deploy from CI, Unity Catalog access controls. Measured: shuffle and spill, cost per run, share of rows quarantined.'],
  ['3. Streaming pipeline', 'Weeks 37 to 38', 'Kafka into Delta with a data contract, quality and freshness checks, lineage, a replay test and cost control. Measured: p95 latency, duplicate rate after replay, minutes to detect bad data, dollars per million events.'],
]

export default function HomeDE({ onSchedule, canSignIn, onSignIn }) {
  const sched = useSched()
  const toc = [['what', 'What this is'], ['projects', 'The three projects'], ['cert', 'Certification'], ['honest', 'Limits and honesty'], ['sources', 'Links']]
  return (
    <>
      <header className="hero">
        <p className="eyebrow">Home</p>
        <h1>A 40-week plan to become a data engineer</h1>
        <p className="lede">This site holds the whole plan, tracks your progress and quizzes you every week. You ship something every two weeks and finish with three public projects and a Databricks certification.</p>
        <div className="gate-row">
          <a className="btn" href="#/dashboard">Open the dashboard</a>
          {canSignIn && <button className="pill" onClick={onSignIn}>Sign in with Google to sync devices</button>}
        </div>
        <nav className="toc" aria-label="On this page">
          {toc.map(([id, l]) => <a key={id} href={`#${id}`} onClick={jump(id)}>{l}</a>)}
        </nav>
      </header>

      <section id="what">
        <h2>What this is</h2>
        <p>Forty weeks at about 5 hours a week (one hour each weekday). <b>Your schedule:</b> {fmtDay(sched.start)} to {fmtDay(sched.end)}. <button className="linklike" onClick={onSchedule}>Adjust start date, pace and breaks</button></p>
        <ul className="plain">
          <li><b>Setup:</b> a two-hour workbench before week 1, ending with a SQL baseline score to beat at the end.</li>
          <li><b>Weeks 1 to 40:</b> five daily steps, the links you need and a “done when” check each week.</li>
          <li><b>Quizzes:</b> a five-question quiz each week. Pass with four. Missed questions come back first on a retake, and the Tests page has a mixed review.</li>
          <li><b>Four checkpoints:</b> three published projects and the exam. If you miss one, repeat that block.</li>
        </ul>
        <p className="note"><b>Honest scope:</b> this plan gets you a portfolio, a certification and interview practice. It does not give you data engineering job experience, and the résumé step tells you to say so. Entry-level data engineering roles are a smaller share of postings than mid-level ones, so expect a search of months, and consider adjacent titles such as analytics engineer.</p>
      </section>

      <section id="projects">
        <h2>The three projects</h2>
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Project</th><th>When</th><th>What and what you measure</th></tr></thead>
            <tbody>{PROJECTS.map(([a, b, c]) => <tr key={a}><td><b>{a}</b></td><td>{b}</td><td>{c}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="muted">Each project README states the problem, shows a demo, says what broke and says how you measured it.</p>
      </section>

      <section id="cert">
        <h2>Certification</h2>
        <p>The plan targets the <a href={LINKS.dbxexam[0]} target="_blank" rel="noreferrer noopener">Databricks Certified Data Engineer Associate</a>, booked for the Saturday after week 30. Check the current price, domains and exam guide on Databricks&apos; page before you book: prices and exam versions change. Use only legitimate practice material.</p>
      </section>

      <section id="honest">
        <h2>Limits and honesty</h2>
        <ul className="plain">
          <li><b>Not parked forever:</b> this plan shares your weekday noon to 1 pm slot with the 90-day AI Platform plan, so the default start date here is a placeholder. Set your own in Schedule.</li>
          <li><b>Links are untested:</b> they were written from vendor documentation structure. If one fails, search its title on the same site.</li>
          <li><b>Quiz questions are written for this plan,</b> not copied from any exam. They test understanding. Passing them does not predict passing the certification; use the official practice material for that.</li>
          <li><b>Cost:</b> Azure and Databricks resources can cost money. Set a budget alert first and destroy resources after each session. Check free-tier and credit terms yourself.</li>
          <li><b>Personal accounts only,</b> and no employer data.</li>
        </ul>
      </section>

      <section id="sources">
        <h2>Links</h2>
        <p>Every link used in the plan is on <a href="#/links">All links</a>, grouped by the weeks that use it. The research behind the plan (job-posting analyses, course comparison and certification choice) is in your Data Engineer Career Path document.</p>
      </section>
    </>
  )
}
