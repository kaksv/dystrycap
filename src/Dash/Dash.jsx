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
  const [AmounttoSpend,setAmounttoSpend] = useState('')
  const [AmounttoDelegate,setAmounttoDelegate] = useState('')
  const [SendHash,setSendHash] = useState('')
  const [DelegateHash,setDelegateHash] = useState('')
  
  // New state for better UX
  const [isLoading, setIsLoading] = useState(false);
  const [isSpending, setIsSpending] = useState(false);
  const [isDelegating, setIsDelegating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // New state for wallet address input and spending history
  const [inputWalletAddress, setInputWalletAddress] = useState('');
  const [isCheckingCaps, setIsCheckingCaps] = useState(false);
  const [userCaps, setUserCaps] = useState(null);
  const [spendingHistory, setSpendingHistory] = useState([]);
  
  // Modal state management
  const [isSpendModalOpen, setIsSpendModalOpen] = useState(false);
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  
  // Pending action after network switch
  const [pendingAction, setPendingAction] = useState(null);
  
  // Helper function to validate Ethereum addresses
  const isValidEthereumAddress = (address) => {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // ---Connect Function----
  const connect = async () => {
    if(window.ethereum) {
        // Prevent multiple simultaneous connection attempts
        if (isLoading) {
            return;
        }
        
        try {
            setIsLoading(true);
            setError('');
            
            // First check if we already have accounts without requesting
            const existingAccounts = await window.ethereum.request({method: "eth_accounts"});
            
            if (existingAccounts.length > 0) {
                // We already have permission, just get the provider and signer
                const _Provider = new ethers.BrowserProvider(window.ethereum);
                const _Signer = await _Provider.getSigner();
                const _activeChain = await window.ethereum.request({method: "eth_chainId"});
                
                setProvider(_Provider);
                setSigner(_Signer);
                setAccounts(existingAccounts);
                setIsConnected(true);
                setActiveChain(_activeChain);
                setSuccess('Wallet connected successfully!');
                
                if(_Provider){getCaps()}
            } else {
                // No existing permission, request new access
                const _Provider = new ethers.BrowserProvider(window.ethereum);
                const _Signer = await _Provider.getSigner();
                const _accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
                const _activeChain = await window.ethereum.request({method: "eth_chainId"});
                
                setProvider(_Provider);
                setSigner(_Signer);
                setAccounts(_accounts);
                setIsConnected(true);
                setActiveChain(_activeChain);
                setSuccess('Wallet connected successfully!');
                
                if(_Provider){getCaps()}
            }
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
            } else if (error.message && error.message.includes('already pending')) {
                errorMessage = 'Connection request already pending. Please check MetaMask.';
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

  //---Switch to Base Network Function----
  const switchToBaseNetwork = async () => {
      try {
          await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x2105' }], // Base mainnet
          });
          setSuccess('Switched to Base mainnet successfully!');
          
          // Execute pending action if any
          if (pendingAction) {
              setTimeout(() => {
                  executePendingAction();
              }, 1000); // Small delay to ensure network switch is complete
          }
      } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
              try {
                  await window.ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: [{
                          chainId: '0x2105',
                          chainName: 'Base',
                          nativeCurrency: {
                              name: 'ETH',
                              symbol: 'ETH',
                              decimals: 18
                          },
                          rpcUrls: ['https://base.drpc.org'],
                          blockExplorerUrls: ['https://basescan.org/']
                      }]
                  });
                  setSuccess('Base mainnet added and switched successfully!');
                  
                  // Execute pending action if any
                  if (pendingAction) {
                      setTimeout(() => {
                          executePendingAction();
                      }, 1000); // Small delay to ensure network switch is complete
                  }
              } catch (addError) {
                  setError('Failed to add Base mainnet to MetaMask');
                  console.error('Add chain error:', addError);
              }
          } else {
              setError('Failed to switch to Base mainnet');
              console.error('Switch chain error:', switchError);
          }
      }
  }

  //---Execute Pending Action Function----
  const executePendingAction = async () => {
      if (pendingAction === 'delegate') {
          setPendingAction(null);
          await Delegate();
      } else if (pendingAction === 'spend') {
          setPendingAction(null);
          await Spend();
      }
  }

  //---Disconnect Function----
  const disconnect = async () => {
      try {
          // Try to revoke permissions, but don't fail if it doesn't work
          try {
              await window.ethereum.request({method:'wallet_revokePermissions',params:[{eth_accounts:{}}]});
          } catch (revokeError) {
              console.log('Permission revocation not supported or failed:', revokeError);
              // Continue with disconnect even if revocation fails
          }
          
          setIsConnected(false);
          setSuccess('Wallet disconnected successfully!');
          setAssignedCaps([]);
          setProvider(null);
          setSigner(null);
          setAccounts([]);
          // Clear wallet address input and user caps
          setInputWalletAddress('');
          setUserCaps(null);
          setSpendingHistory([]);
      } catch (error) {
          console.error('Disconnect error:', error);
          // Even if there's an error, we should still disconnect locally
          setIsConnected(false);
          setAssignedCaps([]);
          setProvider(null);
          setSigner(null);
          setAccounts([]);
          setInputWalletAddress('');
          setUserCaps(null);
          setSpendingHistory([]);
          setSuccess('Wallet disconnected successfully!');
      }
  }

  // Retrieve Spending Caps Functions
  const getCaps = async () => {
      try {
          if (!Accounts || Accounts.length === 0) {
              console.log('No accounts available for getCaps');
              return;
          }
          
          if (!Provider) {
              console.log('No provider available for getCaps');
              return;
          }
          
          setIsLoading(true);
          const Caps = []

          try {
              const USDC_ContractBase = new ethers.Contract(chainsConfig[1].tokenContractUSDC_Mainnet, ERC20_ABI, Provider)
              const AmountBase = await USDC_ContractBase.allowance('0x8f6dB7206B7b617c14fd39B26f48AD36963a48Be', Accounts[0])
              
              // Ensure AmountBase is a BigNumber
              const amountBN = ethers.BigNumber.from(AmountBase);
              Caps.push(formatUnits(amountBN.toString(), 6))
              
              setAssignedCaps(Caps)
          } catch (contractError) {
              console.error('Contract call error in getCaps:', contractError);
              // Set empty caps if contract call fails
              setAssignedCaps([])
          }
      } catch (error) {
          setError('Failed to fetch spending caps. Please try again.');
          console.error('Get caps error:', error);
      } finally {
          setIsLoading(false);
      }
  }

  // Check spending caps for a specific wallet address
  const checkWalletCaps = async (walletAddress) => {
      if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith('0x')) {
          setError('Please enter a valid wallet address');
          return;
      }

          if (!Provider) {
              setError('No provider available. Please connect your wallet first.');
              return;
          }
          
          // Validate contract address
          if (!chainsConfig[1] || !chainsConfig[1].tokenContractUSDC_Mainnet) {
              setError('Invalid contract configuration. Please check the network settings.');
              return;
          }
          
          // Check if user is on the correct network (Base mainnet)
          try {
              const currentChainId = await window.ethereum.request({method: "eth_chainId"});
              if (currentChainId !== '0x2105') { // Base mainnet chain ID
                  setError('Please switch to Base mainnet to check wallet caps. Click the button below to switch networks.');
                  setPendingAction('checkCaps');
                  return;
              }
          } catch (error) {
              console.error('Failed to check chain ID:', error);
              setError('Failed to verify network. Please try again.');
              return;
          }

      try {
          setIsCheckingCaps(true);
          setError('');
          setSuccess('');

          // Check allowance for the input wallet address
          const delegatorAddress = '0x8f6dB7206B7b617c14fd39B26f48AD36963a48Be';
          const contractAddress = chainsConfig[1].tokenContractUSDC_Mainnet;
          
          // Validate addresses
          if (!isValidEthereumAddress(delegatorAddress)) {
              setError('Invalid delegator address configuration');
              return;
          }
          
          if (!isValidEthereumAddress(contractAddress)) {
              setError('Invalid contract address configuration');
              return;
          }
          
          console.log('Checking caps for wallet:', walletAddress);
          console.log('Delegator address:', delegatorAddress);
          console.log('Contract address:', contractAddress);
          
          const USDC_ContractBase = new ethers.Contract(contractAddress, ERC20_ABI, Provider)
          
          // Get allowance and balance with proper error handling
          let allowance, balance;
          
          try {
              allowance = await USDC_ContractBase.allowance(delegatorAddress, walletAddress)
              console.log('Allowance raw value:', allowance);
          } catch (allowanceError) {
              console.error('Allowance error:', allowanceError);
              setError('Failed to fetch allowance. Please check if the contract address is correct.');
              return;
          }
          
          try {
              balance = await USDC_ContractBase.balanceOf(walletAddress)
              console.log('Balance raw value:', balance);
          } catch (balanceError) {
              console.error('Balance error:', balanceError);
              setError('Failed to fetch balance. Please check if the contract address is correct.');
              return;
          }
          
          // Ensure values are valid before converting
          if (allowance === null || allowance === undefined || balance === null || balance === undefined) {
              setError('Failed to fetch contract data. Please try again.');
              return;
          }
          
          // Convert to BigNumber - works with both ethers v5 and v6
          let allowanceBN, balanceBN;
          
          try {
              allowanceBN = ethers.BigNumber.from(allowance || '0');
              balanceBN = ethers.BigNumber.from(balance || '0');
          } catch (conversionError) {
              console.error('BigNumber conversion error:', conversionError);
              setError('Failed to process contract data. Please try again.');
              return;
          }
          
          console.log('Allowance BigNumber:', allowanceBN);
          console.log('Balance BigNumber:', balanceBN);
          
          // Calculate remaining amount safely
          let remaining;
          try {
              remaining = allowanceBN.sub(balanceBN);
              console.log('Remaining calculated:', remaining);
          } catch (calcError) {
              console.error('Calculation error:', calcError);
              // If subtraction fails, set remaining to 0
              remaining = ethers.BigNumber.from(0);
          }
          
          // Get spending history (this would typically come from events, but for demo we'll simulate)
          const mockSpendingHistory = [
              {
                  hash: '0x1234...5678',
                  amount: '100.00',
                  timestamp: Date.now() - 86400000, // 1 day ago
                  type: 'Spent'
              },
              {
                  hash: '0x8765...4321',
                  amount: '50.00',
                  timestamp: Date.now() - 172800000, // 2 days ago
                  type: 'Spent'
              }
          ];

          setUserCaps({
              address: walletAddress,
              allowance: formatUnits(allowanceBN.toString(), 6),
              balance: formatUnits(balanceBN.toString(), 6),
              remaining: formatUnits(remaining.toString(), 6)
          });
          
          setSpendingHistory(mockSpendingHistory);
          setSuccess(`Found spending caps for ${walletAddress.substring(0,6)}...${walletAddress.substring(walletAddress.length-4)}`);
          
      } catch (error) {
          setError(`Failed to check wallet caps: ${error.message}`);
          console.error('Check wallet caps error:', error);
      } finally {
          setIsCheckingCaps(false);
      }
  }

  const Spend = async () => {
      if (!RecepientAcc || !AmounttoSpend) {
          setError('Please fill in all fields');
          return;
      }
      
      if (!Signer) {
          setError('No signer available. Please reconnect your wallet.');
          return;
      }
      
      // Check if user is on the correct network (Base mainnet)
      try {
          const currentChainId = await window.ethereum.request({method: "eth_chainId"});
          if (currentChainId !== '0x2105') { // Base mainnet chain ID
              setError('Please switch to Base mainnet to perform this transaction. Click the button below to switch networks.');
              // Store the current action to perform after network switch
              setPendingAction('spend');
              return;
          }
      } catch (error) {
          console.error('Failed to check chain ID:', error);
          setError('Failed to verify network. Please try again.');
          return;
      }
      
      try {
          setIsSpending(true);
          setError('');
          setSuccess('');
          
          // Validate amount
          const amount = parseFloat(AmounttoSpend);
          if (isNaN(amount) || amount <= 0) {
              setError('Please enter a valid amount greater than 0');
              return;
          }
          
          const USDC_Transfer_Contract = new ethers.Contract(chainsConfig[1].tokenContractUSDC_Mainnet, ERC20_ABI, Signer)
          const Transfer = await USDC_Transfer_Contract.transferFrom('0x8f6dB7206B7b617c14fd39B26f48AD36963a48Be', RecepientAcc, parseUnits(amount.toString(), 6))
          const Recepit = await Transfer.wait()
          
          setSuccess(`Transaction successful! Hash: ${Recepit.hash.substring(0,6)}...${Recepit.hash.substring(Recepit.hash.length-4)}`);
          setSendHash(Recepit.hash);
          setRecepient('');
          setAmounttoSpend('');
          
          // Refresh caps after spending
          if (Provider) getCaps();
      } catch(error){
          let errorMessage = 'Transaction failed';
          
          if (error.code === 'ACTION_REJECTED' || error.message?.includes('user rejected')) {
              errorMessage = 'Transaction was rejected by user';
          } else if (error.code === 'INSUFFICIENT_FUNDS') {
              errorMessage = 'Insufficient funds for transaction';
          } else if (error.message) {
              errorMessage = `Transaction failed: ${error.message}`;
          }
          
          setError(errorMessage);
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
      
      if (!Signer) {
          setError('No signer available. Please reconnect your wallet.');
          return;
      }
      
      // Check if user is on the correct network (Base mainnet)
      try {
          const currentChainId = await window.ethereum.request({method: "eth_chainId"});
          if (currentChainId !== '0x2105') { // Base mainnet chain ID
              setError('Please switch to Base mainnet to perform this transaction. Click the button below to switch networks.');
              // Store the current action to perform after network switch
              setPendingAction('delegate');
              return;
          }
      } catch (error) {
          console.error('Failed to check chain ID:', error);
          setError('Failed to verify network. Please try again.');
          return;
      }
      
      try {
          setIsDelegating(true);
          setError('');
          setSuccess('');
          
          // Validate amount
          const amount = parseFloat(AmounttoDelegate);
          if (isNaN(amount) || amount <= 0) {
              setError('Please enter a valid amount greater than 0');
              return;
          }
          
          const USDC_Transfer_Contract = new ethers.Contract(chainsConfig[1].tokenContractUSDC_Mainnet, ERC20_ABI, Signer)
          
          const delegate = await USDC_Transfer_Contract.approve(DelegatedAcc, parseUnits(amount.toString(), 6))
          const Recepit = await delegate.wait()
          
          setSuccess(`Delegation successful! Hash: ${Recepit.hash.substring(0,6)}...${Recepit.hash.substring(Recepit.hash.length-4)}`);
          setDelegateHash(Recepit.hash);
          setDelegate('');
          setAmounttoDelegate('');
          
          // Refresh caps after delegation
          if (Provider) getCaps();
      } catch(error){
          let errorMessage = 'Delegation failed';
          
          if (error.code === 'ACTION_REJECTED' || error.message?.includes('user rejected')) {
              errorMessage = 'Transaction was rejected by user';
          } else if (error.code === 'INSUFFICIENT_FUNDS') {
              errorMessage = 'Insufficient funds for transaction';
          } else if (error.message) {
              errorMessage = `Delegation failed: ${error.message}`;
          }
          
          setError(errorMessage);
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

  // Modal management functions
  const openSpendModal = () => setIsSpendModalOpen(true);
  const closeSpendModal = () => setIsSpendModalOpen(false);
  const openDelegateModal = () => setIsDelegateModalOpen(true);
  const closeDelegateModal = () => setIsDelegateModalOpen(false);

  // Close modal when clicking outside
  const handleModalBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
          closeSpendModal();
          closeDelegateModal();
      }
  };

  // Close modal on escape key
  useEffect(() => {
      const handleEscape = (e) => {
          if (e.key === 'Escape') {
              closeSpendModal();
              closeDelegateModal();
          }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
      if (isSpendModalOpen || isDelegateModalOpen) {
          document.body.classList.add('modal-open');
      } else {
          document.body.classList.remove('modal-open');
      }

      return () => {
          document.body.classList.remove('modal-open');
      };
  }, [isSpendModalOpen, isDelegateModalOpen]);

  // Check for Account Change and Check for Connected accounts
  useEffect(()=>{
      const check = async () => {
          try {
              const _Accounts =  await window.ethereum.request({method: "eth_accounts"})
              if(_Accounts.length > 0) { 
                  setAccounts(_Accounts)
                  setIsConnected(true)
                  
                  // Initialize Provider and Signer if not already set
                  if (!Provider) {
                      const _Provider = new ethers.BrowserProvider(window.ethereum);
                      const _Signer = await _Provider.getSigner();
                      setProvider(_Provider);
                      setSigner(_Signer);
                  }
                  
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
          window.ethereum.on('accountsChanged',async (accounts)=> {
              if(accounts.length > 0 ){
                  setAccounts(accounts)
                  
                  // Update Provider and Signer for new account
                  try {
                      const _Provider = new ethers.BrowserProvider(window.ethereum);
                      const _Signer = await _Provider.getSigner();
                      setProvider(_Provider);
                      setSigner(_Signer);
                      
                      if(_Provider) getCaps()
                  } catch (error) {
                      console.error('Failed to update provider/signer:', error);
                      setError('Failed to update wallet connection. Please refresh the page.');
                  }
              } else {
                  setIsConnected(false);
                  setAssignedCaps([]);
                  setProvider(null);
                  setSigner(null);
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
            <div className='header-content'>
                <div className='Logo'>
                    <img src={Logo} id='Logo' alt="DystryCap Logo" />
                </div>
                <div className='connectButton'>
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
                            'Connect'
                        )}
                    </button>
                    {isConnected && Accounts && (
                        <div className="connected-info">
                            <span className="address-display">
                                {`${Accounts[0].substring(0,3)}...${Accounts[0].substring(Accounts[0].length-3)}`}
                            </span>
                            <button 
                                onClick={disconnect} 
                                id='disconnectbtn'
                                className="disconnect-btn"
                                title="Disconnect Wallet"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
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
                {error && error.includes('switch to Base mainnet') && (
                    <div className="error-help">
                        <button 
                            onClick={switchToBaseNetwork}
                            className="network-switch-btn"
                        >
                            🔄 Switch to Base Mainnet
                        </button>
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
                  <h2 className='section_head'>Check Wallet Spending Caps</h2>
                  <hr className='hr'/>
                  
                  {/* Wallet Address Input */}
                  <div className="wallet-input-section">
                      <div className="input-group">
                          <input
                              type="text"
                              placeholder="Enter wallet address (0x...)"
                              value={inputWalletAddress}
                              onChange={(e) => setInputWalletAddress(e.target.value)}
                              className="wallet-address-input"
                          />
                          <button
                              onClick={() => checkWalletCaps(inputWalletAddress)}
                              disabled={isCheckingCaps || !inputWalletAddress}
                              className="check-caps-btn"
                          >
                              {isCheckingCaps ? (
                                  <>
                                      <div className="button-spinner"></div>
                                      Checking...
                                  </>
                              ) : (
                                  'Check Caps'
                              )}
                          </button>
                      </div>
                  </div>

                  {/* Display User Caps */}
                  {userCaps && (
                      <div className="user-caps-display">
                          <h3>Spending Caps for {userCaps.address.substring(0,6)}...{userCaps.address.substring(userCaps.address.length-4)}</h3>
                          <div className="caps-summary">
                              <div className="cap-item">
                                  <span className="cap-label">Total Allowance:</span>
                                  <span className="cap-value">{userCaps.allowance} USDC</span>
                              </div>
                              <div className="cap-item">
                                  <span className="cap-label">Current Balance:</span>
                                  <span className="cap-value">{userCaps.balance} USDC</span>
                              </div>
                              <div className="cap-item">
                                  <span className="cap-label">Remaining to Spend:</span>
                                  <span className="cap-value remaining">{userCaps.remaining} USDC</span>
                              </div>
                          </div>
                          
                          {/* Spending History */}
                          <div className="spending-history">
                              <h4>Recent Spending History</h4>
                              {spendingHistory.length > 0 ? (
                                  <div className="history-list">
                                      {spendingHistory.map((item, index) => (
                                          <div key={index} className="history-item">
                                              <div className="history-details">
                                                  <span className="history-type">{item.type}</span>
                                                  <span className="history-amount">{item.amount} USDC</span>
                                              </div>
                                              <div className="history-meta">
                                                  <span className="history-hash">{item.hash}</span>
                                                  <span className="history-time">
                                                      {new Date(item.timestamp).toLocaleDateString()}
                                                  </span>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <p className="no-history">No spending history found</p>
                              )}
                          </div>
                      </div>
                  )}

                  {/* Original Caps Display (commented out) */}
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
                                  <h3>Base</h3>
                              </div>
                              <div className='capsData'>
                                  <h4>{AssignedCaps[0] ? `${AssignedCaps[0]} USDT` : 'No Spending Cap found'}</h4>
                              </div>
                          </div>
                          <hr/> 
                          {/* <div className='Caps'>
                              <div className = 'CapsHead' >
                                  <img src={Celo} alt="Celo" />
                                  <h3>Celo Alfajores</h3>
                              </div>
                              <div className='capsData'>
                                  <h4>{+AssignedCaps[1] ? `${AssignedCaps[1]} USDT` : 'No Spending Cap found'}</h4>
                              </div>
                          </div> */}
                          {/* <hr/>
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
                          <hr/> */}
                      </div>
                  )}
              </div>
          )}
          
          {/* Action Buttons Section */}
          <div className="action-buttons-section">
              <h2 className='head'>Token Actions</h2>
              <hr className='hr'/>
              
              <div className="action-buttons-grid">
                  <button 
                      className="action-button spend-button"
                      onClick={openSpendModal}
                      disabled={!isConnected}
                  >
                      <div className="action-icon">💸</div>
                      <div className="action-content">
                          <h3>Spend Tokens</h3>
                          <p>Send USDC tokens to another address</p>
                      </div>
                  </button>
                  
                  <button 
                      className="action-button delegate-button"
                      onClick={openDelegateModal}
                      disabled={!isConnected}
                  >
                      <div className="action-icon">🔐</div>
                      <div className="action-content">
                          <h3>Assign Spending Amounts</h3>
                          <p>Delegate spending authority to another address</p>
                      </div>
                  </button>
              </div>
          </div>
        </div>

        {/* Spend Tokens Modal */}
        {isSpendModalOpen && (
            <div className="modal-overlay" onClick={handleModalBackdropClick}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Spend Tokens</h2>
                        <button className="modal-close" onClick={closeSpendModal}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div className="modal-body">
                        <div className='unified-note'>
                            <div className='note-icon'>ℹ️</div>
                            <div className='note-content'>
                                <h5>Network Requirement</h5>
                                <p>You can only spend tokens on Base mainnet. Make sure you are connected to Base network.</p>
                            </div>
                        </div>
                        
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
            </div>
        )}

        {/* Delegate Modal */}
        {isDelegateModalOpen && (
            <div className="modal-overlay" onClick={handleModalBackdropClick}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Assign Spending Amounts</h2>
                        <button className="modal-close" onClick={closeDelegateModal}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div className="modal-body">
                        <div className='unified-note'>
                            <div className='note-icon'>ℹ️</div>
                            <div className='note-content'>
                                <h5>Network Requirement</h5>
                                <p>You can only delegate tokens on Base mainnet. Make sure you are connected to Base network.</p>
                            </div>
                        </div>
                        
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
        )}
    </div>
  )
}

export default Herodash