// https://docs.metamask.io/guide/ethereum-provider.html#table-of-contents
import PubSub from 'pubsub-js'
import { METAMASK_START, METAMASK_ACCOUNTS_CHANGED } from '../../globals/topics'

/*****************************************/
/* Detect the MetaMask Ethereum provider */
/*****************************************/

import detectEthereumProvider from '@metamask/detect-provider'

// this returns the provider, or null if it wasn't detected
const provider = await detectEthereumProvider()

const initApp = (provider) => {
    // If the provider returned by detectEthereumProvider is not the same as
    // window.ethereum, something is overwriting it, perhaps another wallet.
    const _provider = provider

    function startApp() {
        if (_provider !== window.ethereum) {
            console.error('Do you have multiple wallets installed?')
            return false
        }

        // Access the decentralized web!
        return _provider
    }

    return startApp
}

export const startApp = initApp(provider)

/**********************************************************/
/* Handle chain (network) and chainChanged (per EIP-1193) */
/**********************************************************/

const chainId = await window.ethereum.request({ method: 'eth_chainId' })
handleChainChanged(chainId)

window.ethereum.on('chainChanged', handleChainChanged)

function handleChainChanged(_chainId) {
    // We recommend reloading the page, unless you must do otherwise
    window.location.reload()
}

/***********************************************************/
/* Handle user accounts and accountsChanged (per EIP-1193) */
/***********************************************************/

let currentAccount = null
window.ethereum
    .request({ method: 'eth_accounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
        // Some unexpected error.
        // For backwards compatibility reasons, if no accounts are available,
        // eth_accounts will return an empty array.
        console.error(err)
    })

// Note that this event is emitted on page load.
// If the array of accounts is non-empty, you're already
// connected.
window.ethereum.on('accountsChanged', handleAccountsChanged)

// For now, 'eth_accounts' will continue to always return an array
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        console.log('Please connect to MetaMask.')
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0]
        // Do any other work!
        PubSub.publish(METAMASK_ACCOUNTS_CHANGED, currentAccount)
    }
}

/*********************************************/
/* Access the user's accounts (per EIP-1102) */
/*********************************************/

// You should only attempt to request the user's accounts in response to user
// interaction, such as a button click.
// Otherwise, you popup-spam the user like it's 1999.
// If you fail to retrieve the user's account(s), you should encourage the user
// to initiate the attempt.
const connectBtn = document.getElementById('connectButton')
connectBtn.addEventListener('click', () => {
    connect()
})

// While you are awaiting the call to eth_requestAccounts, you should disable
// any buttons the user can click to initiate the request.
// MetaMask will reject any additional requests while the first is still
// pending.
function connect() {
    window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(handleAccountsChanged)
        .catch((err) => {
            if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log('Please connect to MetaMask.')
            } else {
                console.error(err)
            }
        })
}
