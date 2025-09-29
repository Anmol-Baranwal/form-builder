'use client'
import React, { JSX } from 'react'
import '@crayonai/react-ui/styles/index.css'
import { ThemeProvider, C1Chat } from '@thesysai/genui-sdk'

export default function C1ChatWrapper(): JSX.Element {
  return (
    <ThemeProvider mode="dark">
      <C1Chat
        apiUrl="/api/chat"
        agentName="FormBuilder"
        logoUrl="/logo.png"
        disableThemeProvider
      />
    </ThemeProvider>
  )
}
