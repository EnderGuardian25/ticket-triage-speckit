'use client'

import { useEffect } from 'react'

export default function AxeDevInit() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    void import('@axe-core/react').then(({ default: axe }) =>
      import('react').then((React) =>
        import('react-dom').then((ReactDOM) => {
          void axe(React, ReactDOM, 1000)
        })
      )
    )
  }, [])
  return null
}
