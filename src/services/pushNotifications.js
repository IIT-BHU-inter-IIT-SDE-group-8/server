const webpush = require('web-push')
const { client } = require("../config/configDB.js")
const { getAllCommunityRequestObjects } = require('../controllers/communityRequestController.js')

webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    'BKUc_OvdGM4KqyMIt9Cx6oFzkyz7U1pRV01Ykhrp0q25EQulA2d5vmjhCWk3f2twLJ8Q89awxUEobuS30cBh-7U',
    'SmQejCayuFIltL5_FIO_bWJ5eo1idQaoS9ieXnMVVrg'
)

// send notifs to friends
// first query for all the friends of the user
// then query for the subscription ids of the friends of the user
// send each friend a notification

//TODO: high time complexity, optimizations are welcome
async function sendSecurityNotif(userId, message) {
    const allEntries = new Set()
    const friends = await getAllFriendsSubscriptions(userId)
    friends.forEach((object) => {
        allEntries.add(object)
    })
    const communities = await getAllCommunitiesOfUser(userId)
    communities.forEach(async (communityId) => {
        const communitySubscriptions = await getAllCommunityMembersSubscription(communityId)
        communitySubscriptions.forEach((object) => {
            allEntries.add(object)
        })
    })
    sendNotification(allEntries, message)

}

async function notifyFriends(userId, message) {
    try {
        notifObjects = await getAllFriendsSubscriptions(userId)
        sendNotification(notifObjects, message)
    }
    catch (err) {
        console.log("error while sending notifications to friends: " + err)
    }
}

async function notifyCommunityMembers(communityId, message) {
    try {
        const notifObjects = await getAllCommunityMembersSubscription(communityId)
        sendNotification(notifObjects, message)
    }
    catch {
        console.log("Error occurred while notifying all community members" + err)
    }
}


async function getAllFriendsSubscriptions(userId) {

    try {
        const friends = new Set()
        const friendsQuery = `
    SELECT
    CASE
    WHEN user1_id = $1 THEN user2_id
    ELSE user1_id
    END AS friend_id
    FROM friendship
    WHERE user1_id = $1 OR user2_id = $1;
`
        const communityUsers = await client.query(friendsQuery, [userId]);
        communityUsers.rows.forEach((friend) => {
            friends.add(friend.friend_id)
        });


        const notifObjects = await client.query(`SELECT n.*
      FROM notifs n
      JOIN user_notif un ON n.notif_id = un.notif_id
      WHERE un.user_id = ANY($1::int[]);
`, [[...friends]])

        return notifObjects
    }
    catch (err) {
        console.log("Error occurred while fetching the subscription ids of all the friends of user: " + err)

    }
}

async function getAllCommunityMembersSubscription(communityId) {

    try {
        const friends = new Set()
        const communityQuery = `
    SELECT
    user_id FROM community_users
    WHERE community_id = $1;
`
        const communityUsers = await client.query(communityQuery, [communityId]);
        communityUsers.rows.forEach((row) => {
            friends.add(row.user_id)
        });


        const notifObjects = await client.query(`SELECT n.*
      FROM notifs n
      JOIN user_notif un ON n.notif_id = un.notif_id
      WHERE un.user_id = ANY($1::int[]);
`, [[...friends]])

        return notifObjects
    }
    catch (err) {
        console.log("Error while fetching subscription ids of all the community members of user: " + err)
    }


}
async function getAllCommunitiesOfUser(userId) {
    try {
        const communities = new Set()
        const communityIds = await client.query("SELECT community_id from community_users WHERE user_id = $1", [userId])
        communityIds.forEach((row) => {
            communities.add(row.community_id)
        })
        return communities
    }
    catch (err) {
        console.log("Error occurred while getting all community ids of user: " + err)
    }
}
function sendNotification(notifObjects, message) {
    notifObjects.rows.forEach((result) => {
        let sub = { endpoint: result.endpoint, expiration_time: result.expiration_time, keys: { auth: result.auth, p256dh: result.p256dh } }
        webpush.sendNotification(sub, message);
    })
}
module.exports = { sendSecurityNotif, notifyFriends, notifyCommunityMembers }


//var pushSubscriptionObject = {}


//webpush.sendNotification(pushSubscriptionObject, 'Your Push Payload Text');

