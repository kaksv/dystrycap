import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import Herodash from './Dash/Dash'
import './App.css'

function App() {
  useEffect(() => {
    async function sdkactions() {
      await sdk.actions.ready()
    }
    sdkactions();
  
  }, [])
  

  return (
    <>
      <Herodash />
    </>
  )
}

export default App
