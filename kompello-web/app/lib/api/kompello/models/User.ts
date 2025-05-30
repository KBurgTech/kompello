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
 * @interface User
 */
export interface User {
    /**
     * 
     * @type {string}
     * @memberof User
     */
    readonly uuid: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    firstName?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    lastName?: string;
    /**
     * Designates whether this user should be treated as active. Unselect this instead of deleting accounts.
     * @type {boolean}
     * @memberof User
     */
    isActive?: boolean;
    /**
     * 
     * @type {Date}
     * @memberof User
     */
    readonly createdOn: Date;
    /**
     * 
     * @type {Date}
     * @memberof User
     */
    readonly modifiedOn: Date;
}

/**
 * Check if a given object implements the User interface.
 */
export function instanceOfUser(value: object): value is User {
    if (!('uuid' in value) || value['uuid'] === undefined) return false;
    if (!('email' in value) || value['email'] === undefined) return false;
    if (!('createdOn' in value) || value['createdOn'] === undefined) return false;
    if (!('modifiedOn' in value) || value['modifiedOn'] === undefined) return false;
    return true;
}

export function UserFromJSON(json: any): User {
    return UserFromJSONTyped(json, false);
}

export function UserFromJSONTyped(json: any, ignoreDiscriminator: boolean): User {
    if (json == null) {
        return json;
    }
    return {
        
        'uuid': json['uuid'],
        'email': json['email'],
        'firstName': json['first_name'] == null ? undefined : json['first_name'],
        'lastName': json['last_name'] == null ? undefined : json['last_name'],
        'isActive': json['is_active'] == null ? undefined : json['is_active'],
        'createdOn': (new Date(json['created_on'])),
        'modifiedOn': (new Date(json['modified_on'])),
    };
}

export function UserToJSON(json: any): User {
    return UserToJSONTyped(json, false);
}

export function UserToJSONTyped(value?: Omit<User, 'uuid'|'created_on'|'modified_on'> | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'email': value['email'],
        'first_name': value['firstName'],
        'last_name': value['lastName'],
        'is_active': value['isActive'],
    };
}

