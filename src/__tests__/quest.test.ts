import sha256 from 'crypto-js/sha256'
import Hex from 'crypto-js/enc-hex'
import { Quest } from '../modules'

describe('Modules/Quest', () => {
    describe('makeHash', () => {
        const name = 'Quest name'
        const kind = 'TITLE'
        const content = 'The title of the article'

        it('should generate hash from kind and content', () => {
            const expectedHash = Hex.stringify(sha256(`${kind}${content}`))
            const result = Quest.makeHash({ kind, content })

            expect(result).toEqual(expectedHash)
        })

        it('should generate hash from name', () => {
            const expectedHash = Hex.stringify(sha256(name))
            const result = Quest.makeHash({ name })

            expect(result).toEqual(expectedHash)
        })

        it('should generate hash from kind and content even if name is provided', () => {
            const expectedHash = Hex.stringify(sha256(`${kind}${content}`))
            const result = Quest.makeHash({ name, kind, content })

            expect(result).toEqual(expectedHash)
        })

        it('should throw error when kind and content are not provided', () => {
            expect(() => Quest.makeHash({})).toThrowError(
                "Couldn't generate hash. Provide kind and content, or name"
            )
        })

        it('should throw error when only kind is provided', () => {
            const kind = 'TITLE'

            expect(() => Quest.makeHash({ kind })).toThrowError(
                "Couldn't generate hash. Provide kind and content, or name"
            )
        })

        it('should throw error when only content is provided', () => {
            const content = 'The title of the article'

            expect(() => Quest.makeHash({ content })).toThrowError(
                "Couldn't generate hash. Provide kind and content, or name"
            )
        })
    })
})
