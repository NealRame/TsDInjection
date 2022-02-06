/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Token are used to alias registered service or set value into a container.
 */
 export class Token<T = any> {
    constructor(private name_: string) {}

    get name(): string {
        return this.name_
    }
}
