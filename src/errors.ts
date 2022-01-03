import {
    ServiceToken,
} from "./token"

import {
    TConstructor,
} from "./types"

/**
 * Thrown when requested service was not found.
 */
export class ServiceNotFoundError extends Error {
    public name = "ServiceNotFoundError"

    constructor(
        private service_: TConstructor,
    ) { super() }

    get message()
        : string {
        return (
            `Service "${this.service_.name}" was not found.`
            + " Register it before usage using the '@Service()' decorator."
        )
    }
}

/**
 * Thrown when requested alias was not found.
 */
export class ServiceAliasUndefined extends Error {
    public name = "ServiceNotFoundError"

    constructor(
        private token_: ServiceToken,
    ) { super() }

    get message()
        : string {
        return (
            `Service alias "${this.token_.name}" is undefined in the container.`
            + " Register it before usage by calling 'Container.alias' method."
        )
    }
}
