const webpush = require('web-push')

webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    'BFFwMS26GNxggpTKQGJEQCXHgle4LWlMSJ-OEG_8J7B-MSCzAMH0_QUGxVhMtl0VTOwAeGKofrk7-DqjD051tFo',
    '1nBoiR_2FoypzT4bAnq-gOkStgCk6xnaUQmJshXaIco'
)

// send notifs to friends
// first query for all the friends of the user
// then query for the subscription ids of the friends of the user
// send each friend a notification

export async function notifyFriends(userId) {

    const friendsQuery = "SELECT * FROM friends WHERE user1_id = $1 OR user2_id = $1";
    const friendsResult = await client.query(friendsQuery, [userId]);
    const friends = friendsResult.rows;

    const subscriptionIdsQuery = "SELECT notification_subscription_id FROM your_table_name WHERE user_id = ANY($1::int[])";
    const subscriptionIdsResult = await client.query(subscriptionIdsQuery, [friends.map(friend => friend.user1_id, friend.user2_id)]);
    const subscriptionIds = subscriptionIdsResult.rows.map(row => row.notification_subscription_id);

    const subscriptionsQuery = "SELECT * FROM notifSubscriptions WHERE subscription_id = ANY($1::int[])";
    const subscriptionsResult = await client.query(subscriptionsQuery, [subscriptionIds]);
    const subscriptions = subscriptionsResult.rows;

    webpush.sendNotification(pushSubscriptionObject, 'Your Push Payload Text');



}





//var pushSubscriptionObject = {}


//webpush.sendNotification(pushSubscriptionObject, 'Your Push Payload Text');

