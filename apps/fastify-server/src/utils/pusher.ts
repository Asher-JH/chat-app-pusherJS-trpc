import Pusher from "pusher";

const pusher = new Pusher({
  appId: "1494058",
  key: "2524aaeaba44d2041c8f",
  secret: "4873db7e914148e5e6b6",
  cluster: "ap1",
});

export { pusher };
