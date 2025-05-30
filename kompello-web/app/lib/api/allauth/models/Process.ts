/* tslint:disable */
/* eslint-disable */
/**
 * django-allauth: Headless API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1
 * Contact: info@allauth.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
 * The process to be executed when the user successfully
 * authenticates. When set to `login`, the user will be logged into the
 * account to which the provider account is connected, or if no such
 * account exists, a signup will occur. If set to `connect`, the provider
 * account will be connected to the list of provider accounts for the
 * currently authenticated user.
 * 
 * @export
 */
export const Process = {
    Login: 'login',
    Connect: 'connect'
} as const;
export type Process = typeof Process[keyof typeof Process];


export function instanceOfProcess(value: any): boolean {
    for (const key in Process) {
        if (Object.prototype.hasOwnProperty.call(Process, key)) {
            if (Process[key as keyof typeof Process] === value) {
                return true;
            }
        }
    }
    return false;
}

export function ProcessFromJSON(json: any): Process {
    return ProcessFromJSONTyped(json, false);
}

export function ProcessFromJSONTyped(json: any, ignoreDiscriminator: boolean): Process {
    return json as Process;
}

export function ProcessToJSON(value?: Process | null): any {
    return value as any;
}

export function ProcessToJSONTyped(value: any, ignoreDiscriminator: boolean): Process {
    return value as Process;
}

