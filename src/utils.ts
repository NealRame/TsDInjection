import "reflect-metadata"

import {
    ServiceDefaultKey,
    ServiceInjectKey,
    ServiceLifecyclePropertyKey,
} from "./constants"


import {
    ServiceInjectionParametersMap,
    ServiceDefaultParametersMap,
    ServiceLifecycle,
    TConstructor,
} from "./types"

export function getServiceParametersMetadata(service: TConstructor)
    : Array<unknown> {
    return Reflect.getMetadata("design:paramtypes", service) ?? []
}

export function getServiceLifecyle(service: TConstructor)
    : ServiceLifecycle | undefined {
    return Reflect.getMetadata(ServiceLifecyclePropertyKey, service)
}

export function getServiceInjectionParameterMap(service: TConstructor)
    : ServiceInjectionParametersMap {
    if (!Reflect.hasMetadata(ServiceInjectKey, service)) {
        Reflect.defineMetadata(ServiceInjectKey, new Map(), service)
    }
    return Reflect.getMetadata(ServiceInjectKey, service)
}

export function getServiceDefaultParameterMap(service: TConstructor)
    : ServiceDefaultParametersMap {
    if (!Reflect.hasMetadata(ServiceDefaultKey, service)) {
        Reflect.defineMetadata(ServiceDefaultKey, new Map(), service)
    }
    return Reflect.getMetadata(ServiceDefaultKey, service)
}
