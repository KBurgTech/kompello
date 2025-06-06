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
 * @interface PatchedUuidList
 */
export interface PatchedUuidList {
    /**
     * 
     * @type {Array<string>}
     * @memberof PatchedUuidList
     */
    uuids?: Array<string>;
}

/**
 * Check if a given object implements the PatchedUuidList interface.
 */
export function instanceOfPatchedUuidList(value: object): value is PatchedUuidList {
    return true;
}

export function PatchedUuidListFromJSON(json: any): PatchedUuidList {
    return PatchedUuidListFromJSONTyped(json, false);
}

export function PatchedUuidListFromJSONTyped(json: any, ignoreDiscriminator: boolean): PatchedUuidList {
    if (json == null) {
        return json;
    }
    return {
        
        'uuids': json['uuids'] == null ? undefined : json['uuids'],
    };
}

export function PatchedUuidListToJSON(json: any): PatchedUuidList {
    return PatchedUuidListToJSONTyped(json, false);
}

export function PatchedUuidListToJSONTyped(value?: PatchedUuidList | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'uuids': value['uuids'],
    };
}

