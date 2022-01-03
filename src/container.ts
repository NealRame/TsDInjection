import "reflect-metadata"

import {
    getServiceDefaultParameterMap,
    getServiceInjectionParameterMap,
    getServiceLifecyle,
} from "./decorators"

import {
    ServiceAliasUndefined,
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

    private injectTransient_(service: TConstructor, args: Array<unknown>) {
        return Reflect.construct(service, args)
    }

    private injectSingleton_(service: TConstructor, args: Array<unknown>) {
        if (!this.singletons_.has(service)) {
            this.singletons_.set(service, this.injectTransient_(service, args))
        }
        return this.singletons_.get(service)
    }

    private injectServiceParameters_(service: TConstructor) {
        const parametersMeta = Reflect.getMetadata("design:paramtypes", service)
        const injectedParamsMap = getServiceInjectionParameterMap(service)
        const defaultParamsMap = getServiceDefaultParameterMap(service)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (parametersMeta ?? []).map((type: any, index: number) => {
            if (injectedParamsMap.has(index)) {
                return this.get(injectedParamsMap.get(index) as TConstructor)
            }
            if (defaultParamsMap.has(index)) {
                return defaultParamsMap.get(index)
            }
            return type()
        })
    }

    alias<T>(token: ServiceToken<T>, service: TConstructor<T>)
        : this {
        this.aliases_.set(token, service)
        return this
    }

    get<T>(service: ServiceIdentifier<T>)
        : T {
        if (service instanceof ServiceToken) {
            if (this.aliases_.has(service)) {
                return this.get(this.aliases_.get(service) as TConstructor<T>)
            }
            throw new ServiceAliasUndefined(service)
        }
        const params = this.injectServiceParameters_(service)
        return (getServiceLifecyle(service) === ServiceLifecycle.Singleton
            ? this.injectSingleton_(service, params)
            : this.injectTransient_(service, params)) as T
    }
}
