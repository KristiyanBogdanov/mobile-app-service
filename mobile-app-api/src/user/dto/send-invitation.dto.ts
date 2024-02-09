import { IsEmail, IsMongoId } from 'class-validator';

export class SendInvitationReq {
    @IsMongoId()
    locationId: string;

    @IsEmail()
    invitedUserEmail: string;
}