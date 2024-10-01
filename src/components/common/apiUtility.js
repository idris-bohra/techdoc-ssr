import { getCurrentOrg, getCurrentUser } from "../auth/authServiceV2";

export async function getParseCurlData(curl) {
    let viaSocketUrl = 'https://flow-api.viasocket.com/utility/parse-curl';
    const response = await fetch(viaSocketUrl, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMzE4NiIsIm9yZ19pZCI6IjQwMDkiLCJjb21wYW55X2lkIjoiNDAwOSIsInZpYXNvY2tldF90b2tlbiI6dHJ1ZSwiaWF0IjoxNzExOTY3NjQxfQ.Vi1NEAQlC1ng3m40cs6cGxg32FDqH90wxZCPLMJFn1Y' 
        },
        body: JSON.stringify({ curl }) 
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json(); 
}

export async function inviteuserMail(email) {
    let viaSocketUrl = 'https://flow.sokt.io/func/scriOLOYbi0d';
    await fetch(viaSocketUrl, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            receiverEmail: email,
            senderEmail: getCurrentUser()?.email,
            organizationName: getCurrentOrg()?.name
        }) 
    });
}

