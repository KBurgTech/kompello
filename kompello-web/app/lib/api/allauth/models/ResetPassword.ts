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
 * @interface ResetPassword
 */
export interface ResetPassword {
    /**
     * The password reset key
     * @type {string}
     * @memberof ResetPassword
     */
    key: string;
    /**
     * The password.
     * 
     * @type {string}
     * @memberof ResetPassword
     */
    password: string;
}

/**
 * Check if a given object implements the ResetPassword interface.
 */
export function instanceOfResetPassword(value: object): value is ResetPassword {
    if (!('key' in value) || value['key'] === undefined) return false;
    if (!('password' in value) || value['password'] === undefined) return false;
    return true;
}

export function ResetPasswordFromJSON(json: any): ResetPassword {
    return ResetPasswordFromJSONTyped(json, false);
}

export function ResetPasswordFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResetPassword {
    if (json == null) {
        return json;
    }
    return {
        
        'key': json['key'],
        'password': json['password'],
    };
}

export function ResetPasswordToJSON(json: any): ResetPassword {
    return ResetPasswordToJSONTyped(json, false);
}

export function ResetPasswordToJSONTyped(value?: ResetPassword | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'key': value['key'],
        'password': value['password'],
    };
}

