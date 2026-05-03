# AutoVoicePro (Discord Bot)

**AutoVoicePro** is a high-performance Discord bot built with **Node.js** and **Discord.js**. It automates the creation of temporary voice channels and manages them efficiently with a custom JSON-based database system.

## 🚀 Features
* **Auto-Voice Channels:** Automatically creates a new voice channel when a user joins the "Join to Create" channel.
* **Smart Deletion:** Deletes the temporary channel once the last person leaves to keep the server clean.
* **Custom Database:** Uses a custom-built JSON storage system to track active voice channels across multiple servers.
* **Multi-Server Support:** Optimized to handle multiple Discord guilds simultaneously.
* **Lightweight & Fast:** Minimal resource usage with optimized event handling.

## ⚙️ How it Works
When a user joins the master channel, the bot clones the settings and creates a new temporary sub-channel, moving the user automatically. Once all users leave, the channel is instantly deleted, keeping the server organized.

## 🛠️ Tech Stack
* **Language:** JavaScript
* **Runtime:** Node.js
* **Library:** Discord.js v14
* **Database:** JSON (Local Storage)

## 📁 Project Structure
```text
├── commands/         # Bot commands folder (8 items)
├── database/         # Database storage folder (2 items)
├── config.json       # Bot configuration and tokens
├── index.js          # Main entry point of the bot
├── LICENSE           # Project license (MIT)
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## ⚙️ Installation & Setup
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/MohammadAnjoomC/AutoVoicePro.git](https://github.com/MohammadAnjoomC/AutoVoicePro.git)
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure your Token:**
   Add your Discord Bot Token to the config file
4. **Run the bot:**
   ```bash
   node index.js
   ```

---

## 👨‍💻 About the Developer
**Mohammad Anjoom C (Anju)**
* **Role:** Student & Self-taught Web Developer
* **Location:** Kerala, India
* **Skills:** Node.js, PHP, JavaScript, Discord.js
* **GitHub:** [MohammadAnjoomC](https://github.com/MohammadAnjoomC)
