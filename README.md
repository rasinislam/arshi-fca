# RASIN-FCA


> **Unofficial Facebook Chat API for NodeJS** - Interact with Facebook Messenger Bot
> 
> **Developed by Rasin**


## 📦 Installation

```bash
npm install arshi-fca
```

Or with yarn:

```bash
yarn add arshi-fca
```

## 🔄 Auto-Update Feature

Rasin Fca includes an **automatic update system** that keeps your package up-to-date seamlessly:


### For Bot Projects


- ✅ Detect when a new version is available
- ✅ Automatically update to the latest version via npm
- ✅ Update your `node_modules/arshi-fca` folder
- ✅ Restart your bot with the new version

### Manual Update

You can also update manually:

```bash
npm install arshi-fca@latest
```

Or check for updates programmatically:

```javascript
const { checkForFCAUpdate } = require('arshi-fca/checkUpdate.js');
await checkForFCAUpdate();
```

### Update Notifications

The auto-update system will:
- Show the current and latest versions
- Display recent changes from the changelog
- Inform you when the update is complete
- Automatically restart your application

**Note**: Updates are non-blocking and won't interrupt your bot's startup if the update check fails.

## ⚠️ Important Disclaimer

**We are not responsible if your account gets banned for spammy activities such as:**

- Sending lots of messages to people you don't know
- Sending messages very quickly
- Sending spammy looking URLs
- Logging in and out very quickly

