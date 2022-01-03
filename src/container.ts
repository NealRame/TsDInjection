import "reflect-metadata"

import { isNil } from "lodash"

import {
    getServiceParametersMetadata,
    getServiceDefaultParameterMap,
    getServiceInjectionParameterMap,
    getServiceLifecyle,
} from "./decorators"

import {
    ServiceAliasUndefined,
    ServiceNotFoundError,
} from "./errors"

import {
    ServiceToken,
} from "./token"

import {
    TConstructor,
    ServiceIdentifier,
    ServiceLifecycle,
} from "./types"

export class Container {
    private aliases_ = new Map<ServiceToken, TConstructor>()
    private singletons_ = new Map<TConstructor, unknown>()

    private injectServiceParameters_(service: TConstructor) {
        const parametersMeta = getServiceParametersMetadata(service)
        const injectedParamsMap = getServiceInjectionParameterMap(service)
        const defaultParamsMap = getServiceDefaultParameterMap(service)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return parametersMeta.map((type: any, index: number) => {
            if (injectedParamsMap.has(index)) {
                return this.get(injectedParamsMap.get(index) as TConstructor)
            }
            if (defaultParamsMap.has(index)) {
                return defaultParamsMap.get(index)
            }
            return type()
        })
    }

    private injectTransient_(service: TConstructor) {
        const params = this.injectServiceParameters_(service)
        return Reflect.construct(service, params)
    }

    private injectSingleton_(service: TConstructor) {
        if (!this.singletons_.has(service)) {
            this.singletons_.set(service, this.injectTransient_(service))
        }
        return this.singletons_.get(service)
    }

    private injectClassService_<T>(service: TConstructor<T>)
        : T {
        const lifecycle = getServiceLifecyle(service)
        if (isNil(lifecycle)) {
            throw new ServiceNotFoundError(service)
        }
        return (lifecycle === ServiceLifecycle.Singleton
            ? this.injectSingleton_(service)
            : this.injectTransient_(service)
        ) as T
    }

    private injectAliasedService_<T>(service: ServiceToken<T>)
        : T {
        const classService = this.aliases_.get(service)
        if (isNil(classService)) {
            throw new ServiceAliasUndefined(service)
        }
        return this.injectClassService_(classService as TConstructor<T>)
    }

    alias<T>(token: ServiceToken<T>, service: TConstructor<T>)
        : this {
        this.aliases_.set(token, service)
        return this
    }

    get<T>(service: ServiceIdentifier<T>)
        : T {
        return service instanceof ServiceToken
            ? this.injectAliasedService_(service)
            : this.injectClassService_(service)
    }
}
