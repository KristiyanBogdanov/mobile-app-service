import { IsBoolean, IsMongoId } from 'class-validator';

export class RespondToInvitationReq {
    @IsMongoId()
    locationId: string;

    @IsBoolean()
    accepted: boolean;
}