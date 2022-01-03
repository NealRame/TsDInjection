// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TConstructor<T = any> {
    new(...args: Array<never>): T
}

export type ServiceToken = string
export type ServiceInjectionParametersMap = Map<number, TConstructor | ServiceToken>
export type ServiceDefaultParametersMap = Map<number, unknown>

export enum ServiceLifecycle {
    Singleton,
    Transient,
}
