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
 * @interface AllauthClientV1AuthWebauthnSignupPutRequest
 */
export interface AllauthClientV1AuthWebauthnSignupPutRequest {
    /**
     * 
     * @type {string}
     * @memberof AllauthClientV1AuthWebauthnSignupPutRequest
     */
    name?: string;
    /**
     * 
     * @type {object}
     * @memberof AllauthClientV1AuthWebauthnSignupPutRequest
     */
    credential: object;
}

/**
 * Check if a given object implements the AllauthClientV1AuthWebauthnSignupPutRequest interface.
 */
export function instanceOfAllauthClientV1AuthWebauthnSignupPutRequest(value: object): value is AllauthClientV1AuthWebauthnSignupPutRequest {
    if (!('credential' in value) || value['credential'] === undefined) return false;
    return true;
}

export function AllauthClientV1AuthWebauthnSignupPutRequestFromJSON(json: any): AllauthClientV1AuthWebauthnSignupPutRequest {
    return AllauthClientV1AuthWebauthnSignupPutRequestFromJSONTyped(json, false);
}

export function AllauthClientV1AuthWebauthnSignupPutRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): AllauthClientV1AuthWebauthnSignupPutRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'] == null ? undefined : json['name'],
        'credential': json['credential'],
    };
}

export function AllauthClientV1AuthWebauthnSignupPutRequestToJSON(json: any): AllauthClientV1AuthWebauthnSignupPutRequest {
    return AllauthClientV1AuthWebauthnSignupPutRequestToJSONTyped(json, false);
}

export function AllauthClientV1AuthWebauthnSignupPutRequestToJSONTyped(value?: AllauthClientV1AuthWebauthnSignupPutRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
        'credential': value['credential'],
    };
}

