import { IsEmail, IsMongoId } from 'class-validator';

export class SendInvitationReq {
    @IsMongoId()
    readonly locationId: string;

    @IsEmail()
    readonly invitedUserEmail: string;
}