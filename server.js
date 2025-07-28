// server.js
// Node.js Express backend for system commands and info
const express = require('express');
const cors = require('cors');
const os = require('os');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

// System Info Endpoint
app.get('/api/system-info', (req, res) => {
  const info = {
    cpuUsage: os.loadavg()[0],
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    platform: os.platform(),
    arch: os.arch(),
    uptime: os.uptime(),
    hostname: os.hostname(),
    userInfo: os.userInfo(),
  };
  res.json(info);
});

// System Command Endpoint
app.post('/api/command', (req, res) => {
  const { command } = req.body;
  let cmd;
  switch (command) {
    case 'shutdown':
      cmd = 'shutdown /s /t 0';
      break;
    case 'restart':
      cmd = 'shutdown /r /t 0';
      break;
    case 'lock':
      cmd = 'rundll32.exe user32.dll,LockWorkStation';
      break;
    default:
      return res.status(400).json({ error: 'Unknown command' });
  }
  exec(cmd, (error) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`System backend running on port ${PORT}`);
});
