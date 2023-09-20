import { app, InvocationContext, Timer } from "@azure/functions";
import {getAdUsersAndBirthdays} from '../helpers/getUsersBirthday'
import {postUsersBirthday} from '../helpers/postUsersBirthday'
import { isBirthdayToday } from "../helpers/isBirthdayToday";

export async function birthdayFlowTrigger(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer trigger was triggered.');
    const adUsers = await getAdUsersAndBirthdays(context);
    const usersWithBirthday = adUsers.filter(adUser => isBirthdayToday(adUser.birthday));
    if (usersWithBirthday.length > 0) {
        for (const user of usersWithBirthday) context.log(`User with email - ${user.email} has birthday today - ${user.birthday}`);
        const postBirthday = await postUsersBirthday(context, usersWithBirthday);
    } else {
        context.log('No birthdays found for today...')
    }
}

app.timer('birthdayFlowTrigger', {
    schedule: '0 0 9 * * *',
    handler: birthdayFlowTrigger
});
