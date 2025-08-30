

export const chainsConfig = [
    {
        chainId: '0x14a34',
        chainName: 'Base Sepolia Testnet',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls:['https://sepolia.base.org'],
        blockExplorerUrls:['https://base-sepolia.blockscout.com/'],
        tokenContractUSDC_Testnet:'0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        tokenContractUSDC_Mainnet:'	0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        assignedCap:{}
    },

   {  
        chainId: '0xaef3',
        chainName: 'Celo Alfajores Testnet',
        nativeCurrency: {
            name: 'CELO',
            symbol: 'CELO',
            decimals: 18
        },
        rpcUrls:['https://alfajores-forno.celo-testnet.org'],
        blockExplorerUrls:['https://alfajores.celoscan.io'],
        tokenContractUSDC_Testnet:'0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B',
        tokenContractUSDC_Mainnet:'0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
        assignedCap:{}
    },
        
    {
         chainId: '0xaa36a7',
        chainName: 'Sepolia',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls:['https://rpc.therpc.io/ethereum-sepolia'],
        blockExplorerUrls:['https://sepolia.etherscan.io/'],
        tokenContractUSDC_Testnet:'0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        tokenContractUSDC_Mainnet:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        assignedCap:{}
    },

    {
         chainId: '0x66eee',
        chainName: 'Arbitrum Sepolia',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls:['https://arbitrum-sepolia.drpc.org'],
        blockExplorerUrls:['https://sepolia.arbiscan.io/','https://arbitrum-sepolia.blockscout.com/'],
        tokenContractUSDC_Testnet:'0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
        tokenContractUSDC_Mainnet:'0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        assignedCap:{}
    },

    {
        chainId: '0xaa37dc',
        chainName: 'OP Georli Testnet',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls:['https://sepolia.optimism.io'],
        blockExplorerUrls:['https://sepolia-optimism.etherscan.io/'],
        tokenContractUSDC_Testnet:'0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
        tokenContractUSDC_Mainnet:'0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        assignedCap:{}
    },

    {
        chainId: '0x515',
        chainName: 'Unichain Sepolia Testnet',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls:['https://sepolia.unichain.org'],
        blockExplorerUrls:['https://unichain-sepolia.blockscout.com/'],
        tokenContractUSDC_Testnet:'0x31d0220469e10c4E71834a79b1f276d740d3768F',
        tokenContractUSDC_Mainnet:'0x078D782b760474a361dDA0AF3839290b0EF57AD6',
        assignedCap:{}
    }
]


export const ERC20_ABI =  [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
]