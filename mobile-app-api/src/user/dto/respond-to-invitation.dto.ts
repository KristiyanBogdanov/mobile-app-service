import { IsBoolean } from 'class-validator';

export class RespondToInvitationReq {
    @IsBoolean()
    readonly accepted: boolean;
}