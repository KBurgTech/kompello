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
 * @interface SensitiveRecoveryCodesAuthenticator
 */
export interface SensitiveRecoveryCodesAuthenticator {
    /**
     * An epoch based timestamp (trivial to parse using: `new Date(value)*1000`)
     * 
     * @type {number}
     * @memberof SensitiveRecoveryCodesAuthenticator
     */
    lastUsedAt: number;
    /**
     * An epoch based timestamp (trivial to parse using: `new Date(value)*1000`)
     * 
     * @type {number}
     * @memberof SensitiveRecoveryCodesAuthenticator
     */
    createdAt: number;
    /**
     * The authenticator type.
     * 
     * @type {string}
     * @memberof SensitiveRecoveryCodesAuthenticator
     */
    type: SensitiveRecoveryCodesAuthenticatorTypeEnum;
    /**
     * The total number of recovery codes that initially were available.
     * 
     * @type {number}
     * @memberof SensitiveRecoveryCodesAuthenticator
     */
    totalCodeCount: number;
    /**
     * The number of recovery codes that are unused.
     * 
     * @type {number}
     * @memberof SensitiveRecoveryCodesAuthenticator
     */
    unusedCodeCount: number;
    /**
     * The list of unused codes.
     * 
     * @type {Array<string>}
     * @memberof SensitiveRecoveryCodesAuthenticator
     */
    unusedCodes: Array<string>;
}


/**
 * @export
 */
export const SensitiveRecoveryCodesAuthenticatorTypeEnum = {
    RecoveryCodes: 'recovery_codes'
} as const;
export type SensitiveRecoveryCodesAuthenticatorTypeEnum = typeof SensitiveRecoveryCodesAuthenticatorTypeEnum[keyof typeof SensitiveRecoveryCodesAuthenticatorTypeEnum];


/**
 * Check if a given object implements the SensitiveRecoveryCodesAuthenticator interface.
 */
export function instanceOfSensitiveRecoveryCodesAuthenticator(value: object): value is SensitiveRecoveryCodesAuthenticator {
    if (!('lastUsedAt' in value) || value['lastUsedAt'] === undefined) return false;
    if (!('createdAt' in value) || value['createdAt'] === undefined) return false;
    if (!('type' in value) || value['type'] === undefined) return false;
    if (!('totalCodeCount' in value) || value['totalCodeCount'] === undefined) return false;
    if (!('unusedCodeCount' in value) || value['unusedCodeCount'] === undefined) return false;
    if (!('unusedCodes' in value) || value['unusedCodes'] === undefined) return false;
    return true;
}

export function SensitiveRecoveryCodesAuthenticatorFromJSON(json: any): SensitiveRecoveryCodesAuthenticator {
    return SensitiveRecoveryCodesAuthenticatorFromJSONTyped(json, false);
}

export function SensitiveRecoveryCodesAuthenticatorFromJSONTyped(json: any, ignoreDiscriminator: boolean): SensitiveRecoveryCodesAuthenticator {
    if (json == null) {
        return json;
    }
    return {
        
        'lastUsedAt': json['last_used_at'],
        'createdAt': json['created_at'],
        'type': json['type'],
        'totalCodeCount': json['total_code_count'],
        'unusedCodeCount': json['unused_code_count'],
        'unusedCodes': json['unused_codes'],
    };
}

export function SensitiveRecoveryCodesAuthenticatorToJSON(json: any): SensitiveRecoveryCodesAuthenticator {
    return SensitiveRecoveryCodesAuthenticatorToJSONTyped(json, false);
}

export function SensitiveRecoveryCodesAuthenticatorToJSONTyped(value?: SensitiveRecoveryCodesAuthenticator | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'last_used_at': value['lastUsedAt'],
        'created_at': value['createdAt'],
        'type': value['type'],
        'total_code_count': value['totalCodeCount'],
        'unused_code_count': value['unusedCodeCount'],
        'unused_codes': value['unusedCodes'],
    };
}

