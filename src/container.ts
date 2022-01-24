import "reflect-metadata"

import { isNil } from "lodash"

import {
    ContainerInternalError,
    ServiceAliasOrValueUndefined,
    ServiceNotFoundError,
} from "./errors"

import {
    Token,
} from "./token"

import {
    TConstructor,
    ServiceIdentifier,
    ServiceLifecycle,
} from "./types"

import {
    getServiceDefaultParameterMap,
    getServiceInjectionParameterMap,
    getServiceMetadata,
    getServiceParametersMetadata,
    isService,
} from "./utils"

export class Container {
    private aliases_ = new WeakMap<Token, TConstructor>()
    private values_ = new WeakMap<Token, unknown>()
    private singletons_ = new WeakMap<TConstructor, unknown>()

    private injectServiceParameters_(service: TConstructor) {
        const parametersMeta = getServiceParametersMetadata(service)
        const injectedParamsMap = getServiceInjectionParameterMap(service)
        const defaultParamsMap = getServiceDefaultParameterMap(service)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return parametersMeta.map((type: any, index: number) => {
            if (injectedParamsMap.has(index)) {
                return this.get(injectedParamsMap.get(index) as ServiceIdentifier)
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
        const metadata = getServiceMetadata(service)
        if (isNil(metadata)) {
            throw new ServiceNotFoundError(service)
        }
        return (metadata.lifecycle === ServiceLifecycle.Singleton
            ? this.injectSingleton_(service)
            : this.injectTransient_(service)
        ) as T
    }

    private injectAliasedService_<T>(service: Token<T>)
        : T {
        const classService = this.aliases_.get(service)
        if (isNil(classService)) {
            throw new ContainerInternalError()
        }
        return this.injectClassService_(classService as TConstructor<T>)
    }

    set<T>(token: Token<T>, value: T | TConstructor<T>)
        : this {
        if (typeof value === "function" && isService(value)) {
            this.aliases_.set(token, value as TConstructor<T>)
        } else {
            this.values_.set(token, value)
        }
        return this
    }

    get<T>(id: ServiceIdentifier<T>)
        : T {
        if (id instanceof Token) {
            if (this.values_.has(id)) {
                return this.values_.get(id) as T
            }
            if (this.aliases_.has(id)) {
                return this.injectAliasedService_(id)
            }
            throw new ServiceAliasOrValueUndefined(id)
        }
        return this.injectClassService_(id)
    }
}
