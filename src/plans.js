import aiPlan from './data/plan.json'
import { dePlan } from './data/de-plan.js'
import { aiQuiz } from './data/ai-quiz.js'
import { deQuiz, deBlockOf } from './data/de-quiz.js'
import { DEFAULT_SCHEDULE } from './lib.js'

// One entry per tab. The AI plan keeps its original ids, routes and storage keys, so the progress, notes,
// schedule and sync data you already have keep working. The data engineering plan prefixes everything with "de".
export const PLANS = {
  ai: {
    id: 'ai',
    short: 'AI Platform',
    sub: '90 days',
    brand: '90-Day AI Platform',
    docTitle: '90-Day AI Platform Plan',
    repoName: 'AI_Platform_Learning_Progress',
    plan: aiPlan,
    base: '#', // links look like #/week/3
    idp: '', // task ids look like w3-s0
    settingKey: 'schedule',
    defaultSchedule: DEFAULT_SCHEDULE,
    quiz: aiQuiz,
    quizUnitOf: (w) => w.n, // which question bank a plan week uses
    unitsLabel: '12 weeks',
    copy: {
      kickoffTitle: 'Start here: the 90-minute kickoff',
      kickoffBlurb: '90 minutes. A Python project on GitHub, a running FastAPI app, one passing test.',
      kickoffNav: 'Kickoff · day 1',
      kickoffEyebrow: (day) => `Day 1 (${day}) · 90 minutes`,
      kickoffDates: true,
      gatesIntro: 'Four checkpoints. If you miss one, repeat that week before moving on. The later weeks assume the earlier ones work.',
      gateWord: 'Gate',
      afterNav: 'After the 90 days',
      linksFilter: 'Filter links (docker, terraform, week 6…)',
      weekWord: 'Week',
      endNoun: 'the 90 days',
    },
  },
  de: {
    id: 'de',
    short: 'Data Engineer',
    sub: '40 weeks',
    brand: 'Data Engineer Path',
    docTitle: 'Data Engineer Career Path',
    repoName: 'Data_Engineer_Learning_Progress',
    plan: dePlan,
    base: '#', // one plan per site, so links look the same on both
    idp: 'de:',
    settingKey: 'schedule-de',
    // Placeholder start: the Monday after the 90-day AI plan ends (Feb 7, 2027). Both plans use the
    // weekday noon-1 pm slot, so they cannot run side by side. Change it in "Schedule".
    defaultSchedule: { start: '2027-02-08', weeksPer: 1, breaks: [] },
    quiz: deQuiz,
    quizUnitOf: (w) => deBlockOf(w.n),
    unitsLabel: '40 weeks',
    parkedNote: 'Parked behind the 90-day AI Platform plan: both use your weekday noon to 1 pm slot, so they cannot run side by side. The start date shown is a placeholder (the Monday after the AI plan ends). Open Schedule to change it.',
    copy: {
      kickoffTitle: 'Before week 1: set up your workbench',
      kickoffBlurb: 'About 2 hours. Docker, Python, Git, a repo, Postgres from one command, and a SQL baseline score.',
      kickoffNav: 'Setup · before week 1',
      kickoffEyebrow: () => 'Before week 1 · about 2 hours',
      kickoffDates: false,
      gatesIntro: 'Four checkpoints: three published projects and the exam. If you miss one, repeat that block before moving on, and protect these over any optional item.',
      gateWord: 'Checkpoint',
      afterNav: 'After the plan',
      linksFilter: 'Filter links (dbt, spark, azure, week 12…)',
      weekWord: 'Week',
      endNoun: 'the plan',
    },
  },
}

export const PLAN_LIST = [PLANS.ai, PLANS.de]
// Each GitHub Pages site is built for one plan: `VITE_PLAN=de npm run build` for the data engineering site.
// Both sites share one origin (and so one browser store and one sync document); plan ids never overlap,
// so progress on the two plans lives side by side without clashing.
export const ACTIVE = import.meta.env?.VITE_PLAN === 'de' ? PLANS.de : PLANS.ai
