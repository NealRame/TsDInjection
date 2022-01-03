import "reflect-metadata"

import {
    ServiceAliasUndefined,
} from "./errors"

import {
    TConstructor,
    ServiceToken,
    ServiceLifecycle,
} from "./types"

import {
    getServiceDefaultParameterMap,
    getServiceInjectionParameterMap,
    getServiceLifecyle,
} from "./decorators"

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

    alias(token: ServiceToken, service: TConstructor)
        : this {
        this.aliases_.set(token, service)
        return this
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get<T = any>(service: TConstructor<T> | ServiceToken)
        : T {
        if (typeof service === "string") {
            if (this.aliases_.has(service)) {
                return this.get(this.aliases_.get(service) as TConstructor)
            }
            throw new ServiceAliasUndefined(service)
        }
        const params = this.injectServiceParameters_(service)
        return (getServiceLifecyle(service) === ServiceLifecycle.Singleton
            ? this.injectSingleton_(service, params)
            : this.injectTransient_(service, params)) as T
    }
}
