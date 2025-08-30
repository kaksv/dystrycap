import React, {useState, useEffect} from 'react'
import Logo from '../assets/Logo.png'
import {ethers, parseUnits, formatUnits} from 'ethers'
import './Dash.css'
import Eth from '../assets/chainlogos/ethlg.svg'
import Arb from '../assets/chainlogos/arblg.svg'
import Celo from '../assets/chainlogos/celolg.svg'
import Op from '../assets/chainlogos/oplg.svg'
import Uni from '../assets/chainlogos/uinlg.svg'
import Base from '../assets/chainlogos/baselg.svg'
import {chainsConfig,ERC20_ABI} from './chainConfigs'


// import {connect} from './Utils'

const Herodash = () => {

  const [isConnected, setIsConnected] = useState(false);
  const [Provider, setProvider] = useState();
  const [Signer, setSigner] = useState() 
  const [Accounts, setAccounts] = useState([]);
  const [activeChainId, setChainId] = useState('')
  const [RecepientAcc,setRecepient] = useState('')
  const [DelegatedAcc,setDelegate] = useState()
  const [AssignedCaps,setAssignedCaps] = useState([])
  const [ActiveChain,setActiveChain] = useState()
  const [AmounttoSpend,setAmounttoSpend] = useState()
  const [AmounttoDelegate,setAmounttoDelegate] = useState()
  const [SendHash,setSendHash] = useState('')
  const [DelegateHash,setDelegateHash] = useState('')

  // ---Connect Function----
  const connect = async () => {
    if(window.ethereum) {
        try {
            const _Provider = new ethers.BrowserProvider(window.ethereum)
            const _Signer =  await _Provider.getSigner()
            const _accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
            const _activeChain =  await window.ethereum.request({method: "eth_chainId"})
            // await _Signer.signMessage(`Welcome to Dystry Cap`)
            setProvider(_Provider)
            setSigner(_Signer)
            setAccounts(_accounts);
            setIsConnected(true);
            setActiveChain(_activeChain);
            console.log('Assigned provider..',Provider)
            console.log('Assigned signer..',Signer)
            
            if(_Provider){getCaps()}
        }
        catch(error){
            window.alert(`There was an error ${error}`)
        }
    }  
}

  //---Disconnect Function----
  const disconnect = async () => {
      await window.ethereum.request({method:'wallet_revokePermissions',params:[{eth_accounts:{}}]})
      setIsConnected(false);

  }

  // Retrieve Spending Caps Functions

      const getCaps = async () => {
      const Caps = []

      const USDC_ContractBase = new ethers.Contract(chainsConfig[0].tokenContractUSDC_Testnet, ERC20_ABI, Provider)
          const AmountBase = await USDC_ContractBase.allowance('0x8f6dB7206B7b617c14fd39B26f48AD36963a48Be',Accounts[0])
          // console.log('Check.....',AmountBase)
          Caps.push(formatUnits(AmountBase.toString(),6))
      
      // const USDC_ContractCelo = new ethers.Contract(chainsConfig[1].tokenContractUSDC_Testnet, ERC20_ABI, Provider)
      //     const AmountCelo = await USDC_ContractCelo.allowance('0x8f6dB7206B7b617c14fd39B26f48AD36963a48Be',Accounts[0])
      //     // console.log('Check.....',AmountCelo)
      //     Caps.push(formatUnits(AmountCelo.toString(),6))

      // const USDC_ContractSepolia = new ethers.Contract(chainsConfig[2].tokenContractUSDC_Testnet, ERC20_ABI, Provider)
      //   const AmountSepolia = await USDC_ContractSepolia.allowance('0x8f6dB7206B7b617c14fd39B26f48AD36963a48Be',Accounts[0])
      //     // console.log('Check.....',AmountCelo)
      //   Caps.push(formatUnits(AmountSepolia.toString(),6))


      // for(let i = 0; i < chainsConfig.length; count++){
      //     const USDC_Contract = new ethers.Contract(chainsConfig[i].tokenContractUSDC_Testnet, ERC20_ABI, Provider)
      //     const Amount = await USDC_Contract.allowance('0x8f6dB7206B7b617c14fd39B26f48AD36963a48Be',Accounts[0])
      //     console.log('Check.....',Amount)
      //     Caps.push(formatUnits(Amount.toString(),6))
      //   }
        
        setAssignedCaps(Caps)
        }

      getCaps()


      const Spend  = async () => {
          
        try {
        const USDC_Transfer_Contract = new ethers.Contract(chainsConfig[0].tokenContractUSDC_Testnet, ERC20_ABI, Signer)
       
        const Transfer = await USDC_Transfer_Contract.transferFrom('0x8f6dB7206B7b617c14fd39B26f48AD36963a48Be',RecepientAcc,parseUnits(AmounttoSpend.toString(),6))
        const Recepit = await Transfer.wait()
        console.log('Transaction was successful')
        setSendHash(Recepit.hash)
        } catch(error){
          console.log('There was an error. Send failed',error)
        }

      }

      const Delegate = async () => {

          try {
        const USDC_Transfer_Contract = new ethers.Contract(chainsConfig[0].tokenContractUSDC_Testnet, ERC20_ABI, Signer)
       
        const delegate = await USDC_Transfer_Contract.approve(DelegatedAcc,parseUnits(AmounttoDelegate.toString(),6))
        const Recepit = await delegate.wait()
        console.log('Transaction was successful')
        setDelegateHash(Recepit.hash)
        } catch(error){
          console.log('There was an error. Send failed',error)
        }


      }

 

  // Check for Account Change and Check for Connected accounts
    useEffect(()=>{
        
    const check = async () => {
          try {
          const _Accounts =  await window.ethereum.request({method: "eth_accounts"})
           if(_Accounts > 0) { 
            setAccounts(_Accounts)
            setIsConnected(true)
            console.log('The connectec accouunts are',_Accounts)
            setIsConnected(true)
           } 
          }catch(error){
            window.alert('The designs failed',error)
          }
    } 

    check()

    window.ethereum.on('accountsChanged',(accounts)=> {
      if(accounts.length > 0 ){
        setAccounts(accounts)
        console.log('New accounts',accounts)
      }
    })

  },[])
 
  return (
    <div>

        {/* Dashboard */}
        <div className='dashboard'>

            {/* Header */}
            <div className='header'>
                <div className='Logo'>
                    <img src={Logo} id='Logo' alt="DystryCap Logo" />
                </div>
                {/* <img className='logos' src={Eth} alt="" />
                <img className='logos' src={Celo} alt="" />
                <img className='logos' src={Arb} alt="" /> */}
                <div className='connectButton'>
                    { isConnected && Accounts ? <h2>{`${Accounts[0].substring(0,6)}...${Accounts[0].substring(Accounts[0].length-4)}`}</h2> : ''}
                    <button style = {{display: isConnected ? 'none' : 'flex'}} onClick={connect} id='connectbtn'>Connect</button>
                    <button style = {{display: isConnected? 'flex' : 'none'}} onClick={disconnect} id='connectbtn'>Disconnect</button>
                </div>
            </div>
        </div>

        {/* content Area */}
        <div className='contentArea'>
          
          { !isConnected ? <h3 id="AssignSecConnect">Connect Wallet</h3> : (<div className='Assigned Spending Caps'>
            <h2 className='section_head'> Assigned amounts </h2>
             <hr className='hr'/>
          
            <div className='capbtns'>
{/*                
               <button className='activeChainCaps'>
                Ethereum Amounts         
               </button>

               <button>
                All Chains Amounts
               </button> */}

            </div>

            {/* The Caps */}
            <div className = 'caps'>
              <div className='Caps'>
                  <div className = 'CapsHead' >
                    <img src={Base} alt="" />
                    <h3>Base Sepolia</h3>
                  </div>
                  <div className='capsData'>
                    <h4>{AssignedCaps[0] ? `${AssignedCaps[0]} USDT` : 'No Spending Cap found'}</h4>
                  </div>
              </div>
                 <hr/> 
              <div className='Caps'>
                  <div className = 'CapsHead' >
                    <img src={Celo} alt="" />
                    <h3>Celo Alfajores</h3>
                  </div>
                  <div className='capsData'>
                    <h4>{+AssignedCaps[1] ? `${AssignedCaps[1]} USDT` : 'No Spending Cap found'}</h4>
                  </div>
              </div>
                <hr/>
              <div className='Caps'>
                  <div className = 'CapsHead' >
                    <img src={Eth} alt="" />
                    <h3>Sepolia</h3>
                  </div>
                  <div className='capsData'>
                    <h4>{AssignedCaps[2] ? `${AssignedCaps[2]} USDT` : 'No Spending Cap found'}</h4>
                  </div>
              </div>
                <hr/>
              <div className='Caps'>
                  <div className = 'CapsHead' >
                    <img src={Arb} alt="" />
                    <h3>Arbitrum Sepolia</h3>
                  </div>
                  <div className='capsData'>
                    <h4>{AssignedCaps[3] ? `${AssignedCaps[3]} USDT` : 'No Spending Cap found'}</h4>
                  </div>
              </div>
                <hr/>
              <div className='Caps'>
                  <div className = 'CapsHead' >
                    <img src={Op} alt="" />
                    <h3>Optimism Sepolia</h3>
                  </div>
                  <div className='capsData'>
                    <h4>{AssignedCaps[4] ? `${AssignedCaps[4]} USDT` : 'No Spending Cap found'}</h4>
                  </div>
              </div>
                <hr/>
              <div className='Caps'>
                  <div className = 'CapsHead' >
                    <img src={Uni} alt="" />
                    <h3>Unichain Sepolia</h3>
                  </div>
                  <div className='capsData'>
                    <h4>{AssignedCaps[5] ? `${AssignedCaps[5]} USDT` : 'No Spending Cap found'}</h4>
                  </div>
              </div>
                <hr/>
            </div>

          </div>)
          }
          
          {/* Spend Tokens Section */}
          <div>
      
            <h2 className='head'>Spend tokens</h2>
            <hr className='hr'/>

            <div className='spendContent'>  
            <h5 className='warning'>
            Note: You can only spend tokens on the active chain. Switch to desired chain
            </h5>

              <div id='recepient'>
                <h4>Enter recepient's address</h4>
                <input type="text" placeholder='0xF94CC1Eb19C43d73Eec9e55c13494abe1dfFb648' value={RecepientAcc} 
                onChange={(e)=>{setRecepient(e.target.value);}}
                />
                <h4>Enter amount</h4>
                <input type="text" placeholder='0.25' value={AmounttoSpend} 
                onChange={(e)=>{setAmounttoSpend(e.target.value);}}
                />
                <button onClick={Spend}>Send USDC</button>
              </div>
              {/* <div>
                <h5 style={{display: SendHash ? 'flex' : 'none', cursor:'pointer'}}> <a onClick={()=>{setSendHash('')}}>{`Check explorer: ${SendHash.substring(0,6)}...${SendHash.substring(SendHash.length-4)}`}</a></h5>
              </div> */}
            </div>
            
          </div>
          
          <div>
            <h2 className='head'>Assign spending amounts</h2>
            <hr className='hr'/>

              <div className='delegateContent'>  
            <h5 className='warning'>
            Note: You can only delegate tokens on the active chain. Switch to desired chain
            </h5>

              <div id='Delegate'>
                <h4>Enter delegate's address</h4>
                <input type="text" placeholder='0xF94CC1Eb19C43d73Eec9e55c13494abe1dfFb648' value={DelegatedAcc} onChange={(e)=>{setDelegate(e.target.value)}} />
                 <h4>Enter amount</h4>
                <input type="text" placeholder='0.25' value={AmounttoDelegate} 
                onChange={(e)=>{setAmounttoDelegate(e.target.value);}}
                />
                <button onClick={Delegate}>Delegate</button>
              </div>
            </div>

          </div>
        </div>

    </div>


  )
}

export default Herodash