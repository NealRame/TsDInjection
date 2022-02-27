import { expect } from "chai"

import { Service } from "../../injector/decorators"

describe("@Service", () => {
    it("return a decorator", () => {
        expect(Service()).to.be.a("function")
    })
})
