import { createContext, useContext } from 'react'

// The plan definition (see plans.js) for whichever tab is open.
export const PlanCtx = createContext(null)
export const usePlan = () => useContext(PlanCtx)
