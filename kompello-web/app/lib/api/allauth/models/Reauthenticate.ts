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

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface Reauthenticate
 */
export interface Reauthenticate {
    /**
     * The password.
     * 
     * @type {string}
     * @memberof Reauthenticate
     */
    password: string;
}

/**
 * Check if a given object implements the Reauthenticate interface.
 */
export function instanceOfReauthenticate(value: object): value is Reauthenticate {
    if (!('password' in value) || value['password'] === undefined) return false;
    return true;
}

export function ReauthenticateFromJSON(json: any): Reauthenticate {
    return ReauthenticateFromJSONTyped(json, false);
}

export function ReauthenticateFromJSONTyped(json: any, ignoreDiscriminator: boolean): Reauthenticate {
    if (json == null) {
        return json;
    }
    return {
        
        'password': json['password'],
    };
}

export function ReauthenticateToJSON(json: any): Reauthenticate {
    return ReauthenticateToJSONTyped(json, false);
}

export function ReauthenticateToJSONTyped(value?: Reauthenticate | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'password': value['password'],
    };
}

