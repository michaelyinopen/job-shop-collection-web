import { useState, useEffect } from 'react'
import { setupWorker } from 'msw'

// singleton worker
let worker

async function initializeWorker() {
  if (worker === undefined) {
    worker = setupWorker()
    await worker.start({ onUnhandledRequest: 'error' })
  }
}

export const MswDecorator = ({ children, handlers }) => {
  const [mswStarted, setMswStarted] = useState(worker !== undefined)

  useEffect(() => {
    initializeWorker().then(() => setMswStarted(true))
  }, [])

  useEffect(() => {
    worker.resetHandlers()
    worker.use(...handlers)
  }, [handlers])

  return mswStarted
    ? children
    : <div>Starting Mock Service Worker...</div>
}