**Recommendation:** Use Firefox browser or [this website](https://fca.dongdev.id.vn) to reduce logout issues, especially for iOS users.

**Support:** If you encounter errors, contact us [here](https://www.facebook.com/mdong.dev)

## 🔍 Introduction

Facebook now has an [official API for chat bots](https://developers.facebook.com/docs/messenger-platform), however it's only available for Facebook Pages.

`arshi-fca` is the only API that allows you to automate chat functionalities on a **user account** by emulating the browser. This means:

- Making the exact same GET/POST requests as a browser
- Does not work with auth tokens
- Requires Facebook account credentials (email/password) or AppState

## 📦 Installation

```bash
npm install arshi-fca@latest
```

## 🚀 Basic Usage

### 1. Login and Simple Echo Bot

```javascript
const login = require("arshi-fca");

login({ appState: [] }, (err, api) => {
    if (err) return console.error(err);

    api.listenMqtt((err, event) => {
        if (err) return console.error(err);

        // Echo back the received message
        api.sendMessage(event.body, event.threadID);
    });
});
```

### 2. Send Text Message

```javascript
const login = require("arshi-fca");

login({ appState: [] }, (err, api) => {
    if (err) {
        console.error("Login Error:", err);
        return;
    }

    let yourID = "000000000000000"; // Replace with actual Facebook ID
    let msg = "Hey!";

    api.sendMessage(msg, yourID, err => {
        if (err) console.error("Message Sending Error:", err);
        else console.log("Message sent successfully!");
    });
});
```

**Tip:** To find your Facebook ID, look inside the cookies under the name `c_user`

### 3. Send File/Image

```javascript
const login = require("arshi-fca");
const fs = require("fs");

login({ appState: [] }, (err, api) => {
    if (err) {
        console.error("Login Error:", err);
        return;
    }

    let yourID = "000000000000000";
    let imagePath = __dirname + "/image.jpg";

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
        console.error("Error: Image file not found!");
        return;
    }

    let msg = {
        body: "Hey!",
        attachment: fs.createReadStream(imagePath)
    };

    api.sendMessage(msg, yourID, err => {
        if (err) console.error("Message Sending Error:", err);
        else console.log("Message sent successfully!");
    });
});
```

## 📝 Message Types

| Type                   | Usage                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| **Regular text** | `{ body: "message text" }`                                      |
| **Sticker**      | `{ sticker: "sticker_id" }`                                     |
| **File/Image**   | `{ attachment: fs.createReadStream(path) }` or array of streams |
| **URL**          | `{ url: "https://example.com" }`                                |
| **Large emoji**  | `{ emoji: "👍", emojiSize: "large" }` (small/medium/large)      |

**Note:** A message can only be a regular message (which can be empty) and optionally **one of the following**: a sticker, an attachment, or a URL.

## 💾 Saving AppState to Avoid Re-login

### Save AppState

```javascript
const fs = require("fs");
const login = require("arshi-fca");

const credentials = { appState: [] };

login(credentials, (err, api) => {
    if (err) {
        console.error("Login Error:", err);
        return;
    }

    try {
        const appState = JSON.stringify(api.getAppState(), null, 2);
        fs.writeFileSync("appstate.json", appState);
        console.log("✅ AppState saved successfully!");
    } catch (error) {
        console.error("Error saving AppState:", error);
    }
});
```

### Use Saved AppState

```javascript
const fs = require("fs");
const login = require("arshi-fca");

login(
    { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) },
    (err, api) => {
        if (err) {
            console.error("Login Error:", err);
            return;
        }

        console.log("✅ Logged in successfully!");
        // Your code here
    }
);
```

**Alternative:** Use [c3c-fbstate](https://github.com/c3cbot/c3c-fbstate) to get fbstate.json

## 👂 Listening for Messages

### Echo Bot with Stop Command

```javascript
const fs = require("fs");
const login = require("arshi-fca");

login(
    { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) },
    (err, api) => {
        if (err) {
            console.error("Login Error:", err);
            return;
        }

        // Enable listening to events (join/leave, title change, etc.)
        api.setOptions({ listenEvents: true });

        const stopListening = api.listenMqtt((err, event) => {
            if (err) {
                console.error("Listen Error:", err);
                return;
            }

            // Mark as read
            api.markAsRead(event.threadID, err => {
                if (err) console.error("Mark as read error:", err);
            });

            // Handle different event types
            switch (event.type) {
                case "message":
                    if (event.body && event.body.trim().toLowerCase() === "/stop") {
                        api.sendMessage("Goodbye…", event.threadID);
                        stopListening();
                        return;
                    }
                    api.sendMessage(`TEST BOT: ${event.body}`, event.threadID);
                    break;

                case "event":
                    console.log("Event Received:", event);
                    break;
            }
        });
    }
);
```

### Listen Options

```javascript
api.setOptions({
    listenEvents: true,  // Receive events (join/leave, rename, etc.)
    selfListen: true,    // Receive messages from yourself
    logLevel: "silent"   // Disable logs (silent/error/warn/info/verbose)
});
```

**By default:**

- `listenEvents` is `false` - won't receive events like joining/leaving chat, title changes
- `selfListen` is `false` - will ignore messages sent by the current account



### Other Use Cases

ARSHi-FCA can be used for any Facebook Messenger bot project or automation tool. If you want to create your own messenger bot or use this API for other purposes, feel free to integrate it into your project.

## 📚 Full API Documentation

See [DOCS.md](./DOCS.md) for detailed information about:

- All available API methods
- Parameters and options
- Event types
- Error handling
- Advanced usage examples

## 🎯 Quick Reference

### Common API Methods

```javascript
// Send message
api.sendMessage(message, threadID, callback);

// Send typing indicator
api.sendTypingIndicator(threadID, callback);

// Mark as read
api.markAsRead(threadID, callback);

// Get user info
api.getUserInfo(userID, callback);

// Get thread info
api.getThreadInfo(threadID, callback);

// Change thread color
api.changeThreadColor(color, threadID, callback);

// Change thread emoji
api.changeThreadEmoji(emoji, threadID, callback);

// Set message reaction
api.setMessageReaction(reaction, messageID, callback);
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

## 👨‍💻 Author

**Developer Rasin**
[Facebook](https://www.facebook.com/your.bbz.xyz)

## ⭐ Support

If this project is helpful, please give it a ⭐ on GitHub!

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/arshi-fca)
- [GitHub Repository](https://github.com/rasinislam/arshi-fca)
- [Issues](https://github.com/rasinislam/arshi-fca/issues)

---

**Disclaimer:** This is an unofficial API and is not officially supported by Facebook. Use responsibly and comply with [Facebook Terms of Service](https://www.facebook.com/terms.php).