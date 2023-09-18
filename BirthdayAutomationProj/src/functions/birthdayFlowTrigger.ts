import { app, InvocationContext, Timer } from "@azure/functions";

export async function birthdayFlowTrigger(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer trigger was triggered.')
}

app.timer('birthdayFlowTrigger', {
    schedule: '0 */1 * * * *',
    handler: birthdayFlowTrigger
});
