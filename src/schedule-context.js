import { createContext, useContext } from 'react'

export const SchedCtx = createContext(null)
export const useSched = () => useContext(SchedCtx)
