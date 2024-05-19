import { IsStrongPasswordOptions } from 'class-validator';

export const LOCATION_NAME_MIN_LENGTH = 3;
export const LOCATION_NAME_MAX_LENGTH = 25;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const STRONG_PASSWORD_OPTIONS: IsStrongPasswordOptions = {
    minLength: 8,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 0
};
export const PASSWORD_MAX_LENGTH = 128;

export const INACTIVE_DEVICE_NOTIFICATION_TITLE = 'Inactive device';
export const DEVICE_STATE_REPORT_NOTIFICATION_TITLE = 'Device state report';
export const INVITATION_NOTIFICATION_TITLE = 'Invitation to location';
export function getInvitationNotificationMessage(locationName: string, ownerName: string): string {
    return `${ownerName} has invited you to join the location ${locationName}`;
}

export const PUBLICATION_TITLE_MIN_LENGTH = 3;
export const PUBLICATION_TITLE_MAX_LENGTH = 50;

export const MARKETPLACE_PAGINATION_LIMIT = 20;

export const PUBLICATIONS_FETCH_CACHE_TTL = 60 * 60; // seconds
export const PUBLICATIONS_FETCH_CACHE_PREFIX = 'publicationsFetch';