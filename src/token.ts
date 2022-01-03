/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Service token are used to alias registered service.
 */
export class ServiceToken<T = any> {
    constructor(public name: string) {}
}
