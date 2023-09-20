import { InvocationContext } from "@azure/functions";

export interface AdUser {
    birthday: string;
    email: string;
}

export async function getAdUsersAndBirthdays(context: InvocationContext): Promise<AdUser[]> {
    const AD_ACCESS_TOKEN = process.env.AD_ACCESS_TOKEN;
    let entriesRead = 0;
    const adUserList = [];

    if (!AD_ACCESS_TOKEN) {
        throw Error('AD access token not set in the environment.');
    }

    try {
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AD_ACCESS_TOKEN}`,
                'consistencyLevel': 'eventual'
            }
        };
        const url = `https://graph.microsoft.com/v1.0/users?$select=mail,userprincipalname,onPremisesExtensionAttributes&$count=true`;
        context.log(`Making graph api request to ${url}...`);
    
        const adResponse = await fetch(url, options);
        let adJson = await adResponse.json();
        let hasPaginatedResponse = false;

        if ("@odata.count" in adJson) {
            entriesRead += adJson["@odata.count"];
        }

        if ("value" in adJson) {
            for (const adEntry of adJson.value) {
                const adUser: AdUser = {birthday: adEntry['onPremisesExtensionAttributes']['extensionAttribute2'],
                                        email: adEntry['userPrincipalName']
                                    };
                adUserList.push(adUser);
            }
        } 

        if ("@odata.nextLink" in adJson) {
            hasPaginatedResponse = true;
            while (hasPaginatedResponse) {
                const nextLink = adJson["@odata.nextLink"];
                context.log(`Making graph api request to ${nextLink}...`);
                const adNextResponse = await fetch(nextLink, options);
                const adNextJson = await adNextResponse.json();
                
                if ("value" in adNextJson) {
                    for (const adEntry of adJson.value) {
                        const adUser: AdUser = {birthday: adEntry['onPremisesExtensionAttributes']['extensionAttribute2'],
                                                email: adEntry['userPrincipalName']
                                            };
                        adUserList.push(adUser);
                    }
                }

                if (!("@odata.nextLink" in adNextJson)) {
                    hasPaginatedResponse = false;
                }
                adJson = adNextJson;
            }
        } 
        
    } catch (error) {
        context.log(error); 
    }
    context.log(`${adUserList.length} entries in the ad use list...`)
    context.log(`${entriesRead} entries read during the function run...`);
    return adUserList;
}