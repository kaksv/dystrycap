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
  
  // New state for better UX
  const [isLoading, setIsLoading] = useState(false);
  const [isSpending, setIsSpending] = useState(false);
  const [isDelegating, setIsDelegating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ---Connect Function----
  const connect = async () => {
    if(window.ethereum) {
        try {
            setIsLoading(true);
            setError('');
            const _Provider = new ethers.BrowserProvider(window.ethereum)
            const _Signer =  await _Provider.getSigner()
            const _accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
            const _activeChain =  await window.ethereum.request({method: "eth_chainId"})
            
            setProvider(_Provider)
            setSigner(_Signer)
            setAccounts(_accounts);
            setIsConnected(true);
            setActiveChain(_activeChain);
            setSuccess('Wallet connected successfully!');
            
            if(_Provider){getCaps()}
        }
        catch(error){
            // Handle different types of errors gracefully
            let errorMessage = 'Connection failed. Please try again.';
            
            if (error.code === 4001) {
                errorMessage = 'Connection was rejected. Please approve the connection request in MetaMask.';
            } else if (error.code === 'ACTION_REJECTED') {
                errorMessage = 'Connection was cancelled. Please try again and approve the request.';
            } else if (error.message && error.message.includes('user rejected')) {
                errorMessage = 'Connection was rejected. Please approve the connection request in MetaMask.';
            } else if (error.message && error.message.includes('ethers-user-denied')) {
                errorMessage = 'Connection was denied. Please approve the connection request in MetaMask.';
            } else if (error.message) {
                errorMessage = `Connection failed: ${error.message}`;
            }
            
            setError(errorMessage);
            console.error('Connection error:', error);
        } finally {
            setIsLoading(false);
        }
    } else {
        setError('MetaMask not found. Please install MetaMask to continue.');
    }
}

  //---Disconnect Function----
  const disconnect = async () => {
      try {
          await window.ethereum.request({method:'wallet_revokePermissions',params:[{eth_accounts:{}}]})
          setIsConnected(false);
          setSuccess('Wallet disconnected successfully!');
          setAssignedCaps([]);
          setProvider(null);
          setSigner(null);
          setAccounts([]);
      } catch (error) {
          setError('Disconnect failed. Please try again.');
      }
  }

  // Retrieve Spending Caps Functions
  const getCaps = async () => {
      try {
          setIsLoading(true);
          const Caps = []

          const USDC_ContractBase = new ethers.Contract(chainsConfig[0].tokenContractUSDC_Testnet, ERC20_ABI, Provider)
          const AmountBase = await USDC_ContractBase.allowance('0x8f6dB7206B7b617c14fd39B26f48AD36963a48Be',Accounts[0])
          Caps.push(formatUnits(AmountBase.toString(),6))
          
          setAssignedCaps(Caps)
      } catch (error) {
          setError('Failed to fetch spending caps. Please try again.');
          console.error('Get caps error:', error);
      } finally {
          setIsLoading(false);
      }
  }

  const Spend = async () => {
      if (!RecepientAcc || !AmounttoSpend) {
          setError('Please fill in all fields');
          return;
      }
      
      try {
          setIsSpending(true);
          setError('');
          setSuccess('');
          
          const USDC_Transfer_Contract = new ethers.Contract(chainsConfig[0].tokenContractUSDC_Testnet, ERC20_ABI, Signer)
          const Transfer = await USDC_Transfer_Contract.transferFrom('0x8f6dB7206B7b617c14fd39B26f48AD36963a48Be',RecepientAcc,parseUnits(AmounttoSpend.toString(),6))
          const Recepit = await Transfer.wait()
          
          setSuccess(`Transaction successful! Hash: ${Recepit.hash.substring(0,6)}...${Recepit.hash.substring(Recepit.hash.length-4)}`);
          setSendHash(Recepit.hash);
          setRecepient('');
          setAmounttoSpend('');
          
          // Refresh caps after spending
          if (Provider) getCaps();
      } catch(error){
          setError(`Transaction failed: ${error.message}`);
          console.error('Spend error:', error);
      } finally {
          setIsSpending(false);
      }
  }

  const Delegate = async () => {
      if (!DelegatedAcc || !AmounttoDelegate) {
          setError('Please fill in all fields');
          return;
      }
      
      try {
          setIsDelegating(true);
          setError('');
          setSuccess('');
          
          const USDC_Transfer_Contract = new ethers.Contract(chainsConfig[0].tokenContractUSDC_Testnet, ERC20_ABI, Signer)
          const delegate = await USDC_Transfer_Contract.approve(DelegatedAcc,parseUnits(AmounttoDelegate.toString(),6))
          const Recepit = await delegate.wait()
          
          setSuccess(`Delegation successful! Hash: ${Recepit.hash.substring(0,6)}...${Recepit.hash.substring(Recepit.hash.length-4)}`);
          setDelegateHash(Recepit.hash);
          setDelegate('');
          setAmounttoDelegate('');
          
          // Refresh caps after delegation
          if (Provider) getCaps();
      } catch(error){
          setError(`Delegation failed: ${error.message}`);
          console.error('Delegate error:', error);
      } finally {
          setIsDelegating(false);
      }
  }

  // Clear messages after 5 seconds
  useEffect(() => {
      if (success || error) {
          const timer = setTimeout(() => {
              setSuccess('');
              setError('');
          }, 5000);
          return () => clearTimeout(timer);
      }
  }, [success, error]);

  // Check for Account Change and Check for Connected accounts
  useEffect(()=>{
      const check = async () => {
          try {
              const _Accounts =  await window.ethereum.request({method: "eth_accounts"})
              if(_Accounts.length > 0) { 
                  setAccounts(_Accounts)
                  setIsConnected(true)
                  if(Provider) getCaps()
              } 
          } catch(error){
              // Handle permission errors silently - user might not have granted access yet
              if (error.code === 4001 || error.code === 'ACTION_REJECTED' || 
                  error.message?.includes('user rejected') || error.message?.includes('ethers-user-denied')) {
                  // User hasn't granted permission yet, this is normal
                  console.log('User has not granted MetaMask permissions yet');
              } else {
                  setError('Failed to check accounts. Please try refreshing the page.');
                  console.error('Check accounts error:', error);
              }
          }
      } 

      check()

      if (window.ethereum) {
          window.ethereum.on('accountsChanged',(accounts)=> {
              if(accounts.length > 0 ){
                  setAccounts(accounts)
                  if(Provider) getCaps()
              } else {
                  setIsConnected(false);
                  setAssignedCaps([]);
              }
          })
          
          // Handle chain changes
          window.ethereum.on('chainChanged', (chainId) => {
              // Reload the page when chain changes to ensure proper state
              window.location.reload();
          });
          
          // Handle disconnect events
          window.ethereum.on('disconnect', () => {
              setIsConnected(false);
              setAssignedCaps([]);
              setProvider(null);
              setSigner(null);
              setAccounts([]);
          });
      }

      return () => {
          if (window.ethereum) {
              window.ethereum.removeAllListeners();
          }
      }
  },[Provider])

  return (
    <div className="dashboard">
        {/* Dashboard */}
        <div className='header'>
            {/* Header */}
            <div className='Logo'>
                <img src={Logo} id='Logo' alt="DystryCap Logo" />
            </div>
            <div className='connectButton'>
                { isConnected && Accounts ? 
                    <h2>{`${Accounts[0].substring(0,6)}...${Accounts[0].substring(Accounts[0].length-4)}`}</h2> : ''
                }
                <button 
                    style = {{display: isConnected ? 'none' : 'flex'}} 
                    onClick={connect} 
                    id='connectbtn'
                    disabled={isLoading}
                    className={isLoading ? 'loading' : ''}
                >
                    {isLoading ? (
                        <>
                            <div className="button-spinner"></div>
                            Connecting...
                        </>
                    ) : (
                        'Connect Wallet'
                    )}
                </button>
                <button 
                    style = {{display: isConnected? 'flex' : 'none'}} 
                    onClick={disconnect} 
                    id='connectbtn'
                    className="disconnect-btn"
                >
                    Disconnect
                </button>
            </div>
        </div>

        {/* Status Messages */}
        {(error || success) && (
            <div className={`status-message ${error ? 'error' : 'success'}`}>
                {error || success}
                {error && error.includes('rejected') && (
                    <div className="error-help">
                        <p>💡 <strong>How to connect:</strong></p>
                        <ol>
                            <li>Click "Connect" again</li>
                            <li>In MetaMask, click "Connect" when prompted</li>
                            <li>Make sure you're on the correct network</li>
                        </ol>
                    </div>
                )}
            </div>
        )}

        {/* content Area */}
        <div className='contentArea'>
          
          { !isConnected ? (
              <div className="connect-prompt">
                  <h3 id="AssignSecConnect">Connect Your Wallet</h3>
                  <p>Connect your MetaMask wallet to view and manage your spending caps</p>
              </div>
          ) : (
              <div className='Assigned Spending Caps'>
                  <h2 className='section_head'>Assigned Spending Caps</h2>
                  <hr className='hr'/>
                  
                  {isLoading ? (
                      <div className="loading-state">
                          <div className="spinner"></div>
                          <p>Loading spending caps...</p>
                      </div>
                  ) : (
                      <div className = 'caps'>
                          <div className='Caps'>
                              <div className = 'CapsHead' >
                                  <img src={Base} alt="Base" />
                                  <h3>Base Sepolia</h3>
                              </div>
                              <div className='capsData'>
                                  <h4>{AssignedCaps[0] ? `${AssignedCaps[0]} USDT` : 'No Spending Cap found'}</h4>
                              </div>
                          </div>
                          <hr/> 
                          <div className='Caps'>
                              <div className = 'CapsHead' >
                                  <img src={Celo} alt="Celo" />
                                  <h3>Celo Alfajores</h3>
                              </div>
                              <div className='capsData'>
                                  <h4>{+AssignedCaps[1] ? `${AssignedCaps[1]} USDT` : 'No Spending Cap found'}</h4>
                              </div>
                          </div>
                          <hr/>
                          <div className='Caps'>
                              <div className = 'CapsHead' >
                                  <img src={Eth} alt="Ethereum" />
                                  <h3>Sepolia</h3>
                              </div>
                              <div className='capsData'>
                                  <h4>{AssignedCaps[2] ? `${AssignedCaps[2]} USDT` : 'No Spending Cap found'}</h4>
                              </div>
                          </div>
                          <hr/>
                          <div className='Caps'>
                              <div className = 'CapsHead' >
                                  <img src={Arb} alt="Arbitrum" />
                                  <h3>Arbitrum Sepolia</h3>
                              </div>
                              <div className='capsData'>
                                  <h4>{AssignedCaps[3] ? `${AssignedCaps[3]} USDT` : 'No Spending Cap found'}</h4>
                              </div>
                          </div>
                          <hr/>
                          <div className='Caps'>
                              <div className = 'CapsHead' >
                                  <img src={Op} alt="Optimism" />
                                  <h3>Optimism Sepolia</h3>
                              </div>
                              <div className='capsData'>
                                  <h4>{AssignedCaps[4] ? `${AssignedCaps[4]} USDT` : 'No Spending Cap found'}</h4>
                              </div>
                          </div>
                          <hr/>
                          <div className='Caps'>
                              <div className = 'CapsHead' >
                                  <img src={Uni} alt="Unichain" />
                                  <h3>Unichain Sepolia</h3>
                              </div>
                              <div className='capsData'>
                                  <h4>{AssignedCaps[5] ? `${AssignedCaps[5]} USDT` : 'No Spending Cap found'}</h4>
                              </div>
                          </div>
                          <hr/>
                      </div>
                  )}
              </div>
          )}
          
          {/* Spend Tokens Section */}
          <div>
              <h2 className='head'>Spend Tokens</h2>
              <hr className='hr'/>
              <div className='spendContent'>  
                  <h5 className='warning'>
                      Note: You can only spend tokens on the active chain. Switch to desired chain
                  </h5>
                  <div id='recepient'>
                      <h4>Enter recipient's address</h4>
                      <input 
                          type="text" 
                          placeholder='0xF94CC1Eb19C43d73Eec9e55c13494abe1dfFb648' 
                          value={RecepientAcc} 
                          onChange={(e)=>{setRecepient(e.target.value);}}
                          disabled={!isConnected}
                      />
                      <h4>Enter amount</h4>
                      <input 
                          type="number" 
                          placeholder='0.25' 
                          value={AmounttoSpend} 
                          onChange={(e)=>{setAmounttoSpend(e.target.value);}}
                          disabled={!isConnected}
                          step="0.01"
                          min="0"
                      />
                      <button 
                          onClick={Spend}
                          disabled={!isConnected || isSpending || !RecepientAcc || !AmounttoSpend}
                          className={isSpending ? 'loading' : ''}
                      >
                          {isSpending ? 'Sending...' : 'Send USDC'}
                      </button>
                  </div>
              </div>
          </div>
          
          {/* Delegate Section */}
          <div>
              <h2 className='head'>Assign Spending Amounts</h2>
              <hr className='hr'/>
              <div className='delegateContent'>  
                  <h5 className='warning'>
                      Note: You can only delegate tokens on the active chain. Switch to desired chain
                  </h5>
                  <div id='Delegate'>
                      <h4>Enter delegate's address</h4>
                      <input 
                          type="text" 
                          placeholder='0xF94CC1Eb19C43d73Eec9e55c13494abe1dfFb648' 
                          value={DelegatedAcc} 
                          onChange={(e)=>{setDelegate(e.target.value)}} 
                          disabled={!isConnected}
                      />
                      <h4>Enter amount</h4>
                      <input 
                          type="number" 
                          placeholder='0.25' 
                          value={AmounttoDelegate} 
                          onChange={(e)=>{setAmounttoDelegate(e.target.value);}}
                          disabled={!isConnected}
                          step="0.01"
                          min="0"
                      />
                      <button 
                          onClick={Delegate}
                          disabled={!isConnected || isDelegating || !DelegatedAcc || !AmounttoDelegate}
                          className={isDelegating ? 'loading' : ''}
                      >
                          {isDelegating ? 'Delegating...' : 'Delegate'}
                      </button>
                  </div>
              </div>
          </div>
        </div>
    </div>
  )
}

export default Herodash