import { InvocationContext } from "@azure/functions";
import { AdUser } from "./getUsersBirthday";

async function getWorkplaceUserId(userEmail: string, wpAccessToken: string): Promise<string> {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${wpAccessToken}`
        }
    };
    const url = `https://graph.facebook.com/${userEmail}`;

    const wpUserGetResp = await fetch(url, options);
    const wpUserGetJson = await wpUserGetResp.json();
    return wpUserGetJson.id;
}


export async function postUsersBirthday(context: InvocationContext, userList: AdUser[]) {
    const WP_ACCESS_TOKEN = process.env.WP_ACCESS_TOKEN;
    const GROUP_ID = process.env.GROUP_ID;
    const todayDate = new Date();
    const month = ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];

    const dateWpString = `${todayDate.getDate()} ${month[todayDate.getMonth()]}`;
    
    if (!WP_ACCESS_TOKEN) {
        context.log(`Wp access token not set in the environment...`);
    }

    if (!GROUP_ID) {
        context.log(`Group id to post birthdays not set in env...`);
    }

    const url = `https://graph.facebook.com/${GROUP_ID}/feed`;

    try {
        const wpUserIds = [];

        for (const adUser of userList) {
            context.log(`Fetching user id for email - ${adUser.email}`);
            const wpUserId = await getWorkplaceUserId(adUser.email, WP_ACCESS_TOKEN);
            if (wpUserId) wpUserIds.push(wpUserId);
        }

        let wpUserString = ``;

        for (const wpUser of wpUserIds) {
            wpUserString += `**@[${wpUser}]** `;
        }
        
        const data = {
            message: `🎈🎉 **HAPPY BIRTHDAY!!** 🎉🎈 \n \n **${dateWpString}** - ${wpUserString}`,
            formatting: 'MARKDOWN'
        };

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WP_ACCESS_TOKEN}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        
        const wpResp = await fetch(url, options);
        context.log(`Posting users birthday with data - ${JSON.stringify(data)}`);
        const wpRespJson = await wpResp.json();

        context.log(wpRespJson);  
    } catch (error) {
       context.log(error);
    }
}
