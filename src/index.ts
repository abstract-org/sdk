import APIAdapter from './api/APIAdapter'
import SimAPI from './api/sim/SimAPI'
import Web3API from './api/web3/Web3API'

const simAPI = new SimAPI()
const web3API = new Web3API()

let api
if (process.env.API_TYPE === 'sim') {
    api = new APIAdapter(simAPI)
} else {
    api = new APIAdapter(web3API)
}

export default api
