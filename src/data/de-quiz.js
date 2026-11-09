// Question banks for the data engineering plan: one bank per two-week block (plan weeks 1-2 are block 1, and so on).
// q(question, [right answer, wrong, wrong, wrong], why). The engine shuffles the options, so the right answer is
// always written first here. Questions are conceptual and test understanding, not memorised syntax or prices.
const q = (text, o, why) => ({ q: text, o, a: 0, why })

export const deBlockOf = (n) => Math.ceil(n / 2)

export const deQuiz = {
  1: [
    q('What is the difference between `ROW_NUMBER()` and `RANK()` when two rows tie?', ['`ROW_NUMBER` still gives unique numbers; `RANK` gives ties the same rank and skips the next number', 'They are identical', '`RANK` gives unique numbers; `ROW_NUMBER` repeats', 'Both skip no numbers'], 'ROW_NUMBER is always 1,2,3; RANK might give 1,1,3.'),
    q('What does `PARTITION BY` do in a window function?', ['Restarts the window calculation for each group without collapsing rows', 'Collapses rows into one per group like `GROUP BY`', 'Sorts the final result', 'Splits the table on disk'], 'Window functions keep every row; `GROUP BY` reduces them.'),
    q('You need the previous day\'s value next to each row. Which function fits?', ['`LAG`', '`LEAD`', '`NTILE`', '`COUNT`'], '`LAG` looks back a row; `LEAD` looks forward.'),
    q('A `LEFT JOIN` has a filter on the right table in the `WHERE` clause (`WHERE r.col = 5`). What is the usual effect?', ['Rows with no match are removed, so it behaves like an inner join', 'It keeps all left rows', 'It raises an error', 'It makes the join faster only'], 'Unmatched rows have NULL in `r.col`, so the filter drops them. Put the condition in `ON` to keep them.'),
    q('What is a good way to deduplicate rows, keeping the latest per key?', ['`ROW_NUMBER() OVER (PARTITION BY key ORDER BY updated_at DESC)` and keep row 1', '`SELECT *` with `LIMIT 1`', '`ORDER BY` alone', '`COUNT(*)` per key'], 'Number the rows within each key, newest first, and keep the first.'),
    q('What does `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` give in a window sum?', ['A 7-row moving window ending at the current row', 'A sum of the whole partition', 'The next 6 rows', 'Only the current row'], 'The frame is the current row plus the 6 before it.'),
    q('What is the "grain" of a table?', ['What one row represents', 'The number of columns', 'The file size', 'The primary key type'], 'Stating the grain in one sentence prevents wrong joins and double counting.'),
    q('When is a recursive CTE the right tool?', ['Walking a hierarchy such as an org chart, or generating a series', 'Summing a column', 'Creating an index', 'Renaming a table'], 'A recursive CTE repeats a step on its own output until nothing new appears.'),
  
  ],
  2: [
    q('What does `EXPLAIN ANALYZE` add to plain `EXPLAIN`?', ['It runs the query and reports actual timings and row counts', 'It makes the query faster', 'It creates indexes', 'It only shows the cost estimate'], 'ANALYZE executes the query, so you can compare estimates with reality.'),
    q('A query returns 2% of a huge table and filters on an indexed column, but the planner chose a sequential scan. What should you check first?', ['That statistics are current (`ANALYZE`) and the estimate of matching rows is reasonable', 'Delete the index', 'Add more RAM', 'Rewrite it in Python'], 'The planner decides from statistics; stale statistics give bad plans.'),
    q('You have a composite index on `(country, created_at)`. Which query can use it best?', ['`WHERE country = \'US\' AND created_at > \'2026-01-01\'`', '`WHERE created_at > \'2026-01-01\'` alone', '`WHERE lower(country) = \'us\'`', '`WHERE city = \'Austin\'`'], 'The leading column should appear in the filter. A function on a column blocks a plain index.'),
    q('What is a partial index?', ['An index that covers only the rows matching a condition', 'An index on half the columns', 'An index that is half built', 'A copy of the table'], 'For example, index only the active orders to keep the index small.'),
    q('What does partition pruning do?', ['The planner skips partitions that cannot contain matching rows', 'It deletes old partitions', 'It compresses partitions', 'It merges partitions at query time'], 'Pruning only works when the filter uses the partition key.'),
    q('Why can adding an index make writes slower?', ['Every insert and update must also maintain the index', 'Indexes lock the whole database permanently', 'Indexes store a second copy of the SQL', 'They do not; writes are unaffected'], 'Indexes speed reads and cost on writes and storage.'),
    q('Which rewrite usually makes a slow query faster?', ['Filter earlier and select only the columns you need', 'Add `SELECT *`', 'Wrap an indexed column in a function', 'Remove all `WHERE` clauses'], 'Moving less data through the plan is the main lever.'),
    q('In an `EXPLAIN ANALYZE` plan, the estimated rows are 100 and the actual rows are 2,000,000. What does that suggest?', ['The planner\'s statistics are badly wrong, so it may have picked a poor plan', 'The query is optimal', 'The database is offline', 'The index is too big'], 'Large estimate errors are a classic cause of bad plans.'),
  
  ],
  3: [
    q('What does it mean for a load step to be idempotent?', ['Running it twice leaves the same result as running it once', 'It runs faster the second time', 'It never fails', 'It deletes the old data first, always'], 'Idempotent steps make retries and reruns safe.'),
    q('An API returns 429 or 503. What is a sound retry policy?', ['Retry a limited number of times with exponential backoff', 'Retry immediately in a tight loop', 'Never retry', 'Retry forever'], 'Backoff avoids hammering a struggling service; a limit avoids infinite loops.'),
    q('Why validate records and write failures to a rejects file?', ['Bad data is kept for inspection instead of crashing the run or silently loading', 'Rejects make the pipeline slower on purpose', 'Parquet requires rejects', 'It deletes bad data permanently'], 'You need to see and fix rejects; silent drops hide problems.'),
    q('What is a main benefit of Parquet over CSV for analytics?', ['Columnar storage with types and compression, so queries read only the columns they need', 'It is human-readable', 'It can be edited in a text editor', 'It has no schema'], 'Column pruning and typed storage make scans cheaper.'),
    q('Why use a lock file such as `uv.lock`?', ['It records exact dependency versions so installs are reproducible', 'It prevents others from reading your code', 'It makes tests pass', 'It stores secrets'], 'The same lock file gives the same environment on every machine.'),
    q('Why should tests for `transform` avoid the network?', ['They stay fast, deterministic and free of outside failures', 'Python cannot make network calls in tests', 'The network is slower in Docker', 'Tests must be slow'], 'Fake the HTTP response and test your logic only.'),
    q('Where should credentials for a pipeline come from?', ['Environment variables or a secret manager, never source code', 'A constant in the script', 'The README', 'A commented line in the repo'], 'Code is copied, committed and shared.'),
    q('What is wrong with a script that has `while True:` to page through an API?', ['Without a stop condition it can loop forever if the API misbehaves', 'Nothing; loops are always safe', 'It uses too little memory', 'It cannot be tested'], 'Every loop over an external system needs a bound or a clear end signal.'),
  
  ],
  4: [
    q('In dimensional modeling, what do fact tables hold?', ['Measurements of a business event, such as sales amounts, with keys to dimensions', 'Descriptive attributes like customer names only', 'The raw log files', 'Database permissions'], 'Facts are the numbers; dimensions describe them.'),
    q('What is a surrogate key?', ['A system-generated key with no business meaning', 'A key copied from the source system\'s natural ID', 'A password', 'A foreign key to a log'], 'Surrogate keys decouple the warehouse from source-system key changes and support history.'),
    q('A customer moves city. You must keep old orders attributed to the old city. Which dimension type fits?', ['Type 2: add a new row with validity dates', 'Type 1: overwrite the value', 'Delete the customer', 'Add a column to the fact table only'], 'Type 2 preserves history; Type 1 overwrites it.'),
    q('What is the first thing to decide when designing a star schema?', ['The business process and the grain of the fact table', 'The file format', 'The BI tool colors', 'The number of indexes'], 'Grain first: everything else follows from what one row means.'),
    q('Why build a date dimension?', ['So you can group and filter by weekday, month, quarter and holiday without computing them in every query', 'Postgres has no date type', 'To save disk space', 'To replace the fact table'], 'A date table carries calendar attributes once.'),
    q('You add a customer\'s lifetime spend as a column on a daily fact table. What is the risk?', ['Summing it across rows double counts, because it is not additive at that grain', 'No risk', 'It makes the table smaller', 'It breaks foreign keys'], 'Facts must match the grain, and some measures are non-additive.'),
    q('What does `is_current` help with in a Type 2 dimension?', ['Quickly selecting the latest version of each member', 'Encrypting rows', 'Sorting dates', 'Creating partitions'], 'It marks the open row (valid_to is null or far future).'),
    q('When might a single wide denormalized table be a sensible choice?', ['A small, read-heavy analytic dataset where simplicity beats flexibility', 'When you need to enforce many foreign keys', 'When data changes constantly in many places', 'Never'], 'Choose the model for the workload; wide tables trade flexibility for simplicity.'),
  
  ],
  5: [
    q('What does `ref()` do in a dbt model?', ['References another model so dbt builds dependencies in the right order and tracks lineage', 'Imports a Python module', 'Reads a file from disk', 'Creates an index'], '`ref` is how dbt knows the dependency graph.'),
    q('What is the purpose of a staging model?', ['Light cleaning: rename, cast and standardise one raw source', 'Heavy business aggregation', 'Final reporting tables', 'Storing secrets'], 'Staging models are the clean base layer for later models.'),
    q('What does the built-in `unique` test check?', ['That no two rows share the same value in the column', 'That the column is sorted', 'That the column has no nulls', 'That the table is partitioned'], '`not_null` checks nulls; `unique` checks duplicates.'),
    q('What does a `relationships` test check?', ['That every value in a foreign key exists in the parent table', 'That two tables have the same row count', 'That a model is documented', 'That a source is fresh'], 'It tests referential integrity.'),
    q('What is the difference between `dbt run` and `dbt build`?', ['`build` runs models, tests, snapshots and seeds together in dependency order', '`run` also runs tests', 'They are the same', '`build` only compiles'], 'Build stops downstream models when an upstream test fails.'),
    q('Why use `source()` for raw tables?', ['It declares raw inputs, documents them and lets you test freshness', 'It copies data into dbt', 'It speeds up the warehouse', 'It deletes the raw data'], 'Sources make raw tables part of the lineage.'),
    q('A dbt test fails on 3 rows. What is the honest response?', ['Investigate the data or the model; do not weaken the test just to get green', 'Delete the test', 'Change severity to ignore', 'Rerun until it passes'], 'A test is only useful if you act on failures.'),
    q('What does a model\'s materialization control?', ['How dbt builds it: view, table, incremental or ephemeral', 'Who can read it', 'Its documentation', 'The database name'], 'Materialization is a speed versus freshness versus cost trade-off.'),
  
    q('What does `is_incremental()` allow in an incremental model?', ['Filtering the query to only new or changed rows on later runs', 'Running the model twice', 'Skipping tests', 'Dropping the table'], 'On the first run the filter is skipped; later runs process only new data.'),
    q('What does `unique_key` do in a dbt incremental model?', ['Lets dbt update existing rows instead of inserting duplicates', 'Creates a primary key constraint always', 'Sorts the rows', 'Encrypts the key'], 'Without a key, a rerun can append duplicates.'),
    q('What does a dbt snapshot record?', ['Changes over time to a mutable source table, as Type 2 history', 'A backup of the dbt project', 'The query plan', 'A copy of the logs'], 'Snapshots keep prior versions of rows as they change.'),
    q('What is a singular test in dbt?', ['A SQL file that must return zero rows to pass', 'A test on one column only', 'A test that runs once', 'A test that skips failures'], 'Write the query to return the bad rows.'),
    q('What is a seed in dbt?', ['A small CSV in the project loaded as a table, such as a lookup', 'A random number generator', 'A tool for backups', 'A kind of test'], 'Use seeds for small, static reference data.'),
    q('Why write model and column descriptions in YAML?', ['dbt turns them into browsable documentation for newcomers', 'dbt requires them to run', 'They make queries faster', 'They enforce permissions'], 'Docs are generated from the project.'),
    q('You rerun an incremental model and the row count doubles. What is the likely cause?', ['A missing or wrong `unique_key`, so rows were appended instead of merged', 'Too many tests', 'The date dimension is too large', 'A Docker problem'], 'Always rerun twice and compare counts.'),
    q('What is `dbt docs generate` useful for besides descriptions?', ['It builds the lineage graph so you can see how models depend on each other', 'It creates the database', 'It runs the tests', 'It deploys to production'], 'The lineage graph shows impact of a change.'),
  
  ],
  6: [
    q('What is a DAG in Airflow?', ['A directed acyclic graph of tasks and their dependencies, with no loops', 'A database table', 'A Python package', 'A cloud server'], 'Dependencies run one way; a cycle would never finish.'),
    q('Why does idempotency matter for an Airflow task?', ['Retries and backfills run it again, so reruns must not duplicate data', 'It makes the UI faster', 'Airflow requires it to start', 'It encrypts logs'], 'Tasks will be retried, so design for it.'),
    q('What is the logical date (data interval) of a run used for?', ['Telling the task which period of data to process, independent of when it actually runs', 'The clock time the run starts', 'The log file name', 'The Python version'], 'Using the logical date instead of "today" makes backfills correct.'),
    q('What does `catchup=False` do?', ['Prevents Airflow from creating runs for all missed past intervals when the DAG is enabled', 'Disables retries', 'Stops the scheduler', 'Deletes old runs'], 'With catchup on, a DAG with an old start date creates a run for every missed interval.'),
    q('What is a backfill?', ['Running a DAG for past dates to fill historical data', 'Deleting old data', 'Restoring the Airflow database', 'Updating the Python version'], 'Backfills rely on idempotent, date-driven tasks.'),
    q('A task fails once because of a brief network error. Which setting helps?', ['Retries with a delay', 'A longer schedule interval', 'Removing the task', 'Disabling logs'], 'Retries handle transient failure.'),
    q('Why add a timeout to a task or sensor?', ['A stuck task should fail and alert rather than hold resources forever', 'Timeouts speed up tasks', 'Airflow cannot run without them', 'They delete the data'], 'Without a timeout a stuck task can block everything behind it.'),
    q('Which is the right way to pass data between big tasks?', ['Write it to storage and pass a pointer such as a path or table name', 'Return gigabytes through XCom', 'Print it in the log', 'Email it'], 'XCom is for small metadata, not datasets.'),
  
  ],
  7: [
    q('What does a data quality "freshness" check test?', ['That data arrived recently enough', 'That column names are short', 'That tables are partitioned', 'That the schema is documented'], 'Stale data is a quality failure even if every row is valid.'),
    q('Which check should usually block the pipeline?', ['A critical check, such as primary key uniqueness or a failed reconciliation', 'A cosmetic warning', 'A documentation gap', 'A slow query warning'], 'Block when downstream consumers would be wrong; warn otherwise.'),
    q('Why test the checks themselves by injecting bad rows?', ['To prove they actually catch problems instead of passing by default', 'To make the dataset larger', 'To slow the pipeline', 'To avoid writing tests'], 'A check that has never failed is unproven.'),
    q('What is reconciliation?', ['Comparing counts or totals between source and target to confirm nothing was lost or duplicated', 'Deleting duplicates', 'Renaming columns', 'Compressing files'], 'It is a cheap, powerful end-to-end check.'),
    q('Why run `dbt build` in CI against a throwaway database?', ['To catch broken models and tests on a pull request without touching real data', 'It is required by GitHub', 'It makes models faster', 'To store production data'], 'CI should be isolated and disposable.'),
    q('A scan finds a credential in your git history. What is the right action?', ['Revoke and rotate the credential, because deleting the file does not remove it from history', 'Delete the file only', 'Ignore it if the repo is private', 'Rename the repository'], 'Treat any exposed secret as compromised.'),
    q('What should the "what broke" section of a project README contain?', ['Real failures, their causes and the fixes', 'Nothing, to look polished', 'Only successes', 'Unrelated links'], 'It shows real engineering judgment.'),
    q('Why record metrics like runtime and backfill time in the README?', ['Measured results make the project credible and comparable over time', 'They are decorative', 'GitHub requires them', 'They speed up the pipeline'], 'Numbers are evidence.'),
  
  ],
  8: [
    q('What is a Spark "transformation" compared with an "action"?', ['A transformation builds a plan lazily; an action triggers execution', 'They are the same', 'Actions are lazy', 'Transformations always write files'], 'Nothing runs until an action like `count` or `write`.'),
    q('What is a shuffle in Spark?', ['Redistributing data across the cluster, such as for a join or group by, which is expensive', 'Randomising the rows for display', 'Compressing files', 'Reading a file'], 'Shuffles move data over the network and are a common bottleneck.'),
    q('When does Spark use a broadcast join?', ['When one side is small enough to send to every executor, avoiding shuffling the large side', 'When both tables are huge', 'Only with Parquet', 'Never automatically'], 'Broadcasting the small table avoids a large shuffle.'),
    q('What is data skew?', ['One key has far more rows than others, so one task does most of the work', 'Data stored in the wrong format', 'A broken file', 'Too few columns'], 'The straggler task holds up the whole stage.'),
    q('How can you reduce the impact of a skewed join key?', ['Salt the key or use adaptive skew handling', 'Add more columns', 'Remove the join', 'Lower the log level'], 'Salting spreads a hot key across several tasks.'),
    q('What does `coalesce` do compared with `repartition`?', ['`coalesce` reduces partitions without a full shuffle; `repartition` does a full shuffle', 'They are identical', '`coalesce` increases partitions', '`repartition` never shuffles'], '`coalesce` is cheaper for decreasing partition counts.'),
    q('Why do many tiny output files hurt?', ['Reading and listing thousands of small files has high overhead', 'Small files cannot be read', 'They use more CPU to write only', 'They break Parquet'], 'Aim for sensible file sizes.'),
    q('Where do you look to find a slow stage and a straggler task?', ['The Spark UI', 'The README', 'The git log', 'The Dockerfile'], 'The Spark UI shows stages, tasks, shuffle sizes and timings.'),
  
  ],
  9: [
    q('Why attach a budget alert before creating cloud resources?', ['It flags unexpected spend early', 'It is required to log in', 'It makes resources faster', 'It encrypts the storage'], 'Alerts guard against your own mistakes.'),
    q('What does enabling hierarchical namespace on an Azure storage account give you?', ['Data Lake Storage Gen2 features such as real directories and finer access control', 'Free storage', 'Automatic backups', 'Faster internet'], 'It turns blob storage into a data lake file system.'),
    q('Why prefer a role-based identity to a storage account key?', ['Roles can be scoped, audited and revoked; a key grants full access and is easy to leak', 'Keys do not work', 'Roles are cheaper', 'Roles make the data smaller'], 'Account keys are all-powerful shared secrets.'),
    q('A principal has "Storage Blob Data Reader". Can it upload a blob?', ['No, reader is read-only', 'Yes', 'Only on weekends', 'Only to the root'], 'Contributor is the role that can write.'),
    q('What is the advantage of Key Vault over an `.env` file for secrets?', ['Central, access-controlled, audited secrets that are not copied around on disks', 'Faster startup', 'No permissions needed', 'It encrypts your code'], 'Key Vault controls and audits access.'),
    q('What does `terraform destroy` do?', ['Removes the resources Terraform manages', 'Deletes your source code', 'Removes the provider', 'Formats the files'], 'Use it to stop paying for what you no longer need.'),
    q('Why keep Terraform code in version control?', ['Infrastructure changes can be reviewed and reproduced like application code', 'It makes the cloud faster', 'It removes the need for state', 'Terraform requires it'], 'Code is reviewable and repeatable.'),
    q('Why must you not use your employer\'s Azure subscription for this plan?', ['Using work resources for personal learning breaks policy and risks company data and costs', 'It is slower', 'It has no storage', 'Terraform cannot connect'], 'Keep personal learning on personal accounts.'),
  
  ],
  10: [
    q('What does Delta Lake add on top of Parquet files?', ['ACID transactions, schema enforcement and time travel via a transaction log', 'Faster internet', 'A new SQL dialect', 'Free storage'], 'The transaction log is what makes it reliable.'),
    q('What does `RESTORE` do on a Delta table?', ['Returns the table to an earlier version', 'Deletes the table', 'Compacts files', 'Creates a backup in another cloud'], 'It uses the table\'s version history.'),
    q('What is the three-level namespace in Unity Catalog?', ['`catalog.schema.table`', '`server.database.table`', '`bucket.folder.file`', '`user.group.role`'], 'Catalogs contain schemas, which contain tables.'),
    q('What is the difference between a managed and an external table?', ['A managed table\'s data is managed by the catalog and removed with the table; an external table points at data you manage', 'Managed tables cannot be queried', 'External tables are always faster', 'There is none'], 'Dropping an external table leaves the underlying files.'),
    q('What does Auto Loader do?', ['Incrementally ingests new files from cloud storage, tracking what it has seen', 'Loads the same files every time', 'Compresses files', 'Writes only CSV'], 'It remembers progress using a checkpoint.'),
    q('What is the purpose of a checkpoint in incremental ingestion?', ['It records progress so a restart continues without loss or duplication', 'It backs up the code', 'It stores secrets', 'It speeds up the UI'], 'Checkpoints make stream and incremental jobs restartable.'),
    q('In the bronze, silver, gold pattern, what is silver?', ['Cleaned, deduplicated and conformed data', 'The raw landing data', 'Business aggregates', 'Backups'], 'Bronze is raw, silver is clean, gold is ready for consumers.'),
    q('What does `MERGE INTO` let you do?', ['Insert, update and delete in one atomic upsert from a source set', 'Merge two repositories', 'Combine Spark clusters', 'Join without a key'], 'It is the standard pattern for applying changes.'),
  
  ],
  11: [
    q('What is a declarative pipeline (Lakeflow Spark Declarative Pipelines) good at?', ['You declare the tables and rules; the engine handles dependencies, orchestration and incremental processing', 'Running arbitrary shell scripts', 'Replacing storage', 'Training models'], 'You describe the result and let the framework manage execution.'),
    q('What does an expectation in a declarative pipeline let you do?', ['Declare a data quality rule and choose to warn, drop or fail on violations', 'Predict future data', 'Speed up queries', 'Set permissions'], 'Expectations attach quality rules to tables.'),
    q('Why add a run-date parameter to a job?', ['So the same job can process any date and be rerun safely', 'To change the color of the UI', 'Jobs cannot run without one', 'To encrypt output'], 'Parameters make jobs reusable and backfillable.'),
    q('What is a Databricks Asset Bundle?', ['Project files that define jobs, pipelines and settings as code so they can be validated and deployed', 'A zip of notebooks only', 'A billing plan', 'A cluster type'], 'Bundles let you treat Databricks resources like code.'),
    q('Why have separate `dev` and `prod` targets?', ['To test changes safely without touching production data or jobs', 'To use two clouds', 'Because bundles need exactly two', 'To double the cost'], 'Targets isolate environments.'),
    q('Where should the token or credential for CI deploys live?', ['In repository secrets or federated identity, never in code', 'In the bundle file', 'In the README', 'In a notebook cell'], 'Secrets in code leak through history.'),
    q('Why test a pipeline on a tiny fixture dataset in CI?', ['It checks logic quickly and cheaply with known inputs and outputs', 'It replaces production monitoring', 'It speeds up the cluster', 'It removes the need for tests on real data'], 'Small fixtures make deterministic tests.'),
    q('How do Auto Loader and a plain batch read differ for repeating ingestion?', ['Auto Loader tracks new files so you do not reprocess old ones', 'Batch reads are incremental', 'They are identical', 'Auto Loader cannot read JSON'], 'Incremental discovery is its main feature.'),
  
  ],
  12: [
    q('What is least privilege?', ['Granting only the access needed to do a job', 'Granting admin to everyone', 'Removing all logging', 'Using one shared password'], 'It limits damage from mistakes and breaches.'),
    q('What does a column mask do?', ['Hides or transforms a column\'s value depending on who is querying', 'Deletes the column', 'Sorts the column', 'Encrypts the whole table at rest only'], 'Different principals see different values from the same table.'),
    q('What does a row filter do?', ['Returns only the rows a given user is allowed to see', 'Removes duplicates', 'Speeds up scans', 'Deletes rows permanently'], 'It enforces row-level access in the table definition.'),
    q('Why is lineage useful for governance?', ['It shows which upstream sources feed a table and which downstream assets depend on it', 'It makes queries faster', 'It deletes unused tables', 'It sets permissions'], 'Lineage supports impact analysis and audits.'),
    q('What does an audit query on system tables tell you?', ['Who accessed which data and when', 'How fast queries run', 'The price of storage', 'Which Python version is installed'], 'Auditability is part of governance.'),
    q('Why put grants and masks in code?', ['They can be reviewed, tested and reapplied consistently', 'Code is faster than the UI', 'Grants cannot be set otherwise', 'It removes the need for owners'], 'Manual clicks drift and cannot be reviewed.'),
    q('Why write a test showing a restricted user cannot see masked data?', ['A control you never test may not work', 'Tests make the mask stronger', 'Masks need tests to turn on', 'It replaces documentation'], 'Verify controls, do not assume them.'),
    q('What belongs in a data-ownership note?', ['Who owns the data, who approves access and how long access lasts', 'The cluster size', 'The font used', 'The login password'], 'Ownership makes access decisions accountable.'),
  
  ],
  13: [
    q('Why choose a public dataset for a portfolio project?', ['Anyone can reproduce it and it avoids employer or personal data', 'It is always cleaner', 'It never changes', 'Public data is required by Databricks'], 'Reproducibility and safety.'),
    q('What should a one-page design contain before building?', ['The problem, layers, owners, quality rules and a cost budget', 'Only logos', 'Only code', 'Nothing; design is waste'], 'A short design catches problems before they cost time.'),
    q('Why measure shuffle and spill for the heaviest step?', ['They show where time and memory are actually going, so you fix the real bottleneck', 'They are decorative metrics', 'They improve security', 'They are required by the exam'], 'Measure before optimising.'),
    q('How should you label a cost number you could not read from billing data?', ['As an estimate, with the rates and assumptions used', 'As exact', 'Leave it out silently', 'Copy a number from a blog'], 'Honest labels keep results credible.'),
    q('What share of rows does a quarantine rate describe?', ['Rows rejected by quality rules and set aside for review', 'Rows that are duplicated in storage', 'Rows that are partitioned', 'Rows older than a year'], 'It is a quality metric.'),
    q('Why tear down paid resources at the end?', ['Idle resources keep costing money', 'The cloud forces you to', 'It makes the demo faster', 'It improves lineage'], 'Delete what you are not using.'),
    q('You ran everything from scratch and listed the failures. Why is that list valuable?', ['It becomes the "what broke" section and shows real engineering', 'It makes the project fail', 'It is private notes only', 'It replaces tests'], 'Honest failure analysis is a hiring signal.'),
    q('When is it acceptable to build in Free Edition and validate Azure parts with `terraform plan`?', ['When you lack paid Azure Databricks credit, as long as the README says so', 'Never', 'Always silently', 'Only for exams'], 'State limits plainly rather than implying you ran what you did not.'),
  
  ],
  14: [
    q('Why avoid "exam dump" sites?', ['They violate exam rules, and often contain wrong or retired questions', 'They are always accurate', 'They are free and legal', 'They are required by Databricks'], 'Use official or legitimate practice material only.'),
    q('How should you use a domain-by-domain practice score?', ['To find and fix your weakest domains first', 'To pick the exam date at random', 'To skip hands-on work', 'To compare with strangers'], 'Allocate study time where the gap is largest.'),
    q('Why work on weaknesses with hands-on practice, not only reading?', ['Doing exposes gaps that recognition hides', 'Reading is forbidden', 'Hands-on is shorter', 'It is required by the exam'], 'Retrieval and practice build durable skill.'),
    q('What does it mean to book the exam early?', ['Create a commitment date that makes your plan concrete', 'Take it before studying', 'Guarantee a pass', 'Avoid the exam rules'], 'A date focuses effort, but leave buffer and be willing to move it.'),
    q('A practice question you got wrong: what is the best next step?', ['Understand why the right answer is right, then redo the related hands-on step', 'Memorise the letter', 'Skip it', 'Retake until you recognise it'], 'Memorising answers does not transfer to the real exam.'),
    q('What is wrong with timing only the exam you will sit?', ['You never rehearse the pacing under the real 90-minute limit', 'Timing is not allowed', 'Time does not matter', 'The exam has no limit'], 'Timed practice builds pacing and stamina.'),
    q('Why write your own cheat sheet?', ['Summarising in your own words strengthens memory and shows what you do not understand', 'Copying is faster', 'It is allowed in the exam', 'It replaces study'], 'The act of writing is the learning.'),
    q('What does a weighted exam guide help you decide?', ['Where to spend more study time', 'Which questions will be asked exactly', 'The pass mark', 'The exam price'], 'Weights show relative emphasis, not exact questions.'),
  
  ],
  15: [
    q('Why stop learning new material in the last days before an exam?', ['Review consolidates what you know; cramming new topics adds stress and confusion', 'New material is forbidden', 'It saves money', 'It speeds up the exam'], 'Late cramming rarely sticks.'),
    q('Why check logistics (ID, room, proctoring software) ahead of time?', ['A technical or ID problem can cost the exam attempt', 'It is optional trivia', 'It shortens the exam', 'It guarantees a pass'], 'Remove avoidable risks.'),
    q('You scored 70% on the final practice set the week before the exam. What is the sensible decision?', ['Move the exam later and keep practising', 'Sit it anyway and hope', 'Skip the exam', 'Change the target to 50%'], 'A realistic readiness bar protects the attempt and the fee.'),
    q('How should you review a wrong answer on a practice test?', ['Write why it was wrong and what the right reasoning is', 'Ignore it', 'Delete it', 'Count only the right ones'], 'Written reasons build understanding.'),
    q('What is a good use of the final day?', ['Light review and rest', 'A new course', 'An all-night study session', 'A new project'], 'Sleep helps recall.'),
    q('What does Unity Catalog governance mean on the exam?', ['Understanding grants, ownership and lineage, not memorising UI clicks', 'Only UI colors', 'Only SQL syntax', 'Only costs'], 'Concepts transfer; clicks change.'),
    q('If you fail the exam, what is the best response?', ['Study the score report by domain, fix gaps and retake after the waiting period', 'Quit the plan', 'Blame the proctor', 'Buy exam dumps'], 'A fail is information about gaps.'),
    q('Why record the exam result in your log whatever it is?', ['It keeps your plan and decisions honest and lets you adjust', 'It is required by Databricks', 'It earns a badge', 'It resets the schedule'], 'Tracking results guides next steps.'),
  
  ],
  16: [
    q('In Kafka, what is a partition?', ['An ordered log that a topic is split into, enabling parallelism', 'A backup of the cluster', 'A consumer', 'A schema'], 'Order is guaranteed within a partition, not across the topic.'),
    q('What does the message key control in Kafka?', ['Which partition the message goes to, so related messages stay in order', 'The message size', 'The encryption', 'The consumer name'], 'Same key goes to the same partition.'),
    q('What is a consumer group?', ['A set of consumers that share a topic\'s partitions so each message is processed once per group', 'A set of topics', 'A kind of broker', 'A database'], 'Groups let you scale consumption.'),
    q('What does "at least once" delivery imply for your consumer?', ['Duplicates are possible, so processing must be idempotent', 'Messages may be lost', 'Messages are exactly once always', 'Order is guaranteed globally'], 'Plan for duplicates.'),
    q('What does a Structured Streaming checkpoint store?', ['Progress and state so a restarted query continues where it left off', 'The source code', 'Credentials', 'The consumer UI'], 'Without it, a restart reprocesses or loses data.'),
    q('You stop a stream and restart it with a different checkpoint path. What happens?', ['It loses its progress and may reprocess or skip data', 'It continues exactly', 'It fails to start always', 'It deletes the table'], 'Checkpoint location is part of the query\'s identity.'),
    q('What is the difference between event time and processing time?', ['Event time is when it happened; processing time is when your system handled it', 'They are the same', 'Processing time is earlier always', 'Event time is the log timestamp of the server'], 'Late data arises because they differ.'),
    q('Why produce events with an event timestamp?', ['So you can window and order by when things happened, not when they arrived', 'To make them smaller', 'To avoid keys', 'Kafka requires it'], 'Event time enables correct windows.'),
  
    q('What does a watermark do in Structured Streaming?', ['Defines how late data may arrive before state is dropped', 'Marks a file as copied', 'Encrypts data', 'Names a checkpoint'], 'It bounds state and defines what counts as late.'),
    q('What happens to an event that arrives later than the watermark allows?', ['It may be dropped from windowed aggregations', 'It is always processed', 'It restarts the stream', 'It is moved to Kafka'], 'This is the trade-off for bounded state.'),
    q('How do you de-duplicate streaming events?', ['Use a unique event ID with a watermark, or `MERGE` in `foreachBatch`', 'Ignore duplicates', 'Sort the stream', 'Use `LIMIT 1`'], 'You need a key to recognise repeats.'),
    q('What does a replay test prove?', ['That reprocessing the same events does not create duplicates', 'That the stream is fast', 'That Kafka is up', 'That the code is short'], 'It is the proof of idempotency.'),
    q('Which latency metric is most informative?', ['Median and 95th percentile end to end', 'Only the fastest event', 'The code size', 'The cluster name'], 'Tails matter for users.'),
    q('How do you measure end-to-end latency?', ['Subtract event time from the time the row appears in the output table', 'Count the rows', 'Use the CPU temperature', 'Guess'], 'Measure at both ends of the pipeline.'),
    q('What is the cost of a very long watermark?', ['More state is kept in memory and storage', 'Less accuracy', 'No cost', 'Fewer duplicates always'], 'Watermark length trades completeness for resources.'),
    q('What does `foreachBatch` let you do?', ['Run arbitrary batch logic on each micro-batch, such as a MERGE', 'Loop over Kafka partitions only', 'Skip the checkpoint', 'Write only CSV'], 'It reuses batch APIs inside a stream.'),
  
  ],
  17: [
    q('What is a data contract?', ['An agreement on schema, meaning, freshness and ownership between a data producer and its consumers', 'A legal NDA', 'A cluster setting', 'A SQL join'], 'It makes expectations explicit.'),
    q('Which change to an event schema is breaking?', ['Removing a field that consumers read', 'Adding an optional field', 'Adding documentation', 'Adding a comment'], 'Removing or retyping a field breaks consumers; adding optional fields usually does not.'),
    q('What is a quarantine table?', ['A place to send records that fail validation so they can be inspected', 'A backup', 'A security group', 'A deleted table'], 'It keeps bad data visible instead of silently dropped.'),
    q('What is a freshness SLO?', ['A target for how old the data may be, such as under 15 minutes', 'A password policy', 'A file size limit', 'A model setting'], 'Targets make quality measurable.'),
    q('Why record one result row per quality run?', ['To see trends and prove whether targets were met', 'To increase storage', 'To slow the pipeline', 'To avoid alerts'], 'History enables trends and accountability.'),
    q('What does OpenLineage provide?', ['A standard for emitting lineage metadata about jobs and datasets', 'A database', 'A cluster scheduler', 'A message queue'], 'It records what job read and wrote what.'),
    q('What should an alert include?', ['Enough context to act: what failed, where and who owns it', 'Only "failed"', 'Passwords', 'The whole log'], 'Actionable alerts are used; vague ones are ignored.'),
    q('Why write a runbook?', ['So whoever is on call can respond to each alert quickly and consistently', 'To impress managers', 'To replace monitoring', 'It is required by Kafka'], 'A runbook turns knowledge into procedure.'),
  
  ],
  18: [
    q('What are the main cost drivers on a cloud data platform?', ['Compute time, storage and data movement', 'Only storage', 'Only code length', 'Only the logo'], 'Compute usually dominates; know all three.'),
    q('What does a cluster policy do?', ['Limits and defaults for compute, such as size, auto-termination and tags', 'Grants table access', 'Compresses files', 'Writes SQL'], 'Policies prevent costly misconfiguration.'),
    q('Why enable auto-termination on interactive compute?', ['Idle compute stops billing', 'It makes queries faster', 'It adds security', 'It reduces storage'], 'Forgotten clusters are a common waste.'),
    q('What is a sensible way to cut a job\'s cost?', ['Change one lever at a time and measure each change', 'Change everything at once', 'Delete the job', 'Remove monitoring'], 'One change at a time shows which lever worked.'),
    q('What does tagging resources enable?', ['Attributing cost to a project, team or job', 'Faster queries', 'More storage', 'Better lineage'], 'Cost by tag is the basis of showback.'),
    q('How does incremental processing reduce cost?', ['It processes only new or changed data instead of everything each run', 'It adds more compute', 'It encrypts data', 'It reduces tests'], 'Less data processed means less compute.'),
    q('What does `VACUUM` free in Delta, and what is the risk of very short retention?', ['It removes old unreferenced files; short retention breaks time travel and can break concurrent readers', 'It compresses; no risk', 'It deletes tables; no risk', 'It indexes; no risk'], 'Retention is a balance of savings and recoverability.'),
    q('What should a cost claim in a README be backed by?', ['Before and after measurements, or clearly labelled estimates', 'A guess', 'A screenshot of the pricing page', 'Nothing'], 'Evidence or honest labels.'),
  
  ],
  19: [
    q('Which three things must a streaming project show to be credible?', ['A contract enforced on input, quality and freshness checks, and a measured cost per volume', 'Only a diagram', 'Only that it runs once', 'Only the language used'], 'Reliability, quality and cost are what separate a pipeline from a demo.'),
    q('You kill the streaming job mid-run and restart it. What proves it recovered correctly?', ['Row counts and a duplicate check match the replay expectation', 'It started again', 'No error was printed', 'The cluster is bigger'], 'Recovery is shown by data correctness, not by the process restarting.'),
    q('What does measuring dollars per million events let you do?', ['Compare designs and spot cost regressions at a common scale', 'Avoid monitoring', 'Skip tests', 'Remove the contract'], 'Unit cost is comparable across runs and designs.'),
    q('Why break things on purpose and write down what happened?', ['It reveals failure modes and gives the README honest evidence', 'To lose data', 'To pass the exam', 'It is required by Kafka'], 'Failure drills produce the "what broke" story.'),
    q('How many injected bad records did your checks catch, and how fast? Why track both?', ['Detection rate shows coverage; time to detect shows how long bad data stays live', 'Only speed matters', 'Only coverage matters', 'Neither matters'], 'A slow detector or a leaky detector both let bad data reach users.'),
    q('Why ask someone to run the project from the README alone?', ['It exposes missing steps and unstated assumptions', 'To test their patience', 'It is optional trivia', 'It reduces cost'], 'The author cannot see their own gaps.'),
    q('What should the demo of a streaming pipeline show?', ['Bad events triggering an alert, and a killed job replaying without duplicates', 'Only a logo', 'Only code', 'Only a dashboard of CPU'], 'Show the guarantees, not just the happy path.'),
  ],
  20: [
    q('Which resume line is honest and strong for a career changer?', ['A measured project result, described as a portfolio project', 'A claim of years of production data engineering you did not have', 'A certification you have not earned', 'No details'], 'Describe what you did; unverifiable claims cost offers.'),
    q('Why practise timed SQL screens?', ['Many interviews test SQL under time pressure, and speed comes from practice', 'SQL is never tested', 'Timers cause errors', 'It replaces projects'], 'Fluency under time is a skill of its own.'),
    q('In a data system-design question, what should you do first?', ['Clarify requirements: volume, latency, users and quality needs', 'Draw the final architecture immediately', 'Name tools only', 'Ask for the answer'], 'Requirements drive trade-offs.'),
    q('Why shortlist roles and note repeating requirements?', ['It shows which skills the market asks for most so you can target them', 'It reduces applications to zero', 'It replaces networking', 'It is required by recruiters'], 'Use postings as data.'),
    q('What do interviewers want from a project walkthrough?', ['The problem, your decisions, what broke and what you measured', 'Only the final screenshot', 'The file names', 'Your editor settings'], 'They test understanding and honesty.'),
    q('After a mock interview shows a gap, what is the best step?', ['Write it down, study it and re-explain it aloud', 'Hope it is not asked again', 'Drop the project', 'Memorise a script without understanding'], 'Fix gaps while they are cheap.'),
    q('Why ask about an internal move or related team where you work?', ['Internal paths can be easier entry points and cost nothing to explore', 'It is required', 'It violates policy always', 'It replaces applications'], 'Check your employer\'s own openings as one of several routes.'),
  ],
}
