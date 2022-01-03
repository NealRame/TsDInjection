import "reflect-metadata"

import {
    ServiceLifecyclePropertyKey,
} from "./constants"


import {
    ServiceIdentifier,
    ServiceLifecycle,
} from "./types"

import {
    getServiceDefaultParameterMap,
    getServiceInjectionParameterMap,
} from "./utils"

export function Service(lifecycle: ServiceLifecycle)
    : ClassDecorator {
    return Reflect.metadata(ServiceLifecyclePropertyKey, lifecycle)
}

export function Inject(service: ServiceIdentifier)
    : ParameterDecorator {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any, _: any, parameterIndex: number) => {
        const paramsMap = getServiceInjectionParameterMap(target)
        paramsMap.set(parameterIndex, service)
    }
}

export function Default(value: boolean | number | string | symbol)
    : ParameterDecorator {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any, _: any, parameterIndex: number) => {
        const paramsMap = getServiceDefaultParameterMap(target)
        paramsMap.set(parameterIndex, value)
    }
}
