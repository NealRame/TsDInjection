import { ServiceToken } from "./token"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TConstructor<T = any> {
    new(...args: Array<never>): T
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServiceIdentifier<T = any> = TConstructor<T> | ServiceToken<T>

export type ServiceInjectionParametersMap = Map<number, ServiceIdentifier>
export type ServiceDefaultParametersMap = Map<number, unknown>

export enum ServiceLifecycle {
    Singleton,
    Transient,
}

export interface ServiceMetadata {
    lifecycle: ServiceLifecycle
}
