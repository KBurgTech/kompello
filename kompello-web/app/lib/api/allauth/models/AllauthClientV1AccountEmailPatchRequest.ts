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
 * @interface AllauthClientV1AccountEmailPatchRequest
 */
export interface AllauthClientV1AccountEmailPatchRequest {
    /**
     * An email address.
     * 
     * @type {string}
     * @memberof AllauthClientV1AccountEmailPatchRequest
     */
    email: string;
    /**
     * Primary flag.
     * 
     * @type {boolean}
     * @memberof AllauthClientV1AccountEmailPatchRequest
     */
    primary: boolean;
}

/**
 * Check if a given object implements the AllauthClientV1AccountEmailPatchRequest interface.
 */
export function instanceOfAllauthClientV1AccountEmailPatchRequest(value: object): value is AllauthClientV1AccountEmailPatchRequest {
    if (!('email' in value) || value['email'] === undefined) return false;
    if (!('primary' in value) || value['primary'] === undefined) return false;
    return true;
}

export function AllauthClientV1AccountEmailPatchRequestFromJSON(json: any): AllauthClientV1AccountEmailPatchRequest {
    return AllauthClientV1AccountEmailPatchRequestFromJSONTyped(json, false);
}

export function AllauthClientV1AccountEmailPatchRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): AllauthClientV1AccountEmailPatchRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'email': json['email'],
        'primary': json['primary'],
    };
}

export function AllauthClientV1AccountEmailPatchRequestToJSON(json: any): AllauthClientV1AccountEmailPatchRequest {
    return AllauthClientV1AccountEmailPatchRequestToJSONTyped(json, false);
}

export function AllauthClientV1AccountEmailPatchRequestToJSONTyped(value?: AllauthClientV1AccountEmailPatchRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'email': value['email'],
        'primary': value['primary'],
    };
}

