/* tslint:disable */
/* eslint-disable */
/**
 * Kompello Server API
 * Kompello API Documentation
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface Csrf
 */
export interface Csrf {
    /**
     * 
     * @type {string}
     * @memberof Csrf
     */
    csrfToken: string;
}

/**
 * Check if a given object implements the Csrf interface.
 */
export function instanceOfCsrf(value: object): value is Csrf {
    if (!('csrfToken' in value) || value['csrfToken'] === undefined) return false;
    return true;
}

export function CsrfFromJSON(json: any): Csrf {
    return CsrfFromJSONTyped(json, false);
}

export function CsrfFromJSONTyped(json: any, ignoreDiscriminator: boolean): Csrf {
    if (json == null) {
        return json;
    }
    return {
        
        'csrfToken': json['csrfToken'],
    };
}

export function CsrfToJSON(json: any): Csrf {
    return CsrfToJSONTyped(json, false);
}

export function CsrfToJSONTyped(value?: Csrf | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'csrfToken': value['csrfToken'],
    };
}

