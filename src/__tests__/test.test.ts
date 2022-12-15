import APIAdapter from '../api/APIAdapter'
import SimAPI from '../api/sim/SimAPI'

describe('Test of tests', () => {
    const simAPI = new SimAPI()
    const api = new APIAdapter(simAPI)

    console.log('test', api.citeQuest('test', 'test'))

    it('Returns Boo 25', () => {
        console.log(api)
        const str = 'Boo 25'
        expect(str).toBe('Boo 25')
    })
})
