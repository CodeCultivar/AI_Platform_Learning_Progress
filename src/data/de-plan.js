import { BLOCKS } from './de-weeks.js'

// The data engineering plan, in the same shape as plan.json so the same views can show it.
// No absolute dates here: the Schedule panel places the weeks on your calendar.
// Link URLs were written from the vendors' documentation structure and have NOT been click-tested;
// if one has moved, search the page title on the same site.

export const LINKS = {
  pgwin: ['https://www.postgresql.org/docs/current/tutorial-window.html', 'PostgreSQL: window functions tutorial', 'Advanced SQL I'],
  pgwinref: ['https://www.postgresql.org/docs/current/functions-window.html', 'PostgreSQL: window function reference', 'Advanced SQL I'],
  pgwith: ['https://www.postgresql.org/docs/current/queries-with.html', 'PostgreSQL: WITH queries (CTEs)', 'Advanced SQL I'],
  datalemur: ['https://datalemur.com/', 'DataLemur SQL practice', 'SQL practice, job search'],
  pgexplain: ['https://www.postgresql.org/docs/current/using-explain.html', 'PostgreSQL: using EXPLAIN', 'Advanced SQL II'],
  pgindex: ['https://www.postgresql.org/docs/current/indexes.html', 'PostgreSQL: indexes', 'Advanced SQL II'],
  pgpart: ['https://www.postgresql.org/docs/current/ddl-partitioning.html', 'PostgreSQL: table partitioning', 'Advanced SQL II'],
  taxi: ['https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page', 'NYC TLC trip record data', 'Practice data'],
  uvdocs: ['https://docs.astral.sh/uv/', 'uv documentation', 'Python for pipelines'],
  httpx: ['https://www.python-httpx.org/', 'HTTPX documentation', 'Python for pipelines'],
  parquet: ['https://arrow.apache.org/docs/python/parquet.html', 'PyArrow: reading and writing Parquet', 'Python for pipelines'],
  pytest: ['https://docs.pytest.org/en/stable/getting-started.html', 'pytest getting started', 'Python for pipelines'],
  pylog: ['https://docs.python.org/3/howto/logging.html', 'Python logging HOWTO', 'Python for pipelines'],
  kimball: ['https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/', 'Kimball dimensional modeling techniques', 'Data modeling'],
  pgimage: ['https://www.postgresql.org/docs/current/sql-createtable.html', 'PostgreSQL: CREATE TABLE', 'Data modeling'],
  dbtlearn: ['https://learn.getdbt.com/', 'dbt Learn (Fundamentals)', 'dbt'],
  dbtdocs: ['https://docs.getdbt.com/docs/introduction', 'dbt documentation', 'dbt'],
  dbttests: ['https://docs.getdbt.com/docs/build/data-tests', 'dbt data tests', 'dbt, data quality'],
  dbtincr: ['https://docs.getdbt.com/docs/build/incremental-models', 'dbt incremental models', 'dbt'],
  astro: ['https://www.astronomer.io/docs/learn', 'Astronomer Learn (Airflow)', 'Airflow'],
  airflow: ['https://airflow.apache.org/docs/apache-airflow/stable/index.html', 'Apache Airflow documentation', 'Airflow'],
  gha: ['https://docs.github.com/en/actions', 'GitHub Actions documentation', 'CI'],
  gx: ['https://docs.greatexpectations.io/docs/home/', 'Great Expectations documentation', 'Data quality'],
  soda: ['https://docs.soda.io/', 'Soda documentation', 'Data quality'],
  sparkdocs: ['https://spark.apache.org/docs/latest/', 'Apache Spark documentation', 'Spark, streaming'],
  sparktune: ['https://spark.apache.org/docs/latest/sql-performance-tuning.html', 'Spark SQL performance tuning', 'Spark'],
  sparkui: ['https://spark.apache.org/docs/latest/web-ui.html', 'Spark web UI', 'Spark'],
  dbxfree: ['https://www.databricks.com/learn/free-edition', 'Databricks Free Edition', 'Spark, Databricks'],
  azfree: ['https://azure.microsoft.com/free/', 'Azure free account', 'Azure'],
  adls: ['https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction', 'Azure Data Lake Storage Gen2 introduction', 'Azure'],
  azrbac: ['https://learn.microsoft.com/azure/role-based-access-control/overview', 'Azure RBAC overview', 'Azure, governance'],
  akv: ['https://learn.microsoft.com/azure/key-vault/general/overview', 'Azure Key Vault overview', 'Azure'],
  tfaz: ['https://learn.hashicorp.com/collections/terraform/azure-get-started', 'Terraform on Azure: get started', 'Infrastructure as code'],
  psfabric: ['https://www.pluralsight.com/', 'Pluralsight (through Kroger): Fabric / DP-700 path', 'Azure'],
  dbxacad: ['https://www.databricks.com/learn/training/home', 'Databricks Academy', 'Databricks'],
  delta: ['https://docs.delta.io/latest/index.html', 'Delta Lake documentation', 'Databricks'],
  dbxdocs: ['https://docs.databricks.com/', 'Databricks documentation', 'Databricks'],
  dbxbundles: ['https://docs.databricks.com/aws/en/dev-tools/bundles/', 'Databricks Asset Bundles', 'Databricks'],
  dbxuc: ['https://docs.databricks.com/aws/en/data-governance/unity-catalog/', 'Unity Catalog documentation', 'Governance'],
  adbdocs: ['https://learn.microsoft.com/azure/databricks/', 'Azure Databricks documentation', 'Azure Databricks'],
  dbxexam: ['https://www.databricks.com/learn/certification/data-engineer-associate', 'Databricks Certified Data Engineer Associate', 'Exam'],
  psspark: ['https://www.pluralsight.com/', 'Pluralsight (through Kroger): Spark / Databricks courses', 'Exam'],
  kafka: ['https://kafka.apache.org/documentation/#gettingStarted', 'Apache Kafka: getting started', 'Streaming'],
  confluent: ['https://developer.confluent.io/', 'Confluent Developer', 'Streaming'],
  compose: ['https://docs.docker.com/compose/', 'Docker Compose documentation', 'Setup, streaming'],
  dcontract: ['https://datacontract.com/', 'Data contract specification', 'Contracts'],
  openlineage: ['https://openlineage.io/docs/', 'OpenLineage documentation', 'Observability'],
  azcost: ['https://learn.microsoft.com/azure/cost-management-billing/costs/quick-acm-cost-analysis', 'Azure Cost Management quickstart', 'Cost'],
  linkedin: ['https://www.linkedin.com/', 'LinkedIn', 'Job search'],
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const linkObj = (k) => ({ url: LINKS[k][0], label: LINKS[k][1] })
const linksText = (keys) => keys.map((k) => `[[LINK ${LINKS[k][0]}|${LINKS[k][1]}]]`).join(', ') + '.'

const weeks = []
BLOCKS.forEach((b) => {
  b.w.forEach((wk, i) => {
    const n = weeks.length + 1
    const ship = i === 1
    const steps = wk.st.map((text, k) => ({ label: DAYS[k], text, ...(wk.gate && k === 4 ? { gate: true } : {}) }))
    const w = {
      n,
      topic: b.t + (ship ? ' (ship week)' : ''),
      title: `Week ${n}: ${b.t}${ship ? ', ship' : ''}`,
      summary: wk.s,
      steps,
      links: b.links.map(linkObj),
      linksText: linksText(b.links),
      done: wk.d,
      notes: [],
      light: false,
    }
    if (wk.gate) w.gate = wk.gate
    weeks.push(w)
  })
})

const kickoff = {
  title: 'Before week 1: set up your workbench',
  summary: 'About 2 hours, once. At the end you have Docker, Python with uv, Git, a repository, a Postgres database you can start with one command, and a baseline SQL score to beat at week 40. Use personal accounts and personal machines for everything except the Pluralsight courses.',
  steps: [
    { label: '15 min, repository', text: 'on your personal GitHub account, create a repository named `data-engineering-portfolio` with a README that says what you are building. Clone it. Each project gets its own folder or its own repository later.' },
    { label: '20 min, tools', text: 'install Docker Desktop, `git`, Python 3.12 or newer and `uv`. Check each with `docker --version`, `git --version`, `python3 --version` and `uv --version`.' },
    { label: '25 min, Postgres', text: 'write a `docker-compose.yml` that starts Postgres 16 with a named volume and a password read from an `.env` file. Run `docker compose up -d`, connect with `psql` or a client, and create a table. Add `.env` to `.gitignore`.' },
    { label: '30 min, SQL baseline', text: 'solve 6 mixed SQL problems on joins, aggregates and one window function, with no help. Time yourself and record the score and time in `PROGRESS.md`. This is your starting point, not a test you can fail.' },
    { label: '15 min, secrets', text: 'install `gitleaks` or enable GitHub secret scanning on the repository, and write one sentence in the README on how you will keep credentials out of Git.' },
    { label: '15 min, log', text: 'create `PROGRESS.md` and write the date, what worked and what blocked you. Then set your start date in Schedule.' },
  ],
  links: ['compose', 'uvdocs', 'datalemur'].map(linkObj),
  linksText: linksText(['compose', 'uvdocs', 'datalemur']),
  done: '`docker compose up -d` gives you a working Postgres, the repository is on GitHub, and your SQL baseline score is written down.',
  notes: [],
}

export const dePlan = {
  title: '40-Week Data Engineer Plan',
  intro: 'You build three portfolio projects in 40 weeks (a tested batch warehouse, a governed Databricks lakehouse and a streaming pipeline with contracts and cost control), sit the Databricks Certified Data Engineer Associate exam, and spend the last two weeks applying. Every two weeks you ship something you can show.',
  kickoff,
  changed: {
    title: 'How the plan is structured',
    blocks: [
      { t: 'p', text: 'The plan assumes about 5 hours a week: one hour each weekday. It is built from 20 two-week blocks. The first week of a block teaches and the second week ships, so you always have something to show every two weeks.' },
      {
        t: 'ul', items: [
          '**Checkpoints.** There are four: three published projects and the exam. If you miss one, repeat that block before moving on.',
          '**One slot.** The plan uses the weekday noon to 1 pm slot. You also have the 90-day AI Platform plan using it, so this plan starts after that one, or you change one of them. Set the start date in Schedule.',
          '**Quizzes.** Every week ends with a 5-question quiz on that block. You pass with 4 of 5.',
          '**Break.** Add a break in Schedule if you want one; the plan shifts around it.',
        ],
      },
    ],
  },
  rules: {
    title: 'Ground rules',
    blocks: [
      { t: 'p', text: 'Three rules keep this safe, cheap and honest.' },
      {
        t: 'ul', items: [
          '**Personal accounts only.** Use personal GitHub, Azure and Databricks accounts. Do not use your employer\'s code, data, credentials or subscriptions, and do not build with Kroger data.',
          '**Money.** Set a budget alert before you create any paid resource, and run `terraform destroy` or delete resources at the end of each session. Check current free-credit terms yourself.',
          '**Honesty.** Write down what broke and how you measured results. The projects are worth more with real numbers than with a polished story, and your résumé should say what you did, not what you hope to be hired for.',
        ],
      },
    ],
  },
  weeks,
  links: Object.entries(LINKS).map(([, [url, label, weeksText]]) => ({ url, label, weeks: weeksText, use: label })),
  after: {
    title: 'After the plan',
    blocks: [
      { t: 'p', text: 'When the exam and three projects are done, pick the next step from what you hear in interviews and see in postings. Common choices: the next certification level, a cloud-specific path (Azure data or AWS data), or going deeper on one project with real users.' },
      { t: 'p', text: 'Review the exam guide again before you sit the exam: Databricks updates it, so check the version you are tested on.' },
    ],
  },
  linksNote: 'These links were written from vendor documentation structure and have not been click-tested. If one fails, search the page title on the same site.',
}
