// The 40 plan weeks of the data engineering plan, written as 20 two-week blocks.
// Each block: t = topic, links = keys into LINKS (de-plan.js), w = [weekA, weekB].
// Each week: s = one-line summary, st = five steps (Mon to Fri, about one hour each), d = "done when".
// The second week of a block is the "ship" week. Text uses the same inline markup as plan.json:
// **bold**, `code` and [[LINK url|label]].

export const BLOCKS = [
  {
    t: 'Advanced SQL I', links: ['pgwin', 'pgwinref', 'pgwith', 'datalemur'], w: [
      {
        s: 'Get fluent with window functions and CTEs on a practice database. This week is about writing them correctly; next week is about volume.',
        st: [
          'load a practice dataset into your Postgres: one month of NYC taxi trips (a few hundred thousand rows) or any dataset with three or more related tables. Run `\\d` on each table and write down its grain, meaning what one row represents.',
          'read the PostgreSQL window functions tutorial, then write queries with `ROW_NUMBER`, `RANK` and `DENSE_RANK` using `PARTITION BY` and `ORDER BY`. Explain in a comment how the three differ when there are ties.',
          'write a running total and a moving average with `SUM(...) OVER (ORDER BY ... ROWS BETWEEN ...)`, and use `LAG` and `LEAD` for a day-over-day change. Check one result by hand.',
          'rewrite three nested subqueries as CTEs, then write one recursive CTE, for example a date series or a manager hierarchy.',
          'solve 8 practice problems on window functions and CTEs without looking at solutions first. Commit them to `sql/`, then take this week\'s quiz.',
        ],
        d: 'you can write `ROW_NUMBER`, running-total and `LAG` queries without looking anything up, 8 solved problems are committed to `sql/`, and you passed this week\'s quiz.',
      },
      {
        s: 'Volume week: solve problems until window functions, joins and aggregates are automatic, then ship the set.',
        st: [
          'solve 7 problems on joins at scale: self-joins, anti-joins with `NOT EXISTS`, and the difference between a filter in `ON` and a filter in `WHERE` on a `LEFT JOIN`. Predict the row count before you run each query.',
          'solve 7 problems on aggregation: `FILTER (WHERE ...)`, `ROLLUP` or `GROUPING SETS`, and `HAVING`. Write down any mistake you make twice.',
          'solve 8 problems on top-N per group, deduplication with `ROW_NUMBER`, and gaps-and-islands such as consecutive-day streaks.',
          'redo your three slowest or most-failed problems from memory in a blank file, with a 10-minute timer for each.',
          'ship: tidy `sql/` so every file has the problem, your query and a one-line note. Push it, check you have at least 30 solved problems, then take this week\'s quiz.',
        ],
        d: '30 solved problems are committed with a note each, you can redo a window-function problem in 10 minutes, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Advanced SQL II and query performance', links: ['pgexplain', 'pgindex', 'pgpart', 'taxi'], w: [
      {
        s: 'Learn to read a query plan and to fix a slow query with the right index.',
        st: [
          'load a table of at least 5 million rows: several months of NYC taxi trips, or rows generated with `generate_series`. Record the row count and the table size with `pg_size_pretty(pg_total_relation_size(...))`.',
          'read how to use `EXPLAIN` in the PostgreSQL docs, then run `EXPLAIN (ANALYZE, BUFFERS)` on three queries that filter, join and aggregate. For each, name the scan type, the join method and where most of the time goes.',
          'add a B-tree index that helps one query, run `EXPLAIN ANALYZE` again and record the before and after times. Then find a query an index does not help, and explain why.',
          'learn composite index column order and partial indexes. Create one of each and show with `EXPLAIN` that the planner uses them.',
          'run `ANALYZE`, compare estimated rows with actual rows in a plan, and write down one case where they disagree. Then take this week\'s quiz.',
        ],
        d: 'you can read an `EXPLAIN ANALYZE` plan, you have before and after timings for at least three queries, and you passed the quiz.',
      },
      {
        s: 'Partition the big table, tune three slow queries and write down the evidence.',
        st: [
          'partition the 5-million-row table by month with declarative partitioning (`PARTITION BY RANGE`), load the data into it and use `EXPLAIN` to confirm partition pruning.',
          'run the same aggregate on the partitioned and the plain table and record both timings.',
          'write the three slowest queries you can on this data, then rewrite each one to be faster: filter earlier, select fewer columns, avoid functions on indexed columns. Record the timings.',
          'write `docs/sql-performance.md`: for each of the three queries, the query, what was wrong in the plan, the fix, and the before and after timings in a table.',
          'ship: push the note and the DDL scripts so someone else can reproduce your timings, then take this week\'s quiz.',
        ],
        d: '`docs/sql-performance.md` shows three slow queries with before and after timings, the scripts reproduce them, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Python for pipelines', links: ['uvdocs', 'httpx', 'parquet', 'pytest', 'pylog'], w: [
      {
        s: 'Write an ingestion script you could hand to a teammate: typed, logged and tested.',
        st: [
          'create a project with `uv init`, add `httpx`, `pyarrow`, `pytest` and `ruff`, and commit `pyproject.toml` and `uv.lock`. Choose a public API or file source, such as NYC open data, and fetch one page from a script.',
          'write `extract()` so it pages through the source with a timeout, retries on 429 and 5xx responses with exponential backoff, and cannot loop forever. Log each request with the standard `logging` module.',
          'write `transform()` with type hints and a dataclass or Pydantic model that validates each record. Send records that fail validation to a rejects file with the reason.',
          'write `load()` so it writes Parquet with a stable schema, partitioned by date, and is idempotent: running it twice leaves the same files.',
          'write 6 pytest tests for transform and load, using a fixture and a fake HTTP response so nothing touches the network. Then take this week\'s quiz.',
        ],
        d: '`extract`, `transform` and `load` run end to end, 6 tests pass offline, and running the load twice produces identical output.',
      },
      {
        s: 'Make the script a proper package with configuration, logging and CI, then tag a release.',
        st: [
          'add configuration from environment variables with a `Settings` class and no secrets in code, and a `--date` command line argument using `argparse` or `typer`.',
          'package the code so `uv run ingest --date 2026-01-01` works from a clean clone, and add run steps to the README.',
          'log one structured line per run with counts (fetched, valid, rejected, written), and make any failure exit with a non-zero code.',
          'add a GitHub Actions workflow that runs `ruff` and `pytest` on every push, using `uv`.',
          'ship: tag a release `v0.1.0`, confirm the Actions run is green from a fresh clone, then take this week\'s quiz.',
        ],
        d: 'a fresh clone runs the ingest with one command, CI is green, run counts are logged, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Data modeling', links: ['kimball', 'pgimage'], w: [
      {
        s: 'Design before you build: learn grain, facts and dimensions on the dataset you will reuse in Project 1.',
        st: [
          'read Kimball\'s dimensional modeling techniques: grain, fact tables, dimension tables and surrogate keys. Write the four design steps (business process, grain, dimensions, facts) in your own words.',
          'choose the Project 1 dataset (NYC taxi trips is a safe default). Write the business questions it should answer, and the grain of the main fact table in one sentence.',
          'sketch a star schema: one fact table and four or more dimensions (date, location, payment type, vendor). List each column, its type, and whether it is a measure, a key or an attribute.',
          'learn slowly changing dimensions. Compare Type 1 and Type 2, and decide which dimension in your design needs Type 2 and why.',
          'write the first half of `docs/model.md`: the grain, and the fact and dimension tables as a table of columns. Then take this week\'s quiz.',
        ],
        d: '`docs/model.md` states the grain and lists every fact and dimension column, and you passed the quiz.',
      },
      {
        s: 'Turn the design into tables, build one Type 2 dimension and write down when you would choose a different model.',
        st: [
          'add a date dimension generated with `generate_series`, covering your data\'s date range plus a year, with weekday, month, quarter and holiday-flag columns.',
          'write the DDL for the star schema in Postgres with primary keys, foreign keys and sensible types. Load a small sample by hand and answer one business question.',
          'implement a Type 2 dimension with `valid_from`, `valid_to` and `is_current`. Write the SQL that closes the old row and inserts the new one when an attribute changes, and test it with one change.',
          'compare a star schema with one wide denormalized table and with the bronze, silver and gold layers used in lakehouses. Add half a page to `docs/model.md` on when you would choose each.',
          'ship: finish `docs/model.md` with a diagram (draw.io or Mermaid), the grain of each fact table and the Type 2 test. Push it, then take this week\'s quiz.',
        ],
        d: 'the schema loads in Postgres, the Type 2 change is tested, `docs/model.md` has a diagram and a model-choice note, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Transforming with dbt', links: ['dbtlearn', 'dbtdocs', 'dbttests', 'dbtincr'], w: [
      {
        s: 'Build a tested dbt project on your star schema: staging models, marts and tests.',
        st: [
          'start dbt Fundamentals (about 5 hours across this block). Install dbt with the Postgres adapter using `uv add dbt-postgres` and run `dbt debug` against your database.',
          'build the staging layer: one `stg_` model per raw table that only renames, casts types and does light cleaning. Declare the raw tables as sources in YAML.',
          'add `unique` and `not_null` tests to every primary key and `relationships` tests to foreign keys. Run `dbt test` and fix the failures honestly.',
          'build a dimension model and a fact model in a `marts` folder from your staging models, using `ref()` so dbt builds them in order.',
          'run `dbt build`, run `dbt docs generate` and study the lineage graph. Then take this week\'s quiz.',
        ],
        d: '`dbt build` passes on staging and marts, every key has tests, and you passed the quiz.',
      },
      {
        s: 'Add incremental models, a snapshot, custom tests and documentation, then ship the project.',
        st: [
          'convert the fact model to an incremental model with a `unique_key` and an `is_incremental()` filter. Run it twice and confirm there are no duplicates.',
          'add a snapshot (Type 2 history) for one changing dimension and a seed for a small lookup table.',
          'write one custom generic test and one singular test, which is a SQL file that must return zero rows, for example "no negative fares".',
          'add model and column descriptions in YAML for every mart so a newcomer can read the docs site.',
          'ship: run `dbt build` from scratch with 20 or more tests passing, add a docs screenshot to the README, push, then take this week\'s quiz.',
        ],
        d: '`dbt build` from scratch passes with at least 20 tests, the incremental model gives no duplicates on a rerun, the docs are readable, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Orchestration with Airflow', links: ['astro', 'airflow', 'gha'], w: [
      {
        s: 'Run Airflow locally and orchestrate your ingest with retries, idempotency and backfills.',
        st: [
          'run Airflow locally (Docker Compose from the Airflow docs, or the Astronomer CLI) and open the UI. Start Astronomer\'s Airflow Fundamentals course (about 2.5 hours).',
          'write a DAG with the TaskFlow API: `extract`, `transform` and `load` tasks that call your Python package, scheduled daily with `catchup=False`. Trigger it by hand and read the task logs.',
          'set `retries`, `retry_delay` and a task timeout, and add a failure callback that logs or emails. Break a task on purpose and watch the retries.',
          'make every task idempotent and use the run\'s logical date instead of "today", so rerunning a past date writes the same data.',
          'run a backfill for 7 past days (from the UI or the CLI), confirm there are no duplicates, then take this week\'s quiz.',
        ],
        d: 'the DAG runs daily, a failed task retries, a 7-day backfill produces no duplicates, and you passed the quiz.',
      },
      {
        s: 'Chain ingest, dbt and tests in one DAG, add alerting, break it on purpose and draft Project 1.',
        st: [
          'add a task that runs `dbt build` after the load, with `BashOperator` (or Cosmos if you want to try it), so the DAG runs ingest, transform and tests in order.',
          'add a sensor or check task that waits for the source data with a timeout and fails clearly if the data never arrives.',
          'add alerting: a failure notification and a "data too old" check. Write two sentences on how this would page someone on a real team.',
          'break three things on purpose: a bad source file, a database restart mid-run and a duplicate trigger. Write down what happened and what you changed.',
          'ship: record a 2-minute demo of a DAG run, add it to a draft README, push, then take this week\'s quiz.',
        ],
        d: 'one DAG runs ingest, dbt build and tests, three deliberate failures are written up, a draft README with a demo is pushed, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Data quality, CI and Project 1', links: ['gx', 'soda', 'gha', 'dbttests'], w: [
      {
        s: 'Add checks beyond dbt, decide which ones block the pipeline, and run everything in CI.',
        st: [
          'add data-quality checks beyond dbt with Great Expectations or Soda: row counts, null rates, value ranges and freshness on your raw and mart tables.',
          'decide which checks are critical (stop the pipeline) and which only warn. Write that policy in `docs/quality.md`.',
          'put the checks in the DAG so a critical failure stops downstream tasks and a warning is only logged.',
          'extend GitHub Actions so a pull request runs `ruff`, `pytest` and `dbt build` against a throwaway Postgres service container.',
          'inject 5 bad rows into the source and confirm your checks catch them. Record which check caught which row, then take this week\'s quiz.',
        ],
        d: 'critical checks stop the DAG, CI runs the full build on a pull request, five injected bad rows are all caught, and you passed the quiz.',
      },
      {
        s: 'Measure, write up and publish Project 1: a batch warehouse with orchestration and tests.',
        st: [
          'write the README skeleton: the problem, an architecture diagram, a one-command run, and an empty results table with these metrics: row reconciliation, DAG runtime, tests written versus failures caught, and backfill time for 12 months.',
          'measure: reconcile row counts from raw to mart (the target is 100%), time a full run and an incremental run, and time a 12-month backfill. Fill in the table.',
          'write the "what broke" section: at least three real failures you hit, each with its cause and its fix.',
          'clean the repository: no secrets or large files, a license, pinned dependencies, and a secret scan with `gitleaks` over the whole history.',
          'checkpoint 1: make the repository public, ask a friend or a fresh machine to run it from the README alone, then take this week\'s quiz.',
        ],
        d: 'Project 1 is public with a README that states the problem, shows a demo, says what broke and how you measured it, and someone else can run it from the README.',
        gate: 1,
      },
    ],
  },
  {
    t: 'Spark', links: ['sparkdocs', 'sparktune', 'sparkui', 'dbxfree'], w: [
      {
        s: 'Learn the DataFrame API, lazy evaluation and how to read the Spark UI.',
        st: [
          'set up PySpark locally with `uv add pyspark` or use Databricks Free Edition. Read the Spark SQL getting-started guide and run your first job.',
          'redo three of your SQL practice queries with the DataFrame API and again with Spark SQL, and check that both give the same result.',
          'learn lazy evaluation: write a chain of transformations and call `explain()` before any action. List which of your calls are transformations and which are actions.',
          'read a Parquet dataset of at least a few million rows and compare a full scan with a filtered query that benefits from partitioning or column pruning.',
          'open the Spark UI for a job and find its stages, tasks and the shuffle read and write sizes. Then take this week\'s quiz.',
        ],
        d: 'you can explain lazy evaluation and the difference between a transformation and an action, you can find a shuffle in the Spark UI, and you passed the quiz.',
      },
      {
        s: 'Fix a join, a skewed key and partition sizes, and record before and after numbers from the Spark UI.',
        st: [
          'join a large table to a small one and read the physical plan. Then force a broadcast join and compare the run time and shuffle size.',
          'create or find a skewed key (one value with a large share of rows), run the join and find the straggler task in the Spark UI.',
          'fix the skew by salting the key or by turning on adaptive query execution\'s skew handling, and record the before and after stage times.',
          'tune partitions: change `spark.sql.shuffle.partitions`, compare `repartition` with `coalesce`, and write output with sensible file sizes. Record the effect.',
          'ship: write `docs/spark-notes.md` with the before and after Spark UI numbers for the skew fix, push the job, then take this week\'s quiz.',
        ],
        d: '`docs/spark-notes.md` shows a skewed join fixed with before and after Spark UI numbers, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Azure and infrastructure as code', links: ['azfree', 'adls', 'azrbac', 'akv', 'tfaz', 'psfabric'], w: [
      {
        s: 'Use a personal Azure subscription (never Kroger\'s) to store data, control access and keep secrets safe. If you already run Azure at work, move fast and spend the time on the data-specific parts.',
        st: [
          'create an Azure free account on your personal email, confirm the current credit terms, and immediately create a monthly budget with email alerts at a low limit you choose.',
          'create a storage account with hierarchical namespace (ADLS Gen2) and a container, upload a Parquet file, and read it from Python with the Azure SDK using your own sign-in, not an account key.',
          'learn the data roles: Storage Blob Data Reader versus Contributor. Give one to a service principal or managed identity, show that access works, and show that the wrong role fails.',
          'put a secret in Key Vault and read it from a script using your identity. Write down why that beats an `.env` file.',
          'skim the first course of Pluralsight\'s Fabric (DP-700) path to see how Fabric differs from Azure Databricks. Write 5 lines on it, then take this week\'s quiz.',
        ],
        d: 'the budget alert exists, you read data from ADLS Gen2 with a role-based identity, a wrong role fails as expected, and you passed the quiz.',
      },
      {
        s: 'Build the same storage and access setup in Terraform, run it, and destroy it cleanly.',
        st: [
          'write Terraform for a resource group, a storage account with ADLS Gen2, a container and a budget alert. Use variables, and keep secrets out of the code.',
          'add a Key Vault and a role assignment so a managed identity can read the data. Run `terraform plan` and read every line of it.',
          'add tags, and write a `Makefile` target or script for `terraform destroy` so tearing down is one command.',
          'run `terraform apply`, upload and read a file, then run `terraform destroy` and check the portal to confirm nothing is left.',
          'ship: push the module with a README that gives the monthly cost of what it creates, then take this week\'s quiz.',
        ],
        d: 'one `terraform apply` builds the storage and access, one `terraform destroy` removes it, the README states the cost, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Databricks I', links: ['dbxfree', 'dbxacad', 'delta', 'dbxdocs'], w: [
      {
        s: 'Learn Delta Lake, Unity Catalog and Auto Loader on Databricks Free Edition.',
        st: [
          'sign up for Databricks Free Edition and take Databricks Fundamentals in Databricks Academy. Free Edition does not include the Academy guided labs, so practise in your own workspace.',
          'create a Delta table, run `DESCRIBE HISTORY`, query an older version with time travel, then make a bad update and undo it with `RESTORE`.',
          'learn Unity Catalog\'s three-level names (`catalog.schema.table`). Create a catalog, a schema, a managed table and a volume, and write down the difference between a managed and an external table.',
          'ingest files with Auto Loader into a bronze table with a checkpoint. Add a new file and watch only the new data load.',
          'write a short note on how Delta gives you ACID transactions through its transaction log. Then take this week\'s quiz.',
        ],
        d: 'you can time-travel and restore a Delta table, create objects in Unity Catalog, load files incrementally with Auto Loader, and you passed the quiz.',
      },
      {
        s: 'Build bronze, silver and gold layers with a merge, maintenance and a scheduled job.',
        st: [
          'build the silver layer from bronze: clean, deduplicate and conform types, and use `MERGE INTO` for updates.',
          'build the gold layer: two aggregated tables that answer real business questions.',
          'run `OPTIMIZE`, look at what `VACUUM` removes and its default retention, and write down why short retention is risky.',
          'schedule the three steps as a job with task dependencies. Run it twice and confirm silver has no duplicates.',
          'ship: add the bronze, silver and gold diagram and the row counts at each layer to your README, push the code, then take this week\'s quiz.',
        ],
        d: 'a scheduled job builds bronze, silver and gold, a rerun creates no duplicates, the README shows the layers and counts, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Databricks II', links: ['dbxdocs', 'dbxbundles', 'dbxacad', 'gha'], w: [
      {
        s: 'Rebuild the pipeline as a declarative pipeline with expectations, and learn Lakeflow Jobs.',
        st: [
          'read the overview of Lakeflow Spark Declarative Pipelines (the framework formerly called Delta Live Tables) and rebuild your bronze-to-silver step as a declarative pipeline.',
          'add data-quality expectations to the pipeline (warn, drop or fail on violation) and look at the quality metrics it reports.',
          'learn Lakeflow Jobs: multi-task jobs, retries, parameters, conditional tasks and failure alerts.',
          'add a run-date parameter to the job and make the job safe to rerun.',
          'compare Auto Loader, Lakeflow Connect and a plain batch read, and write 5 lines on when you would use each. Then take this week\'s quiz.',
        ],
        d: 'a declarative pipeline with expectations runs inside a parameterised job that is safe to rerun, and you passed the quiz.',
      },
      {
        s: 'Package everything as a Databricks Asset Bundle and deploy it from CI.',
        st: [
          'install the Databricks CLI, create an Asset Bundle for your pipeline and job, and run `databricks bundle validate`.',
          'define `dev` and `prod` targets in the bundle with different catalogs or schemas, and deploy to `dev`.',
          'add a GitHub Actions workflow that validates the bundle on a pull request and deploys to `dev` on merge. Keep the token or OIDC credential in a repository secret, never in code.',
          'add a test that runs the pipeline on a tiny fixture dataset and asserts on the output table.',
          'ship: deploy from CI end to end, record the deploy time, add a short README section, push, then take this week\'s quiz.',
        ],
        d: 'a merge deploys the bundle to `dev` from CI, a fixture-based test passes, the deploy time is recorded, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Governance and security', links: ['dbxuc', 'dbxdocs', 'azrbac'], w: [
      {
        s: 'Learn Unity Catalog access control, row filters, column masks, lineage and audit.',
        st: [
          'learn Unity Catalog privileges: `GRANT` and `REVOKE` on catalogs, schemas and tables, ownership, and least privilege. Grant different access to two principals (two groups if your workspace allows it, otherwise a user and a service principal).',
          'add a row filter and a column mask to a table, for example masking a card-number-like column, and show that two principals see different results.',
          'explore lineage in the catalog: run a pipeline and view the upstream and downstream tables of a gold table.',
          'look at system tables for audit: write a query that shows who read a table and when.',
          'learn data classification basics: tags for sensitive columns, retention and ownership. Write a one-page data-ownership note for your gold tables, then take this week\'s quiz.',
        ],
        d: 'two principals see different data through a row filter and a column mask, you can show lineage and an audit query, and you passed the quiz.',
      },
      {
        s: 'Put governance in code, test it, and write the governance document for Project 2.',
        st: [
          'put your grants, row filters and masks in code (SQL scripts or Terraform) so they can be reviewed and reapplied.',
          'write the access-request process in a short document: who approves, how long access lasts and how it is reviewed.',
          'write tests showing that a restricted principal cannot read masked data and that a missing grant fails.',
          'write `docs/governance.md`: classification, access model, a lineage screenshot, the audit query, retention and who owns what.',
          'ship: push the scripts and the document, then take this week\'s quiz.',
        ],
        d: '`docs/governance.md` and the access scripts are pushed, tests prove the controls work, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Project 2: governed lakehouse', links: ['dbxbundles', 'dbxuc', 'tfaz', 'adbdocs'], w: [
      {
        s: 'Design and build Project 2 end to end. If you have no Azure credit for Azure Databricks, build in Free Edition and validate the Azure parts with `terraform plan`, and say so in the README.',
        st: [
          'choose a public retail-transactions dataset and write a one-page design: the problem, the layers, the owners, the quality rules and a cost budget.',
          'write Terraform for storage and role assignments, and for the Databricks resources your account allows.',
          'build bronze with Auto Loader and silver and gold with declarative pipelines and expectations.',
          'add the job, the bundle and the CI deploy, then apply the grants, row filters and masks from the governance block.',
          'run the whole thing from scratch once and list everything that failed. Then take this week\'s quiz.',
        ],
        d: 'the full pipeline runs from scratch, a list of what failed is written down, and you passed the quiz.',
      },
      {
        s: 'Measure Project 2, write it up and publish it.',
        st: [
          'measure shuffle and spill in the Spark UI for the heaviest step, fix one problem and record before and after.',
          'get job time and dollars per run from the billing system tables or the Azure cost view. If neither is available, estimate from the published rates and label the number as an estimate.',
          'measure the share of rows quarantined or dropped by expectations, and the deploy time from CI.',
          'write the README: the problem, a diagram, a demo (a deploy from CI, a run, and a masked column seen by a non-admin), what broke (at least three things) and how you measured it.',
          'checkpoint 2: publish, run the secret scan, tear down any paid resources, then take this week\'s quiz.',
        ],
        d: 'Project 2 is public with a README that states the problem, shows a demo, says what broke and how you measured it, and paid resources are deleted.',
        gate: 2,
      },
    ],
  },
  {
    t: 'Exam prep I', links: ['dbxexam', 'dbxacad', 'psspark', 'dbxdocs'], w: [
      {
        s: 'Find your gaps against the exam guide. Use only legitimate practice material; "exam dump" sites break the exam rules and often sell questions from retired versions.',
        st: [
          'read the exam guide for the Databricks Certified Data Engineer Associate: seven domains and their weights. Mark each topic green, amber or red by honest confidence.',
          'take a timed practice set of 45 questions in 90 minutes from a legitimate source such as the Databricks Academy practice exam or Pluralsight. Record your score by domain.',
          'work on your two weakest domains: re-read the docs and redo the matching hands-on steps.',
          'work through the Pluralsight Spark-on-Databricks path (2 hours) and the Databricks Academy data engineer lessons for your amber and red topics.',
          'book the exam for the Saturday at the end of week 30, after checking whether a Databricks Learning Festival discount voucher is available. Write the date in your log, then take this week\'s quiz.',
        ],
        d: 'you have a domain-by-domain gap list, a first practice score, and the exam booked for the Saturday at the end of week 30.',
      },
      {
        s: 'Close the gaps with hands-on work and a second practice set.',
        st: [
          'take a second timed practice set and compare each domain with your week 27 score.',
          'build one small hands-on example for each weak domain.',
          'governance and security (15% of the exam): rehearse Unity Catalog grants, ownership and lineage until you can explain each one without notes.',
          'ingestion and transformation (about 43% of the exam): rehearse Auto Loader, `MERGE` and PySpark or SQL reshaping from memory.',
          'ship: write a one-page cheat sheet in your own words, not copied from anywhere. The target is 80% on a timed practice set. Then take this week\'s quiz.',
        ],
        d: 'your second practice score is higher than the first, every weak domain has a worked example, your own cheat sheet is written, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Exam prep II and exam', links: ['dbxexam', 'dbxacad', 'psspark', 'sparkui'], w: [
      {
        s: 'Cover the remaining domains and take a third timed practice set.',
        st: [
          'Lakeflow Jobs and CI/CD (26% of the exam together): rebuild a job with a parameter and a retry, and explain Asset Bundle targets from memory.',
          'troubleshooting, monitoring and optimization (10%): read a Spark UI and a failed job\'s logs, and list the five most common causes of slow or failed jobs.',
          'take a third timed practice set of 90 minutes. Review every wrong answer and write why it was wrong.',
          'redo only the questions you got wrong, then do light review only. Stop learning new material.',
          'check logistics: the exam rules, your ID, the room and the online-proctoring software, and run the system check. Then take this week\'s quiz.',
        ],
        d: 'your third practice score is recorded, every wrong answer has a written reason, and your exam logistics are checked, and you passed the quiz.',
      },
      {
        s: 'Exam week. The exam itself is on the Saturday at the end of this week; it runs 90 minutes, which is longer than a lunch hour.',
        st: [
          'take a fourth timed practice set. The target is 80% or higher.',
          'review only the wrong answers.',
          'skim your cheat sheet and the exam guide once, then stop new material.',
          'do something light: an easy review of Delta Lake and Unity Catalog basics.',
          'checkpoint 3: readiness check. A final 20-question set at 80% or higher means go. Below 80% means move the exam two weeks later and say so in your log. Sleep early, then take this week\'s quiz.',
        ],
        d: 'you sat the exam on Saturday and logged the result, or you moved the date and wrote down why.',
        gate: 3,
      },
    ],
  },
  {
    t: 'Streaming basics', links: ['kafka', 'confluent', 'compose', 'sparkdocs'], w: [
      {
        s: 'Learn Kafka basics and write a streaming job that survives a restart.',
        st: [
          'learn Kafka basics: topics, partitions, offsets and consumer groups. Run Kafka in Docker Compose and produce and consume messages from the command line.',
          'write a Python producer that emits fake order events as JSON with an event time, and a consumer that reads them. Note what the message key does to partitioning.',
          'learn delivery guarantees (at most once, at least once, exactly once) and idempotent producers. Write down which guarantee your pipeline needs and why.',
          'read the Structured Streaming guide on triggers, output modes and checkpoints, then write a stream that reads from Kafka and writes to a Delta table, in local Spark or on Databricks.',
          'stop the stream and restart it from its checkpoint, and check that no data is lost or duplicated. Then take this week\'s quiz.',
        ],
        d: 'a stream from Kafka into Delta restarts from its checkpoint without losing or duplicating data, and you passed the quiz.',
      },
      {
        s: 'Handle late data and duplicates, prove it with a replay test, and measure latency.',
        st: [
          'handle late data: add a watermark and a windowed aggregation, and send late events on purpose to see what gets dropped.',
          'handle duplicates: de-duplicate on an event ID within a watermark, or use `MERGE` inside `foreachBatch`.',
          'write the replay test: replay the same 10,000 events twice and assert the output has no duplicates.',
          'measure end-to-end latency from event time to the row appearing in the table. Record the median and the 95th percentile.',
          'ship: push the pipeline and a README note describing the latency numbers and the replay test, then take this week\'s quiz.',
        ],
        d: 'a replay test shows zero duplicates, you have median and 95th-percentile latency numbers, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Data quality, contracts and observability', links: ['dcontract', 'openlineage', 'gx', 'soda'], w: [
      {
        s: 'Write and enforce a data contract and define service levels for your table.',
        st: [
          'learn data contracts: schema, meaning, freshness and ownership. Write a YAML contract for your event stream.',
          'enforce the contract in code: validate incoming events against it and send violations to a quarantine table.',
          'write down what counts as a breaking change (removing a field, changing a type) and what is safe (adding an optional field), and test one of each against your validator.',
          'define freshness and completeness targets for your gold table, for example data no older than 15 minutes and 99.5% of events present.',
          'build a check that measures those targets and writes one result row per run. Then take this week\'s quiz.',
        ],
        d: 'a contract is enforced with a quarantine table, freshness and completeness are measured per run, and you passed the quiz.',
      },
      {
        s: 'Add alerting and lineage, measure how well your checks catch bad data, and write the runbook.',
        st: [
          'add alerting: when a target is missed, send a message (email or webhook) with enough context to act on.',
          'add lineage: emit OpenLineage events from Spark or Airflow, look at them, and see which tables depend on which.',
          'inject 10 bad records of different kinds and measure how many your checks catch and how fast.',
          'write the runbook: for each alert, what it means, how to check it, who owns it and how to fix it.',
          'ship: push the quality suite, the contract and the runbook, add the detection-time table to the README, then take this week\'s quiz.',
        ],
        d: 'alerts fire with context, lineage is visible, a table shows how many of 10 injected bad records were caught and how fast, a runbook exists, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Cost control', links: ['azcost', 'adbdocs', 'dbxdocs'], w: [
      {
        s: 'Learn what drives cost and put guardrails on it. If your workspace is Free Edition, write the policy and the budget as code or documents and say in the notes how they would apply on a paid workspace.',
        st: [
          'learn the cost drivers on Databricks and Azure: compute (DBUs and VMs), storage and data movement. Make a table of what each of your projects costs per run.',
          'write a cluster policy (or job-compute settings) that caps size, forces auto-termination and requires tags.',
          'compare serverless and classic job compute for one job: cost, startup time and control.',
          'query the billing system tables if you have them: cost by tag, by job and by day.',
          'set budgets and alerts in Azure Cost Management, then take this week\'s quiz.',
        ],
        d: 'a cost-per-run table exists for your projects, a policy that caps compute is written, budgets and alerts are set, and you passed the quiz.',
      },
      {
        s: 'Cut the cost of your most expensive job, measure each change, and publish the numbers.',
        st: [
          'pick your most expensive job and list three cost levers: cluster size, file size, caching, schedule and incremental processing.',
          'apply the levers one at a time and measure the cost after each change.',
          'add storage lifecycle rules and `OPTIMIZE` and `VACUUM` settings, and note the saving.',
          'build a small cost dashboard (a SQL dashboard or a notebook chart) showing daily cost and cost per run.',
          'ship: write `docs/cost.md` with before and after cost in dollars for the job, push it, then take this week\'s quiz.',
        ],
        d: '`docs/cost.md` shows a measured before and after cost for one job, a cost dashboard exists, and you passed the quiz.',
      },
    ],
  },
  {
    t: 'Project 3: streaming pipeline', links: ['kafka', 'dcontract', 'openlineage', 'dbxdocs'], w: [
      {
        s: 'Assemble Project 3 from the streaming, contract, quality and cost work.',
        st: [
          'write the one-page design for Project 3: events in, a trustworthy table out, with a contract, quality checks, lineage and a cost budget.',
          'assemble the producer, the stream and the Delta tables into one repository with one command to run it.',
          'add the data contract and quarantine table.',
          'add the freshness and completeness checks, alerts and lineage events.',
          'add the cost dashboard and the cost per million events, run the whole thing from scratch, then take this week\'s quiz.',
        ],
        d: 'the whole pipeline starts with one command, it enforces the contract, checks its own service levels and reports cost, and you passed the quiz.',
      },
      {
        s: 'Measure, break, write up and publish Project 3.',
        st: [
          'measure the 95th-percentile latency, the duplicate rate after a replay (the target is zero), the minutes to detect 10 injected bad records, and the dollars per million events.',
          'break three more things on purpose and write down what happened.',
          'write the README: the problem, an architecture diagram, a demo (inject bad events and see the alert; kill the job and see the replay), what broke and how you measured it.',
          'clean the repository and run the secret scan.',
          'checkpoint 4: publish, ask someone to run it from the README alone, then take this week\'s quiz.',
        ],
        d: 'Project 3 is public with a README that states the problem, shows a demo, says what broke and how you measured it, and someone else can run it.',
        gate: 4,
      },
    ],
  },
  {
    t: 'Portfolio and job search', links: ['linkedin', 'datalemur'], w: [
      {
        s: 'Turn three projects and an exam into a portfolio, a résumé and a target list. Be honest on the résumé: you have projects, not data engineering job experience.',
        st: [
          'write a portfolio page (GitHub Pages or a profile README) with your three projects and the exam, with one sentence of measured result for each.',
          'update your résumé: three project bullets with numbers. Keep your real job title and do not claim data engineering job experience you do not have.',
          'update LinkedIn and pin the three repositories. Ask someone who works with data for feedback on one project README.',
          'practise SQL screens: do 5 timed problems of 20 minutes each, using window functions and joins.',
          'shortlist 20 roles (data engineer, analytics engineer, junior data engineer, data analyst with pipelines) and note the requirements that repeat. Then take this week\'s quiz.',
        ],
        d: 'a portfolio page is live, your résumé shows measured results, 20 roles are shortlisted, and you passed the quiz.',
      },
      {
        s: 'Apply, practise interviews and decide what to learn next.',
        st: [
          'tailor your résumé for your best 5 roles and apply to them.',
          'practise a data system-design question: design a pipeline from events to a dashboard, and talk through the trade-offs for 30 minutes.',
          'do two mock interviews: a walkthrough of one of your projects, and a SQL round.',
          'apply to 5 more roles. If you want one, also ask about an internal move or a related team where you work.',
          'ship: check that 10 applications are sent, write down the gaps you heard in interviews and postings, decide what to learn next, then take this week\'s quiz.',
        ],
        d: '10 applications are sent, 2 mock interviews are done, your portfolio page is live, and you passed the quiz.',
      },
    ],
  },
]
