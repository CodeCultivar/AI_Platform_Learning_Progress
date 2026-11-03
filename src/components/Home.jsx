import { SOURCES } from '../data/sources.js'
import { useSched } from '../schedule-context.js'
import { fmtDay } from '../lib.js'

const jump = (id) => (e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

function Cite({ n }) {
  const list = Array.isArray(n) ? n : [n]
  return (
    <sup className="cite">
      {list.map((x, i) => (
        <span key={x}>{i ? ', ' : ''}<a href={`#src-${x}`} onClick={jump(`src-${x}`)} aria-label={`Source ${x}`}>[{x}]</a></span>
      ))}
    </sup>
  )
}

const ROLES = [
  { role: 'AI/ML Platform Engineer (MLOps)', fit: '9', demand: 'Moderate', pay: 'High', odds: 'Highest', stab: 'High' },
  { role: 'AI Engineer (LLM apps, RAG)', fit: '8.5', demand: 'Very high', pay: 'High', odds: 'Good once the Python/LLM gap closes', stab: 'Medium' },
  { role: 'Data Engineer (Azure/Databricks)', fit: '8.5', demand: 'High', pay: 'Mid-high', odds: 'High', stab: 'Highest' },
  { role: 'Agentic / AI Automation Engineer', fit: '8.5', demand: 'Fast-growing', pay: 'Widest range', odds: 'Good', stab: 'Lowest' },
]

export default function Home({ onSchedule }) {
  const sched = useSched()
  const toc = [['what', 'What this is'], ['research', 'The research behind it'], ['sync', 'How sync works'], ['limits', 'Limits and risks'], ['cert', 'Certification'], ['sources', 'All sources']]
  return (
    <>
      <header className="hero">
        <p className="eyebrow">Home</p>
        <h1>A 90-day plan to become an AI platform engineer</h1>
        <p className="lede">This site holds the whole plan and tracks your progress through it. This page explains what the plan is built on, how your progress syncs across devices, and where every number came from.</p>
        <div className="gate-row">
          <a className="btn" href="#/dashboard">Open the dashboard</a>
        </div>
        <nav className="toc" aria-label="On this page">
          {toc.map(([id, l]) => <a key={id} href={`#${id}`} onClick={jump(id)}>{l}</a>)}
        </nav>
      </header>

      <section id="what">
        <h2>What this is</h2>
        <p>A step-by-step plan to build one deployed, tested, monitored LLM assistant in 11 weeks, then spend Week 12 applying for jobs. The plan is written for about 5 hours a week. <b>Your schedule:</b> {fmtDay(sched.start)} to {fmtDay(sched.end)} at about {sched.hours} hours a week. <button className="linklike" onClick={onSchedule}>Adjust start date, pace and breaks</button></p>
        <ul className="plain">
          <li><b>Kickoff:</b> a 90-minute first session that ends with a running FastAPI app and one passing test.</li>
          <li><b>Weeks 1 to 12:</b> daily steps, the links you need, and a “done when” check for each week.</li>
          <li><b>Four gates:</b> hard checkpoints in Weeks 2, 5, 8 and 11. If you miss one, repeat that week instead of moving on.</li>
          <li><b>Your timeframe:</b> set the start date, the pace and any breaks, and every date on the site follows.</li>
          <li><b>Tracking:</b> tick tasks off, keep a log per week, and see the dashboard fill in.</li>
        </ul>
        <p className="note"><b>Who it suits:</b> someone with software or cloud and infrastructure experience who is moving into AI platform engineering. It assumes you can already write short Python scripts. If you cannot yet, add time before Week 1.</p>
      </section>

      <section id="research">
        <h2>The research behind it</h2>
        <p>Four roles close to software, cloud and data engineering were compared. The AI/ML Platform Engineer was chosen as the first target because it builds most directly on cloud, infrastructure-as-code and security experience.</p>
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Role</th><th>Fit /10</th><th>Demand</th><th>Pay</th><th>Odds for a cloud engineer</th><th>Stability</th></tr></thead>
            <tbody>{ROLES.map((r) => <tr key={r.role}><td>{r.role}</td><td>{r.fit}</td><td>{r.demand}</td><td>{r.pay}</td><td>{r.odds}</td><td>{r.stab}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="muted"><b>Read this first:</b> the fit scores are my own judgment for someone coming from cloud and infrastructure work, not published data. The market figures below come from job-board and recruiter pages that I read through search results, not by opening every page in full, so treat them as rough. The direction was consistent across sources; the exact numbers were not. A source note appears after each role.</p>

        <h3>1. AI/ML Platform Engineer (MLOps): the smallest market, the best match</h3>
        <ul className="plain">
          <li>Hiring held steady at about 70 new US postings a week, and MLOps was about 1% of the AI roles one tracker follows.</li>
          <li>Mid-level was 36% of postings, senior 33%, junior 9%.</li>
          <li>Pay ran from $90K to $257K+ because the title covers three sub-roles; another source put mid-level base pay at $150K to $200K.</li>
          <li>California held 27% of postings, so expect remote or hybrid roles.</li>
          <li><b>Watch for:</b> companies that want MLOps with no models in production, where the job becomes general DevOps. Ask how many models are deployed.</li>
        </ul>
        <p className="muted">Sources consulted: <Cite n={7} /></p>

        <h3>2. AI Engineer (LLM apps, RAG): the biggest market</h3>
        <ul className="plain">
          <li>One analysis counted 43,480 US postings since January 2026, and said the market stayed hot while the rest of tech hiring cooled.</li>
          <li>Two-thirds targeted mid or senior roles; 12% targeted junior engineers.</li>
          <li>Python appeared in 71% of postings and LLMs in 66%. A bachelor's degree appeared in 85% to 94%, which a computer science degree covers.</li>
          <li>Robert Half put base pay at $134K to $193K, midpoint $170,750. Another source found a $140K median for postings requiring generative AI skills versus $77.6K without.</li>
          <li>Nearly half of postings were hybrid and 32% fully remote.</li>
        </ul>
        <p className="muted">Sources consulted: <Cite n={[6, 11]} />. The Robert Half figure appeared in search results and I did not keep its page address, so it has no link.</p>

        <h3>3. Data Engineer (Azure/Databricks): the safest base</h3>
        <ul className="plain">
          <li>18,786 US roles were posted since January 2026, with an overall median salary of $155,000.</li>
          <li>Glassdoor's mid-level median base was $139K (no link kept). A regional search (Columbus, Ohio area) of Azure Databricks listings mostly paid $110K to $136.5K; it comes from a national job board, so treat it as a rough guide to regional pay.</li>
          <li>Almost every posting involved Python loading SQL-queryable data through a pipeline, so Python is your gap here too. About 40% mentioned AI.</li>
        </ul>
        <p className="muted">Sources consulted: <Cite n={[8, 12]} /></p>

        <h3>4. Agentic / AI Automation Engineer: fastest growing, least settled</h3>
        <ul className="plain">
          <li>Stanford's 2026 AI Index was reported to show agentic AI postings up 280% year over year to roughly 90,000 US listings, yet agentic skills appeared in only 0.23% of all postings. I did not open the Stanford report itself.</li>
          <li>Priced MCP listings showed a median range of roughly $170K to $233K; other listings ran from $80K to $135K up to $130K to $300K; one enterprise example paid $135K to $216K.</li>
          <li>“Agentic AI Engineer” as a distinct title is barely two years old, titles are inconsistent, and the board data skews toward startups and Europe.</li>
        </ul>
        <p className="muted">Sources consulted: <Cite n={[9, 10]} /></p>

        <p className="note"><b>Treat the loud growth numbers with suspicion.</b> The 143% (AI engineers) and 280% (agentic roles) growth figures came from vendor and recruiter sites that have a reason to hype. What matters more is that the roles exist and hiring is concentrated at mid and senior levels. Python was the most common requirement across all four roles, which is why the plan has you build real code instead of only collecting certificates.</p>
      </section>

      <section id="sync">
        <h2>How sync works</h2>
        <h3>Without sync: one browser, one copy</h3>
        <p>By default your ticks and notes live in your browser's <code>localStorage</code>. It is kept per site address, survives closing the browser, and never expires on its own <Cite n={5} />. It is cleared when the last private-browsing tab closes, and a browser set to block site data can refuse it entirely <Cite n={5} />. Nothing connects one browser's copy to another's, which is why a second device starts empty.</p>

        <h3>With sync: a private gist as shared storage</h3>
        <p>This site is static pages on GitHub Pages, so it has no server of its own to store your data. Sync borrows one: a <b>secret GitHub gist</b> in your account holds a single file, <code>progress.json</code>. Your browser talks to GitHub directly. Nothing passes through any server of mine.</p>
        <ol className="plain steps">
          <li><b>Connect.</b> You paste a GitHub token. On the first device the site creates the gist (<code>POST /gists</code>); on others you paste its ID <Cite n={2} />.</li>
          <li><b>Stamp every edit.</b> Each tick or note edit records the time it was made, per item.</li>
          <li><b>Pull and merge.</b> The site reads the gist and merges it with your local copy. For each item, the newest edit wins. An un-check is remembered as an edit, so an old tick on another device can't bring it back, and Reset syncs as an edit too.</li>
          <li><b>Push only if needed.</b> If the merged result differs from the gist, the site updates it (<code>PATCH /gists/{'{id}'}</code>) <Cite n={2} />. If not, it sends nothing.</li>
          <li><b>When it runs.</b> About 1.5 seconds after you stop editing, when you return to the tab, and once a minute while the tab is visible.</li>
        </ol>
        <p>Because the merge is per item, ticking Week 3 on your laptop and Week 4 on your phone leaves both ticks in place. Your schedule settings (start date, pace, breaks) sync the same way, so every device shows the same dates.</p>

        <h3>What was tested</h3>
        <p>16 automated tests cover the merge rules (different edits combine, newest wins, un-checks and reset propagate, merging twice changes nothing) and the sync round trip against a fake GitHub. I also ran two separate browser profiles against a mock of the gist API: a tick in one appeared in the other, and the second one's edits came back. <b>I have not run it against the real GitHub API yet</b>, so your first connection is the real test.</p>
      </section>

      <section id="limits">
        <h2>Limits and risks</h2>
        <ul className="plain">
          <li><b>A secret gist is not private.</b> GitHub says anyone with the URL can view it, though it is hidden from search unless you are logged in as its author <Cite n={1} />. Do not write employer-confidential or personal details in your notes.</li>
          <li><b>The token is a password.</b> It is stored only in that browser, in the same <code>localStorage</code>. GitHub recommends fine-grained tokens, calls classic tokens less secure, and recommends an expiration; delete tokens you no longer need <Cite n={3} />. For this site, create a fine-grained token with only the <b>Gists: Read and write</b> account permission and no repository access <Cite n={[2, 3]} />. If GitHub rejects it, fall back to a classic token with only the <code>gist</code> scope. An expired token shows as “token rejected” and sync stops until you replace it.</li>
          <li><b>Device clocks decide “newest”.</b> Timestamps come from each device's clock. A device with a badly wrong clock can win or lose edits wrongly.</li>
          <li><b>Notes merge as a whole.</b> If you edit the same week's log on two devices within a minute, the later edit replaces the other. It does not blend the text.</li>
          <li><b>Not instant.</b> A change on one device can take up to about a minute to appear on another unless you switch tabs.</li>
          <li><b>Hosting.</b> The site is published from GitHub Actions; the one-time setting is Settings, Pages, Source: GitHub Actions <Cite n={4} />.</li>
        </ul>
      </section>

      <section id="cert">
        <h2>Certification after the plan</h2>
        <p>Many study guides still point to the AI-102 exam. Microsoft's retired-exams list shows AI-102 (Azure AI Engineer Associate) retired on June 30, 2026 <Cite n={13} />. That list does not name a replacement. A third-party article names <b>AI-103</b> as the suggested replacement, leading to the Azure AI App and Agent Developer Associate certification, and says there is no automatic migration from AI-102 <Cite n={15} />. Microsoft's AI-103 page confirms the exam exists as a <b>beta</b>, with a passing score of 700, offered in English only, with the price set by country or region <Cite n={14} />. Check that page for current status and price before you book. The plan leaves the exam until after Week 12.</p>
        <p className="muted">One non-Microsoft source mentioned a newer MLOps-focused exam, AI-300. I could not confirm it, so confirm it on Microsoft Learn before planning around it.</p>
      </section>

      <section id="sources">
        <h2>All sources</h2>
        <p className="muted">Learning links for each week are on the <a href="#/links">All links</a> page. These are the sources for the claims on this page.</p>
        {['Sync and hosting', 'Job market', 'Certification'].map((g) => (
          <div key={g}>
            <h3>{g}</h3>
            <ol className="plain src-list">
              {SOURCES.filter((s) => s.group === g).map((s) => (
                <li key={s.n} id={`src-${s.n}`} value={s.n}>
                  <a href={s.url} target="_blank" rel="noreferrer noopener">{s.title} ↗</a>
                  {s.note && <span className="muted"> {s.note}</span>}
                </li>
              ))}
            </ol>
          </div>
        ))}
        <p className="muted">Not linked because I did not keep the page address: Robert Half and Glassdoor salary figures, and the Stanford 2026 AI Index figure. Treat those as unverified.</p>
      </section>
    </>
  )
}
