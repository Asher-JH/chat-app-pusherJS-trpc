import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Pusher from "pusher-js";

import { QueryClient, QueryClientProvider } from "react-query";

import "./index.scss";
import { trpc } from "./trpc";

const client = new QueryClient();

const pusher = new Pusher("2524aaeaba44d2041c8f", {
  cluster: "ap1",
});

let hidden = "";
let visibilityChange = "";
if (typeof document.hidden !== "undefined") {
  // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
  // @ts-ignore
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
  // @ts-ignore
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

function handleVisibilityChange() {
  // @ts-ignore
  if (document[hidden]) {
    pusher.disconnect();
  } else {
    pusher.connect();
  }
}

document.addEventListener(visibilityChange, handleVisibilityChange, false);

const AppContent = () => {
  const [auth, setAuth] = useState("");

  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Forms
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  // Queries
  trpc.useQuery(["users.me"], {
    onSuccess(user) {
      setAuth(user.username);
    },
  });
  const groups = trpc.useQuery(["groups.getGroups"]);
  const messages = trpc.useQuery([
    "messages.getMessages",
    { groupId: selectedGroupId || "" },
  ]);

  // Mutations
  const login = trpc.useMutation("auth.login");
  const createGroup = trpc.useMutation("groups.addGroup");
  const createMessage = trpc.useMutation("messages.addMessage");

  // Subscribe
  const groupMessages = pusher.subscribe(selectedGroupId);
  groupMessages.bind("new-message", (d: any) => {
    console.log(d);
    client.invalidateQueries("groups.getGroups");
  });

  const onLogin = () => {
    login.mutate(
      {
        username,
      },
      {
        onSuccess: ({ accessToken, refreshToken }) => {
          localStorage.setItem("access-token", accessToken);
          localStorage.setItem("refresh-token", refreshToken);
        },
      }
    );
  };

  const onCreateGroup = () => {
    createGroup.mutate(
      {
        username: auth,
      },
      {
        onSuccess: (group) => {
          setSelectedGroupId(group.id);
          client.invalidateQueries("groups.getGroups");
        },
      }
    );
  };

  const onSendMessage = () => {
    createMessage.mutate(
      {
        username: auth,
        message,
        groupId: selectedGroupId,
      },
      {
        onSuccess: () => {
          setMessage("");
          client.invalidateQueries("messages.getMessages");
        },
      }
    );
  };

  return (
    <div className="mt-10 text-3xl mx-auto max-w-6xl flex flex-col items-center">
      <div className="text-2xl mx-auto mb-6">Chat</div>
      {!!auth && !selectedGroupId && (
        <>
          {groups.data?.map((group) => (
            <div
              key={group.id}
              onClick={() => {
                setSelectedGroupId(group.id);
                groupMessages.unsubscribe();
              }}
              className="w-1/2 cursor-pointer mb-2 text-sm border rounded-lg border-1 border-black p-2"
            >
              Group #{group.id}
            </div>
          ))}
          <button
            onClick={onCreateGroup}
            className="w-60 mt-8 text-sm text-white bg-blue-900 rounded-lg text-center p-2"
          >
            Create Group
          </button>
        </>
      )}
      {!!auth && !!selectedGroupId && (
        <>
          <button onClick={() => setSelectedGroupId("")}>Go Back</button>
          <div className="text-lg underline">Group #{selectedGroupId}</div>
          <div className="mt-5 py-4 px-1 rounded-sm  w-1/2 flex flex-col">
            {messages.data?.length ? (
              messages.data.map((message) => (
                <div
                  key={message.id}
                  className={`${
                    message.sender.username === auth
                      ? "ml-auto items-end"
                      : "mr-auto items-start"
                  } flex flex-col  mb-2 w-1/2`}
                >
                  <div className="text-xs">({message.sender.username})</div>
                  <div className="w-4/5 text-left p-2 text-sm border border-1 rounded-lg border-gray-500">
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-center text-gray-500">
                No messages to display
              </div>
            )}
          </div>
          <input
            name="message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-1/2 mt-8 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 mb-1"
            placeholder="Type your message here..."
          />
          <button
            onClick={onSendMessage}
            className="w-1/2 text-sm text-white bg-blue-900 rounded-lg text-center p-2"
          >
            Log In
          </button>
        </>
      )}
      {!auth && (
        <>
          <input
            name="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-60 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 mb-4"
            placeholder="Username"
          />
          <button
            onClick={onLogin}
            className="w-60 text-sm text-white bg-blue-900 rounded-lg text-center p-2"
          >
            Log In
          </button>
        </>
      )}
    </div>
  );
};

const App = () => {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: "http://localhost:5000/trpc",
      headers() {
        return {
          authorization: "Bearer " + localStorage.getItem("access-token"),
        };
      },
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={client}>
      <QueryClientProvider client={client}>
        <AppContent />
      </QueryClientProvider>
    </trpc.Provider>
  );
};
ReactDOM.render(<App />, document.getElementById("app"));
