import { expect } from "chai"

import { Token } from "../../injector/token"

describe("Token", () => {
    it("has a name property", () => {
        const token = new Token("token_name")
        expect(token.name).to.equal("token_name")
    })
})

describe("Token#isToken", () => {
    it("return true if given parameter is a Token", () => {
        const token = new Token("token_name")
        expect(Token.isToken(token)).to.be.true
    })
    it("return false if given parameter is not a Token", () => {
        const obj = {}
        expect(Token.isToken(obj)).to.be.false
    })
})